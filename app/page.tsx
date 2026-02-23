"use client"

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  ChefHat,
  Refrigerator,
  Home as HomeIcon,
  Calendar,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from "@/lib/supabase";

// --- Components ---

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  category: string;
};

type Recipe = {
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

type AppTab = "home" | "ingredients" | "recipes";

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 px-4 transition-colors ${active ? 'text-brand-600' : 'text-slate-400'
      }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const StatusBadge = ({ expiryDate }: { expiryDate: string }) => {
  const diff = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-danger-50 text-danger-500 uppercase">
      Expired
    </span>
  );
  if (diff <= 3) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-50 text-warning-500 uppercase">
      {diff === 0 ? 'Today' : `${diff} days left`}
    </span>
  );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-600 uppercase">
      Safe
    </span>
  );
};

// --- Main App ---

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("expire_date", { ascending: true });

    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expire_date,
        category: item.category,
      }));
      setIngredients(formatted);
    }
  };

  const addIngredient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newIng = {
      name: formData.get("name"),
      quantity: Number(formData.get("quantity")),
      unit: formData.get("unit"),
      expire_date: formData.get("expiry"),
      category: formData.get("category"),
    };

    const { error } = await supabase
      .from("ingredients")
      .insert([newIng]);

    if (!error) {
      fetchIngredients();
      setIsAdding(false);
    }
  };

  const removeIngredient = async (id: string) => {
    await supabase
      .from("ingredients")
      .delete()
      .eq("id", id);

    fetchIngredients();
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        recipe_ingredients (
          ingredient_name
        )
      `);

    if (!error && data) {
      setRecipes(data);
    }
  };

  const recipeMatches = useMemo(() => {
    return recipes.map(recipe => {
      const availableNames = ingredients.map(i =>
        i.name.toLowerCase()
      );

      const recipeIngredients =
        recipe.recipe_ingredients?.map(ri =>
          ri.ingredient_name.toLowerCase()
        ) || [];

      const matched = recipeIngredients.filter(ing =>
        availableNames.some(name =>
          name.includes(ing) || ing.includes(name)
        )
      );

      const matchRate =
        recipeIngredients.length === 0
          ? 0
          : Math.round(
            (matched.length / recipeIngredients.length) * 100
          );

      return { ...recipe, matchRate };
    }).sort((a, b) => b.matchRate - a.matchRate);
  }, [recipes, ingredients]);

  const expiringSoon = ingredients.filter(i => {
    const diff = Math.ceil((new Date(i.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  });

  const renderHome = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      <header className="px-6 pt-12 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Freshpick</h1>
        <p className="text-slate-500 text-sm mt-1">Reduce waste, eat better.</p>
      </header>

      {/* Quick Stats */}
      <section className="px-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl ios-shadow border border-slate-100">
            <div className="flex items-center gap-2 text-brand-600 mb-1">
              <Refrigerator size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Inventory</span>
            </div>
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Items tracked</div>
          </div>
          <div className="bg-white p-4 rounded-2xl ios-shadow border border-slate-100">
            <div className="flex items-center gap-2 text-warning-500 mb-1">
              <AlertCircle size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Expiring</span>
            </div>
            <div className="text-2xl font-bold">{expiringSoon.length}</div>
            <div className="text-[10px] text-slate-400 font-medium uppercase">Within 3 days</div>
          </div>
        </div>
      </section>

      {/* Expiring Soon List */}
      {expiringSoon.length > 0 && (
        <section className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Expiring Soon</h2>
            <button onClick={() => setActiveTab('ingredients')} className="text-brand-600 text-xs font-semibold">See All</button>
          </div>
          <div className="space-y-3">
            {expiringSoon.slice(0, 3).map(ing => (
              <div key={ing.id} className="bg-white p-4 rounded-2xl ios-shadow flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center text-warning-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{ing.name}</h3>
                    <p className="text-xs text-slate-400">{ing.quantity} {ing.unit}</p>
                  </div>
                </div>
                <StatusBadge expiryDate={ing.expiryDate} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Recommendations */}
      <section className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recommended for You</h2>
          <button onClick={() => setActiveTab('recipes')} className="text-brand-600 text-xs font-semibold">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
          {recipeMatches.slice(0, 3).map(recipe => (
            <div
              key={recipe.id}
              className="min-w-[280px] bg-white rounded-3xl ios-shadow overflow-hidden border border-slate-100 group"
            >
              <div className="relative h-40">
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-brand-600 shadow-sm border border-white/20">
                  {recipe.matchRate}% Match
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{recipe.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Clock size={12} /> recipe.prepTime m</span>
                  <span className="flex items-center gap-1"><ChefHat size={12} /> recipe.difficulty</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );

  const renderIngredients = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">My Fridge</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-600/20 active:scale-95 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search ingredients..."
            className="w-full bg-white border-none rounded-2xl py-3 pl-10 pr-4 text-sm ios-shadow focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="px-6 space-y-4 mt-2">
        {ingredients
          .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
          .map(ing => (
            <motion.div
              layout
              key={ing.id}
              className="bg-white p-4 rounded-2xl ios-shadow border border-slate-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ing.category === 'Produce' ? 'bg-emerald-50 text-emerald-500' :
                  ing.category === 'Dairy' ? 'bg-blue-50 text-blue-500' :
                    ing.category === 'Meat' ? 'bg-rose-50 text-rose-500' :
                      'bg-slate-50 text-slate-500'
                  }`}>
                  <Refrigerator size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{ing.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{ing.quantity} {ing.unit} • {ing.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge expiryDate={ing.expiryDate} />
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="p-2 text-slate-300 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}

        {ingredients.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Refrigerator size={40} />
            </div>
            <h3 className="text-slate-900 font-bold">Your fridge is empty</h3>
            <p className="text-slate-400 text-sm mt-1">Add ingredients to get recipe suggestions.</p>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderRecipes = () => (
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
          <div key={recipe.id} className="bg-white rounded-[32px] ios-shadow overflow-hidden border border-slate-100">
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingredients you have:</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.recipe_ingredients.map(ri => {
                    const ing = ri.ingredient_name;

                    const hasIt = ingredients.some(i =>
                      i.name.toLowerCase().includes(ing.toLowerCase()) ||
                      ing.toLowerCase().includes(i.name.toLowerCase())
                    );

                    return (
                      <span
                        key={ing}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 ${hasIt
                          ? "bg-brand-50 text-brand-600"
                          : "bg-slate-50 text-slate-400"
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

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative overflow-x-hidden font-sans">
      {/* Content */}
      <main>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'ingredients' && renderIngredients()}
        {activeTab === 'recipes' && renderRecipes()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-100 safe-area-bottom z-40">
        <div className="flex justify-around items-center h-16">
          <TabButton
            active={activeTab === 'home'}
            onClick={() => setActiveTab('home')}
            icon={HomeIcon}
            label="Home"
          />
          <TabButton
            active={activeTab === 'ingredients'}
            onClick={() => setActiveTab('ingredients')}
            icon={Refrigerator}
            label="Fridge"
          />
          <TabButton
            active={activeTab === 'recipes'}
            onClick={() => setActiveTab('recipes')}
            icon={ChefHat}
            label="Recipes"
          />
        </div>
      </nav>

      {/* Add Ingredient Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[40px] p-8 z-50 safe-area-bottom"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add Ingredient</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={addIngredient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ingredient Name</label>
                  <input
                    name="name"
                    required
                    autoFocus
                    placeholder="e.g. Avocado"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                    <input
                      name="quantity"
                      type="number"
                      required
                      placeholder="1"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                    <select
                      name="unit"
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none appearance-none"
                    >
                      <option value="pcs">pcs</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Expiration Date</label>
                  <input
                    name="expiry"
                    type="date"
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {['Produce', 'Dairy', 'Meat', 'Pantry', 'Other'].map(cat => (
                      <label key={cat} className="flex-shrink-0 cursor-pointer">
                        <input type="radio" name="category" value={cat} defaultChecked={cat === 'Produce'} className="sr-only peer" />
                        <span className="px-4 py-2 rounded-full bg-slate-50 text-slate-500 text-xs font-bold peer-checked:bg-brand-600 peer-checked:text-white transition-all block">
                          {cat}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand-600/30 active:scale-[0.98] transition-all mt-4"
                >
                  Add to Fridge
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
