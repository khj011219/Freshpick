import Link from 'next/link';
import { ChefHat, Clock, AlertCircle } from 'lucide-react';
import { RecommendedRecipe } from '@/types';

type Props = { recipe: RecommendedRecipe; from?: string };

export const RecipeCard = ({ recipe, from }: Props) => {
  // 빈 문자열도 null로 처리하여 <img src=""> 방지
  const imageUrl = recipe.image_url || null;
  const href = from ? `/recipes/${recipe.id}?from=${from}` : `/recipes/${recipe.id}`;

  return (
    <Link
      href={href}
      className="flex bg-white rounded-2xl ios-shadow border border-slate-100 overflow-hidden active:scale-[0.98] transition-transform hover:shadow-md"
    >
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
        {/* 제목 + 충족률 배지 */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 flex-1">
            {recipe.title}
          </h3>
          <span className="flex-shrink-0 text-[11px] font-bold text-brand-600 bg-brand-600/10 px-2 py-0.5 rounded-full">
            {recipe.matchRate}%
          </span>
        </div>

        {/* 보유 / 전체 재료 수 */}
        <p className="text-[11px] text-slate-500 mb-1.5">
          보유 재료 {recipe.matchedIngredients} / 전체 {recipe.totalIngredients}
        </p>

        {/* 충족률 프로그레스 바 */}
        <div className="h-1 bg-slate-100 rounded-full mb-2 overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${recipe.matchRate}%` }}
          />
        </div>

        {/* 임박 재료 배지 (urgentUsedCount > 0 일 때만) */}
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
      </div>
    </Link>
  );
};
