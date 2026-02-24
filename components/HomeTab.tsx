"use client";

import { Refrigerator, AlertCircle, Calendar, Clock, ChefHat } from 'lucide-react';
import { motion } from 'motion/react';
import { Ingredient, AppTab, RecipeWithMatch } from '@/types';
import { StatusBadge } from './StatusBadge';

type HomeTabProps = {
  ingredients: Ingredient[];
  expiringSoon: Ingredient[];
  recipeMatches: RecipeWithMatch[];
  onNavigate: (tab: AppTab) => void;
};

export const HomeTab = ({ ingredients, expiringSoon, recipeMatches, onNavigate }: HomeTabProps) => (
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
          <button
            onClick={() => onNavigate('ingredients')}
            className="text-brand-600 text-xs font-semibold"
          >
            See All
          </button>
        </div>
        <div className="space-y-3">
          {expiringSoon.slice(0, 3).map(ing => (
            <div
              key={ing.id}
              className="bg-white p-4 rounded-2xl ios-shadow flex items-center justify-between border border-slate-100"
            >
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
        <button
          onClick={() => onNavigate('recipes')}
          className="text-brand-600 text-xs font-semibold"
        >
          View All
        </button>
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
              <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {recipe.title}
              </h3>
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
