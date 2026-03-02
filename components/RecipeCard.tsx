import Link from 'next/link';
import { ChefHat, Clock, AlertCircle, Lock, Pencil, Trash2 } from 'lucide-react';
import { RecommendedRecipe } from '@/types';

type Props = {
  recipe: RecommendedRecipe;
  from?: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
};

export const RecipeCard = ({ recipe, from, isAdmin, onDelete }: Props) => {
  // 빈 문자열도 null로 처리하여 <img src=""> 방지
  const imageUrl = recipe.image_url || null;
  const href = from ? `/recipes/${recipe.id}?from=${from}` : `/recipes/${recipe.id}`;

  return (
    <div className="relative flex bg-white rounded-2xl ios-shadow border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md">
      {/* 카드 전체 클릭 오버레이 */}
      <Link href={href} className="absolute inset-0 z-0" aria-label={recipe.title} />

      {/* 정사각형 이미지 영역 */}
      <div className="w-28 flex-shrink-0 bg-slate-100 relative self-stretch">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          // 이미지 없을 때 플레이스홀더
          <div className="absolute inset-0 flex items-center justify-center">
            <ChefHat size={28} className="text-slate-300" />
          </div>
        )}
      </div>

      {/* 카드 정보 영역 */}
      <div className="flex-1 px-4 py-3 min-w-0">
        {/* 제목 */}
        <h3 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 mb-1.5 pr-14">
          {recipe.title}
        </h3>

        {recipe.isAuthenticated ? (
          <>
            {/* 보유 / 전체 재료 수 + 충족률 배지 */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-[11px] text-slate-500">
                보유 재료 {recipe.matchedIngredients} / 전체 {recipe.totalIngredients}
              </p>
              <span className="flex-shrink-0 text-[11px] font-bold text-brand-600 bg-brand-600/10 px-2 py-0.5 rounded-full">
                {recipe.matchRate}%
              </span>
            </div>

            {/* 충족률 프로그레스 바 */}
            <div className="h-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${recipe.matchRate}%` }}
              />
            </div>

            {/* 임박 재료 배지 */}
            {recipe.urgentUsedCount > 0 && (
              <p className="text-[11px] font-semibold text-warning-600 flex items-center gap-1 mb-1">
                <Clock size={11} />
                임박 재료 {recipe.urgentUsedCount}개 사용
              </p>
            )}

            {/* 부족 재료 목록 */}
            {recipe.missingIngredients.length > 0 && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <AlertCircle size={11} className="flex-shrink-0" />
                부족 재료: {recipe.missingIngredients.slice(0, 3).join(', ')}
                {recipe.missingIngredients.length > 3 &&
                  ` +${recipe.missingIngredients.length - 3}개`}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-[11px] text-slate-400 mb-1.5">
              전체 재료 {recipe.totalIngredients}개
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock size={11} className="flex-shrink-0" />
              로그인이 필요합니다
            </p>
          </>
        )}
      </div>

      {/* 관리자 버튼 (수정 / 삭제) */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Link
            href={`/recipes/${recipe.id}/edit`}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-300 transition-colors shadow-sm"
            aria-label="수정"
          >
            <Pencil size={13} />
          </Link>
          <button
            onClick={() => onDelete?.(recipe.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors shadow-sm"
            aria-label="삭제"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
