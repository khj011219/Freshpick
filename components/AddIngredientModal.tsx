"use client";

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type AddIngredientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export const AddIngredientModal = ({ isOpen, onClose, onSubmit }: AddIngredientModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Ingredient Name
              </label>
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
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Quantity
                </label>
                <input
                  name="quantity"
                  type="number"
                  required
                  placeholder="1"
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Unit
                </label>
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Expiration Date
              </label>
              <input
                name="expiry"
                type="date"
                required
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-slate-900 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Category
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['Produce', 'Dairy', 'Meat', 'Pantry', 'Other'].map(cat => (
                  <label key={cat} className="flex-shrink-0 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      defaultChecked={cat === 'Produce'}
                      className="sr-only peer"
                    />
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
);
