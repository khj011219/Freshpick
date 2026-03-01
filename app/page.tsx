"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import { Ingredient, Recipe, RecipeWithMatch, AppTab } from '@/types';
import { LoginScreen } from '@/components/LoginScreen';
import { HomeTab } from '@/components/HomeTab';
import { IngredientsTab } from '@/components/IngredientsTab';
import { RecipesTab } from '@/components/RecipesTab';
import { NavBar } from '@/components/NavBar';
import { AddIngredientModal } from '@/components/AddIngredientModal';

function HomeApp() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AppTab) || 'home';
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 세션 초기화 및 변경 감지
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 로그인 상태가 되면 데이터 로드
  useEffect(() => {
    if (session) {
      fetchIngredients();
      fetchRecipes();
    } else {
      setIngredients([]);
      setRecipes([]);
    }
  }, [session]);

  const fetchIngredients = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("user_id", session.user.id)
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("ingredients").insert([
      {
        user_id: session.user.id,
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 세션 확인 중
  if (session === undefined) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 미로그인
  if (session === null) {
    return <LoginScreen />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden font-sans">
      <main>
        {activeTab === 'home' && (
          <HomeTab
            ingredients={ingredients}
            expiringSoon={expiringSoon}
            recipeMatches={recipeMatches}
            onNavigate={setActiveTab}
            onLogout={handleLogout}
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
            ingredientCount={ingredients.length}
            urgentCount={expiringSoon.length}
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeApp />
    </Suspense>
  );
}
