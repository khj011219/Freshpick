import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── DB row types ───────────────────────────────────────────────────────────

type DbIngredient = {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  expire_date: string;
};

type DbRecipeIngredient = {
  id: string;
  recipe_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  is_essential: boolean;
};

type DbRecipe = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  steps: string[];
  recipe_ingredients: DbRecipeIngredient[];
};

// ─── Response type ───────────────────────────────────────────────────────────

type RecommendationResult = {
  recipe_id: string;
  title: string;
  description: string;
  image_url: string;
  score: number;
  match_rate: number;
  total_ingredients: number;
  matched_ingredients: number;
  missing_ingredients: string[];
  expiring_ingredients: string[];
};

// ─── Route handler ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);
  const supabase = createClient(accessToken);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    { data: ingredients, error: ingredientsError },
    { data: recipes, error: recipesError },
  ] = await Promise.all([
    supabase.from("ingredients").select("*").eq("user_id", user.id),
    supabase.from("recipes").select("*, recipe_ingredients(*)"),
  ]);

  if (ingredientsError) {
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
  if (recipesError) {
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 소문자 재료명 → 유통기한 맵
  const ingredientMap = new Map<string, string>();
  for (const ing of (ingredients as DbIngredient[]) ?? []) {
    ingredientMap.set(ing.name.toLowerCase(), ing.expire_date);
  }

  const results: RecommendationResult[] = (
    (recipes as DbRecipe[]) ?? []
  ).map((recipe) => {
    const recipeIngredients = recipe.recipe_ingredients ?? [];
    const totalCount = recipeIngredients.length;

    let matchedCount = 0;
    let maxExpiryScore = 0;
    const missingIngredients: string[] = [];
    const expiringIngredients: string[] = [];

    for (const ri of recipeIngredients) {
      const riName = ri.ingredient_name.toLowerCase();
      const expireDate = ingredientMap.get(riName);

      if (expireDate !== undefined) {
        matchedCount++;

        // 유통기한 임박 점수 (가장 높은 점수 1개만 반영)
        const expire = new Date(expireDate);
        expire.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil(
          (expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft <= 3) {
          expiringIngredients.push(ri.ingredient_name);
          maxExpiryScore = Math.max(maxExpiryScore, 40);
        } else if (daysLeft <= 7) {
          expiringIngredients.push(ri.ingredient_name);
          maxExpiryScore = Math.max(maxExpiryScore, 20);
        }
      } else {
        missingIngredients.push(ri.ingredient_name);
      }
    }

    // 재료 충족률 점수
    const matchRate = totalCount === 0 ? 0 : matchedCount / totalCount;
    const matchScore = matchRate * 40;

    // 필수 재료 부족 패널티
    const missingEssentialCount = recipeIngredients.filter(
      (ri) =>
        ri.is_essential && !ingredientMap.has(ri.ingredient_name.toLowerCase())
    ).length;
    const penalty = missingEssentialCount * 20;

    const score = Math.max(
      0,
      Math.round(maxExpiryScore + matchScore - penalty)
    );

    return {
      recipe_id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      score,
      match_rate: Math.round(matchRate * 100) / 100,
      total_ingredients: totalCount,
      matched_ingredients: matchedCount,
      missing_ingredients: missingIngredients,
      expiring_ingredients: expiringIngredients,
    };
  });

  results.sort((a, b) => b.score - a.score);

  return NextResponse.json(results);
}
