"use client";

import { Search, Plus, Refrigerator, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Ingredient } from '@/types';
import { StatusBadge } from './StatusBadge';
import { getExpirationStatus, ExpirationStatus } from '@/utils/expiration';

type IngredientsTabProps = {
  ingredients: Ingredient[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onRemove: (id: string) => void;
};

const cardStyles: Record<ExpirationStatus, string> = {
  urgent:  "bg-red-100 border-red-400",
  warning: "bg-yellow-100 border-yellow-400",
  safe:    "bg-white border-slate-100",
  expired: "bg-gray-200 border-slate-200",
};

export const IngredientsTab = ({
  ingredients,
  searchQuery,
  onSearchChange,
  onAddClick,
  onRemove,
}: IngredientsTabProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="pb-24"
  >
    <header className="px-6 pt-12 pb-6 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">My Fridge</h1>
        <button
          onClick={onAddClick}
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
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>

    <div className="px-6 space-y-4 mt-2">
      {ingredients
        .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
        .map(ing => {
          const status = getExpirationStatus(ing.expiryDate);
          return (
            <motion.div
              layout
              key={ing.id}
              className={`p-4 rounded-2xl ios-shadow border flex items-center justify-between group ${cardStyles[status]}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    ing.category === 'Produce' ? 'bg-emerald-50 text-emerald-500' :
                    ing.category === 'Dairy'   ? 'bg-blue-50 text-blue-500' :
                    ing.category === 'Meat'    ? 'bg-rose-50 text-rose-500' :
                                                 'bg-slate-50 text-slate-500'
                  }`}
                >
                  <Refrigerator size={24} />
                </div>
                <div>
                  <h3 className={`font-bold ${status === 'expired' ? 'text-red-600' : 'text-slate-900'}`}>
                    {ing.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {ing.quantity} {ing.unit} • {ing.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge expiryDate={ing.expiryDate} />
                <button
                  onClick={() => onRemove(ing.id)}
                  className="p-2 text-slate-300 hover:text-danger-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}

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
