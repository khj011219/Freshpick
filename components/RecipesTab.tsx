"use client";

import { Clock, ChefHat, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Ingredient, RecipeWithMatch } from '@/types';

type RecipesTabProps = {
  recipeMatches: RecipeWithMatch[];
  ingredients: Ingredient[];
};

export const RecipesTab = ({ recipeMatches, ingredients }: RecipesTabProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pb-24"
  >
    <header className="px-6 pt-12 pb-6">
      <h1 className="text-2xl font-bold text-slate-900">Recommended Recipes</h1>
      <p className="text-slate-400 text-sm mt-1">Based on what you have in stock.</p>
    </header>

    <div className="px-6 space-y-6">
      {recipeMatches.map(recipe => (
        <div
          key={recipe.id}
          className="bg-white rounded-[32px] ios-shadow overflow-hidden border border-slate-100"
        >
          <div className="relative h-56">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 bg-brand-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-brand-600/20">
              {recipe.matchRate}% Match
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900">{recipe.title}</h3>
              <ChevronRight className="text-slate-300" />
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-4">
              <span className="flex items-center gap-1.5"><Clock size={14} /> recipe.prepTime mins</span>
              <span className="flex items-center gap-1.5"><ChefHat size={14} /> recipe.difficulty</span>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Ingredients you have:
              </p>
              <div className="flex flex-wrap gap-2">
                {recipe.recipe_ingredients.map(ri => {
                  const ing = ri.ingredient_name;
                  const hasIt = ingredients.some(
                    i =>
                      i.name.toLowerCase().includes(ing.toLowerCase()) ||
                      ing.toLowerCase().includes(i.name.toLowerCase())
                  );
                  return (
                    <span
                      key={ing}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                        hasIt ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {hasIt ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {ing}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);
