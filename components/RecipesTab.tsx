"use client";

import { useEffect, useState } from 'react';
import { Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

type Recommendation = {
  recipe_id: string;
  title: string;
  description: string;
  image_url: string;
  score: number;
  match_rate: number;
  missing_ingredients: string[];
  expiring_ingredients: string[];
};

export const RecipesTab = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please log in to see recommendations.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/recommend', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error();
        setRecommendations(await res.json());
      } catch {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="pb-24">
        <header className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">Recommended Recipes</h1>
          <p className="text-slate-400 text-sm mt-1">Based on what you have in stock.</p>
        </header>
        <div className="px-6 space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 animate-pulse">
              <div className="h-56 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-24 flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <AlertCircle size={40} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
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
        {recommendations.map(recipe => {
          const matchPct = Math.round(recipe.match_rate * 100);
          return (
            <div
              key={recipe.recipe_id}
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
                  {matchPct}% Match
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{recipe.title}</h3>
                  <ChevronRight className="text-slate-300" />
                </div>

                {recipe.expiring_ingredients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-warning-500 uppercase tracking-widest mb-1.5">
                      Use soon:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.expiring_ingredients.map(name => (
                        <span
                          key={name}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 bg-warning-50 text-warning-600"
                        >
                          <Clock size={12} />
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {recipe.missing_ingredients.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Missing:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.missing_ingredients.map(name => (
                        <span
                          key={name}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 bg-slate-50 text-slate-400"
                        >
                          <AlertCircle size={12} />
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
