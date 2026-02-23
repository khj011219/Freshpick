"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Recipe = {
    id: string;
    title: string;
    description: string;
};

type RecipeIngredient = {
    recipe_id: string;
    ingredient_name: string;
};

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecommendations = async () => {
        // 1️⃣ 사용자 재료 가져오기
        const { data: userIngredients } = await supabase
            .from("ingredients")
            .select("name");

        const userIngredientNames =
            userIngredients?.map((item) => item.name) || [];

        // 2️⃣ 모든 레시피 가져오기
        const { data: recipeList } = await supabase
            .from("recipes")
            .select("*");

        // 3️⃣ 모든 레시피 재료 가져오기
        const { data: recipeIngredients } = await supabase
            .from("recipe_ingredients")
            .select("recipe_id, ingredient_name");

        if (!recipeList || !recipeIngredients) return;

        // 4️⃣ 레시피별 매칭 계산
        const scoredRecipes = recipeList.map((recipe) => {
            const ingredientsForRecipe = recipeIngredients.filter(
                (ri) => ri.recipe_id === recipe.id
            );

            const totalCount = ingredientsForRecipe.length;

            const matchCount = ingredientsForRecipe.filter((ri) =>
                userIngredientNames.includes(ri.ingredient_name)
            ).length;

            const score = totalCount === 0 ? 0 : matchCount / totalCount;

            return {
                ...recipe,
                score,
                matchCount,
                totalCount,
            };
        });

        // 5️⃣ 점수 높은 순 정렬
        scoredRecipes.sort((a, b) => b.score - a.score);

        setRecipes(scoredRecipes);
        setLoading(false);
    };

    useEffect(() => {
        fetchRecommendations();
    }, []);

    if (loading) return <div className="p-10">추천 계산 중...</div>;

    return (
        <div className="p-10 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">추천 레시피</h1>

            {recipes.map((recipe) => (
                <div
                    key={recipe.id}
                    className="border p-4 mb-4 rounded-lg shadow-sm"
                >
                    <h2 className="text-lg font-semibold">
                        {recipe.title}
                    </h2>

                    <p className="text-sm text-gray-600 mb-2">
                        {recipe.description}
                    </p>

                    <p className="text-sm">
                        매칭 재료: {recipe.matchCount} / {recipe.totalCount}
                    </p>

                    <p className="text-sm font-medium text-blue-600">
                        매칭률: {(recipe.score * 100).toFixed(0)}%
                    </p>
                </div>
            ))}
        </div>
    );
}