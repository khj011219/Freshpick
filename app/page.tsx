"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { Ingredient, Recipe, RecipeWithMatch, AppTab } from '@/types';
import { HomeTab } from '@/components/HomeTab';
import { IngredientsTab } from '@/components/IngredientsTab';
import { RecipesTab } from '@/components/RecipesTab';
import { NavBar } from '@/components/NavBar';
import { AddIngredientModal } from '@/components/AddIngredientModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIngredients();
    fetchRecipes();
  }, []);

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("expire_date", { ascending: true });

    if (!error && data) {
      setIngredients(
        data.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expiryDate: item.expire_date,
          category: item.category,
        }))
      );
    }
  };

  const addIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from("ingredients").insert([
      {
        name: formData.get("name"),
        quantity: Number(formData.get("quantity")),
        unit: formData.get("unit"),
        expire_date: formData.get("expiry"),
        category: formData.get("category"),
      },
    ]);

    if (!error) {
      fetchIngredients();
      setIsAdding(false);
    }
  };

  const removeIngredient = async (id: string) => {
    await supabase.from("ingredients").delete().eq("id", id);
    fetchIngredients();
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select(`*, recipe_ingredients ( ingredient_name )`);

    if (!error && data) {
      setRecipes(data);
    }
  };

  const recipeMatches: RecipeWithMatch[] = useMemo(() => {
    return recipes
      .map(recipe => {
        const availableNames = ingredients.map(i => i.name.toLowerCase());
        const recipeIngredients =
          recipe.recipe_ingredients?.map(ri => ri.ingredient_name.toLowerCase()) || [];

        const matched = recipeIngredients.filter(ing =>
          availableNames.some(name => name.includes(ing) || ing.includes(name))
        );

        const matchRate =
          recipeIngredients.length === 0
            ? 0
            : Math.round((matched.length / recipeIngredients.length) * 100);

        return { ...recipe, matchRate };
      })
      .sort((a, b) => b.matchRate - a.matchRate);
  }, [recipes, ingredients]);

  const expiringSoon = ingredients.filter(i => {
    const diff = Math.ceil(
      (new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff >= 0 && diff <= 3;
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden font-sans">
      <main>
        {activeTab === 'home' && (
          <HomeTab
            ingredients={ingredients}
            expiringSoon={expiringSoon}
            recipeMatches={recipeMatches}
            onNavigate={setActiveTab}
          />
        )}
        {activeTab === 'ingredients' && (
          <IngredientsTab
            ingredients={ingredients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddClick={() => setIsAdding(true)}
            onRemove={removeIngredient}
          />
        )}
        {activeTab === 'recipes' && (
          <RecipesTab
            recipeMatches={recipeMatches}
            ingredients={ingredients}
          />
        )}
      </main>

      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AddIngredientModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        onSubmit={addIngredient}
      />
    </div>
  );
}
