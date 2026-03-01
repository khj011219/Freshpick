"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DbRecipeIngredient = {
  id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  is_essential: boolean;
};

type RecipeData = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  steps: string[];
  recipe_ingredients: DbRecipeIngredient[];
};

type UserIngredient = {
  name: string;
  expire_date: string;
};

export type IngredientStatus = {
  name: string;
  quantity: number;
  unit: string;
  isEssential: boolean;
  status: "matched" | "urgent" | "missing";
};

type Stats = {
  total: number;
  matched: number;
  urgent: number;
  missing: number;
  missingEssential: number;
  matchRate: number;
  score: number;
};

type PageState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "not_found" }
  | {
      phase: "ready";
      recipe: RecipeData;
      statuses: IngredientStatus[];
      stats: Stats;
      explanation: string;
    };

// ─── Logic ────────────────────────────────────────────────────────────────────

function computeStatuses(
  recipeIngredients: DbRecipeIngredient[],
  userIngredients: UserIngredient[]
): IngredientStatus[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ingredientMap = new Map<string, string>();
  for (const ing of userIngredients) {
    ingredientMap.set(ing.name.toLowerCase(), ing.expire_date);
  }

  return recipeIngredients.map((ri): IngredientStatus => {
    const expireDate = ingredientMap.get(ri.ingredient_name.toLowerCase());

    if (expireDate === undefined) {
      return {
        name: ri.ingredient_name,
        quantity: ri.quantity,
        unit: ri.unit,
        isEssential: ri.is_essential,
        status: "missing",
      };
    }

    const expire = new Date(expireDate);
    expire.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil(
      (expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      name: ri.ingredient_name,
      quantity: ri.quantity,
      unit: ri.unit,
      isEssential: ri.is_essential,
      status: daysLeft <= 3 ? "urgent" : "matched",
    };
  });
}

function computeStats(
  statuses: IngredientStatus[],
  total: number
): Stats {
  const matched = statuses.filter((s) => s.status !== "missing").length;
  const urgent = statuses.filter((s) => s.status === "urgent").length;
  const missing = statuses.filter((s) => s.status === "missing").length;
  const missingEssential = statuses.filter(
    (s) => s.isEssential && s.status === "missing"
  ).length;
  const matchRate = total === 0 ? 0 : Math.round((matched / total) * 100);

  // Mirrors the scoring logic in /api/recommend
  const matchScore = total === 0 ? 0 : (matched / total) * 40;
  const maxExpiryScore = urgent > 0 ? 40 : 0;
  const penalty = missingEssential * 20;
  const score = Math.max(0, Math.round(maxExpiryScore + matchScore - penalty));

  return { total, matched, urgent, missing, missingEssential, matchRate, score };
}

function buildExplanation(stats: Stats): string {
  const { matchRate, urgent, missingEssential } = stats;
  const parts: string[] = [];

  if (matchRate === 100) {
    parts.push("모든 재료를 보유하고 있어 지금 바로 요리할 수 있어요!");
  } else {
    parts.push(`이 레시피는 현재 보유한 재료의 ${matchRate}%를 활용합니다.`);
  }

  if (urgent > 0) {
    parts.push(`임박 재료 ${urgent}개가 포함되어 우선 추천되었습니다.`);
  }

  if (missingEssential > 0) {
    parts.push(`필수 재료 ${missingEssential}개가 부족하여 구매가 필요합니다.`);
  } else if (matchRate >= 80 && matchRate < 100) {
    parts.push("대부분의 재료를 보유하고 있어 금방 만들 수 있어요!");
  }

  return parts.join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({
  status,
  isEssential,
}: {
  status: IngredientStatus["status"];
  isEssential: boolean;
}) {
  if (status === "matched") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={10} />
        보유
      </span>
    );
  }
  if (status === "urgent") {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-warning-500 bg-warning-50 px-2 py-0.5 rounded-full">
        <Clock size={10} />
        임박
      </span>
    );
  }
  // missing
  if (isEssential) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-danger-500 bg-danger-50 px-2 py-0.5 rounded-full">
        <AlertCircle size={10} />
        핵심 재료 없음
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
      <AlertCircle size={10} />
      없음
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 animate-pulse pb-12">
      <div className="h-64 bg-slate-200" />
      <div className="px-6 pt-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-7 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-4/5" />
          </div>
          <div className="w-14 h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
        </div>
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function RecipeDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const backHref = from === "recipes" ? "/?tab=recipes" : "/";

  const [state, setState] = useState<PageState>({ phase: "loading" });

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Fetch recipe + recipe_ingredients in one query
      const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("id, title, description, image_url, steps, recipe_ingredients(*)")
        .eq("id", params.id)
        .single<RecipeData>();

      if (recipeError || !recipeData) {
        setState({ phase: "not_found" });
        return;
      }

      // Fetch user's own ingredients (empty if not logged in)
      let userIngredients: UserIngredient[] = [];
      if (session) {
        const { data } = await supabase
          .from("ingredients")
          .select("name, expire_date")
          .eq("user_id", session.user.id);
        userIngredients = (data as UserIngredient[]) ?? [];
      }

      const recipeIngredients = recipeData.recipe_ingredients ?? [];
      const statuses = computeStatuses(recipeIngredients, userIngredients);
      const stats = computeStats(statuses, recipeIngredients.length);
      const explanation = buildExplanation(stats);

      setState({ phase: "ready", recipe: recipeData, statuses, stats, explanation });
    }

    load().catch(() =>
      setState({ phase: "error", message: "데이터를 불러오는 데 실패했습니다." })
    );
  }, [params.id]);

  if (state.phase === "loading") return <LoadingSkeleton />;

  if (state.phase === "not_found") {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
        <ChefHat size={40} className="opacity-40" />
        <p className="font-semibold">레시피를 찾을 수 없습니다.</p>
        <Link href={backHref} className="text-sm text-brand-600 font-medium">
          ← 돌아가기
        </Link>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
        <AlertCircle size={40} className="opacity-40" />
        <p className="font-semibold">{state.message}</p>
        <Link href={backHref} className="text-sm text-brand-600 font-medium">
          ← 돌아가기
        </Link>
      </div>
    );
  }

  const { recipe, statuses, stats, explanation } = state;
  const imageUrl = recipe.image_url || null;
  const missingStatuses = statuses.filter((s) => s.status === "missing");

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      {/* ── Hero ── */}
      <div className="relative h-64 bg-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat size={48} className="text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <Link
          href={backHref}
          className="absolute top-12 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center ios-shadow"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </Link>
      </div>

      <div className="px-6 pt-6 space-y-5">
        {/* ── Title + Score ── */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-snug mb-2">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-slate-500 text-sm leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center bg-brand-600 text-white rounded-2xl px-3 py-2.5 flex-shrink-0 min-w-[52px]">
            <Star size={13} className="mb-0.5" />
            <span className="text-xl font-bold leading-none">{stats.score}</span>
            <span className="text-[9px] font-medium opacity-75 mt-0.5">추천 점수</span>
          </div>
        </div>

        {/* ── Recommendation Explanation ── */}
        <div className="bg-brand-600/5 border border-brand-600/15 rounded-2xl p-4 flex gap-3">
          <Sparkles size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 leading-relaxed">{explanation}</p>
        </div>

        {/* ── Summary Stats ── */}
        <div className="bg-white rounded-2xl ios-shadow border border-slate-100 p-4">
          <h2 className="text-sm font-bold text-slate-700 mb-3">추천 요약</h2>

          {/* Match rate bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
              <span>재료 충족률</span>
              <span className="font-bold text-brand-600">{stats.matchRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${stats.matchRate}%` }}
              />
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl px-3 py-1.5">
              <ChefHat size={13} className="text-slate-400" />
              <span className="text-[12px] text-slate-600">
                <span className="font-bold text-slate-900">{stats.matched}</span>
                <span className="text-slate-400"> / {stats.total}</span>
                {" "}재료 보유
              </span>
            </div>
            {stats.urgent > 0 && (
              <div className="flex items-center gap-1.5 bg-warning-50 rounded-xl px-3 py-1.5">
                <Clock size={13} className="text-warning-500" />
                <span className="text-[12px] font-semibold text-warning-500">
                  임박 재료 {stats.urgent}개
                </span>
              </div>
            )}
            {stats.missing > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-3 py-1.5">
                <AlertCircle size={13} className="text-slate-400" />
                <span className="text-[12px] font-semibold text-slate-500">
                  부족 재료 {stats.missing}개
                </span>
              </div>
            )}
            {stats.missing === 0 && (
              <div className="flex items-center gap-1.5 bg-brand-50 rounded-xl px-3 py-1.5">
                <CheckCircle2 size={13} className="text-brand-600" />
                <span className="text-[12px] font-semibold text-brand-600">
                  모든 재료 보유
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Ingredient Breakdown ── */}
        <section>
          <h2 className="text-base font-bold text-slate-900 mb-3">재료 현황</h2>
          <div className="bg-white rounded-2xl ios-shadow border border-slate-100 overflow-hidden divide-y divide-slate-50">
            {statuses.map((s, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-3 ${
                  s.status === "missing" && s.isEssential ? "bg-danger-50/40" : ""
                }`}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm font-medium text-slate-800 block truncate">
                    {s.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {s.quantity} {s.unit}
                  </span>
                </div>
                <StatusBadge status={s.status} isEssential={s.isEssential} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Missing Ingredients ── */}
        {missingStatuses.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">부족 재료</h2>
            <div className="bg-white rounded-2xl ios-shadow border border-slate-100 p-4">
              <ul className="space-y-2.5 mb-4">
                {missingStatuses.map((s, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        s.isEssential ? "bg-danger-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="text-sm text-slate-700 flex-1">{s.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {s.quantity} {s.unit}
                    </span>
                    {s.isEssential && (
                      <span className="text-[10px] font-bold text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded">
                        필수
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold active:scale-95 transition-transform"
              >
                <ShoppingCart size={16} />
                장보기 목록에 추가
              </button>
            </div>
          </section>
        )}

        {/* ── Cooking Steps ── */}
        {recipe.steps?.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-3">조리 순서</h2>
            <ol className="space-y-3">
              {recipe.steps.map((step, index) => (
                <li
                  key={index}
                  className="flex gap-4 bg-white rounded-2xl border border-slate-100 p-4 ios-shadow"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-slate-600 text-sm leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RecipeDetailContent />
    </Suspense>
  );
}
