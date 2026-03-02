export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  steps: string;
  created_at: string;
  recipe_ingredients: {
    ingredient_name: string;
  }[];
};

export type RecipeWithMatch = Recipe & { matchRate: number };

export type AppTab = "home" | "ingredients" | "recipes";

export type RecommendedRecipe = {
  id: string;
  title: string;
  image_url: string | null;
  isAuthenticated: boolean;
  score: number;
  matchRate: number;          // 0~100 정수
  totalIngredients: number;
  matchedIngredients: number;
  urgentUsedCount: number;
  missingIngredients: string[];
};
