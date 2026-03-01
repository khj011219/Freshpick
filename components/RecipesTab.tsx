"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertCircle, Refrigerator, Clock, ChefHat, ChevronDown, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RecipeCard } from './RecipeCard';
import { RecommendedRecipe } from '@/types';

type SortKey = 'urgent' | 'matchRate' | 'score';

type RecipesTabProps = {
  ingredientCount: number;
  urgentCount: number;
};

export const RecipesTab = ({ ingredientCount, urgentCount }: RecipesTabProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('urgent');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/recommend', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // API 응답 → RecommendedRecipe 형태로 변환
        setRecommendations(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map((r: any) => ({
            id: r.recipe_id,
            title: r.title,
            image_url: r.image_url || null,
            score: r.score,
            matchRate: Math.round(r.match_rate * 100),
            totalIngredients: r.total_ingredients,
            matchedIngredients: r.matched_ingredients,
            urgentUsedCount: r.expiring_ingredients.length,
            missingIngredients: r.missing_ingredients,
          }))
        );
      } catch {
        setError('추천 결과를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 정렬 기준에 따라 레시피 목록을 재정렬
  const sorted = useMemo(() => {
    return [...recommendations].sort((a, b) => {
      if (sortKey === 'urgent') return b.urgentUsedCount - a.urgentUsedCount;
      if (sortKey === 'matchRate') return b.matchRate - a.matchRate;
      return b.score - a.score;
    });
  }, [recommendations, sortKey]);

  // ─── 로딩 스켈레톤 ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pb-24">
        <header className="px-6 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">추천 결과</h1>
        </header>
        <div className="px-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse h-28"
            >
              <div className="w-28 bg-slate-200 flex-shrink-0" />
              <div className="flex-1 px-4 py-3 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-1 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── 에러 ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="pb-24 flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
        <AlertCircle size={40} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  // ─── 메인 UI ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-24"
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">추천 결과</h1>
          <p className="text-slate-400 text-sm mt-1">보유 재료를 기반으로 추천된 레시피예요.</p>
        </div>
        <Link
          href="/recipes/new"
          className="mt-1 w-10 h-10 bg-white rounded-full flex items-center justify-center ios-shadow text-brand-600 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </Link>
      </header>

      {/* Summary Box */}
      <section className="px-6 mb-6">
        <div className="bg-white rounded-2xl ios-shadow border border-slate-100 p-4 grid grid-cols-3 divide-x divide-slate-100">
          <div className="flex flex-col items-center gap-1 pr-4">
            <Refrigerator size={18} className="text-brand-600" />
            <span className="text-xl font-bold text-slate-900">{ingredientCount}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">보유 재료</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <Clock size={18} className="text-warning-500" />
            <span className="text-xl font-bold text-slate-900">{urgentCount}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">임박 재료</span>
          </div>
          <div className="flex flex-col items-center gap-1 pl-4">
            <ChefHat size={18} className="text-slate-500" />
            <span className="text-xl font-bold text-slate-900">{recommendations.length}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">추천 레시피</span>
          </div>
        </div>
      </section>

      {/* Sort Select */}
      <section className="px-6 mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">레시피 목록</span>
        <div className="relative">
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600/30"
          >
            <option value="urgent">유통기한 우선</option>
            <option value="matchRate">재료 충족률 높은순</option>
            <option value="score">추천 점수 높은순</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </section>

      {/* Recipe Card List */}
      <div className="px-6 space-y-4">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">추천할 레시피가 없습니다.</p>
          </div>
        ) : (
          sorted.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} from="recipes" />
          ))
        )}
      </div>
    </motion.div>
  );
};
