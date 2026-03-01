"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, X, ChefHat, ListOrdered, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

type IngredientInput = {
  name: string;
  quantity: number;
  unit: string;
  isEssential: boolean;
};

type IngredientDraft = {
  name: string;
  quantity: string;   // input 중에는 string으로 관리
  unit: string;
  isEssential: boolean;
};

// ─── Initial states ───────────────────────────────────────────────────────────

const EMPTY_INGREDIENT: IngredientDraft = {
  name: '',
  quantity: '',
  unit: '',
  isEssential: true,
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewRecipePage() {
  const router = useRouter();

  // 기본 정보
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // 재료 목록
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [draft, setDraft] = useState<IngredientDraft>(EMPTY_INGREDIENT);

  // 조리 단계
  const [steps, setSteps] = useState<string[]>([]);
  const [stepDraft, setStepDraft] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Ingredient handlers ────────────────────────────────────────────────

  const addIngredient = () => {
    if (!draft.name.trim()) return;

    setIngredients(prev => [
      ...prev,
      {
        name: draft.name.trim(),
        quantity: Number(draft.quantity) || 0,
        unit: draft.unit.trim(),
        isEssential: draft.isEssential,
      },
    ]);
    setDraft(EMPTY_INGREDIENT);
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Step handlers ──────────────────────────────────────────────────────

  const addStep = () => {
    if (!stepDraft.trim()) return;
    setSteps(prev => [...prev, stepDraft.trim()]);
    setStepDraft('');
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Validation ─────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!title.trim()) return '레시피 이름을 입력해주세요.';
    if (ingredients.length === 0) return '재료를 1개 이상 추가해주세요.';
    if (steps.length === 0) return '조리 단계를 1개 이상 추가해주세요.';
    return null;
  };

  // ─── Save ───────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    // 1. recipes 테이블에 삽입
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() === '' ? null : imageUrl.trim(),
        steps,
      })
      .select()
      .single();

    if (recipeError || !recipe) {
      setError('레시피 저장에 실패했습니다. 다시 시도해주세요.');
      setSaving(false);
      return;
    }

    // 2. recipe_ingredients 테이블에 일괄 삽입
    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(
        ingredients.map(i => ({
          recipe_id: recipe.id,
          ingredient_name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          is_essential: i.isEssential,
        }))
      );

    setSaving(false);

    if (ingredientsError) {
      setError('재료 저장에 실패했습니다. 레시피는 저장됐으나 재료를 다시 확인해주세요.');
      return;
    }

    alert(`"${recipe.title}" 레시피가 저장됐습니다!`);

    // 폼 초기화
    setTitle('');
    setDescription('');
    setImageUrl('');
    setIngredients([]);
    setSteps([]);
    setDraft(EMPTY_INGREDIENT);
    setStepDraft('');
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 bg-white rounded-full flex items-center justify-center ios-shadow"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">레시피 추가</h1>
      </header>

      <div className="px-6 space-y-6 pt-2">

        {/* ── 기본 정보 카드 ─────────────────────────────────────────────── */}
        <Card icon={<Info size={16} />} title="기본 정보">
          <Field label="레시피 이름 *">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="예: 된장찌개"
              className={inputCls}
            />
          </Field>
          <Field label="설명">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="간단한 설명을 입력하세요."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </Field>
          <Field label="이미지 URL">
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>
        </Card>

        {/* ── 재료 카드 ──────────────────────────────────────────────────── */}
        <Card icon={<ChefHat size={16} />} title="재료">
          {/* 재료 입력 폼 */}
          <div className="grid grid-cols-2 gap-2">
            <Field label="재료명 *" className="col-span-2">
              <input
                type="text"
                value={draft.name}
                onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                placeholder="예: 두부"
                className={inputCls}
                onKeyDown={e => e.key === 'Enter' && addIngredient()}
              />
            </Field>
            <Field label="수량">
              <input
                type="number"
                value={draft.quantity}
                onChange={e => setDraft(d => ({ ...d, quantity: e.target.value }))}
                placeholder="0"
                min={0}
                className={inputCls}
              />
            </Field>
            <Field label="단위">
              <input
                type="text"
                value={draft.unit}
                onChange={e => setDraft(d => ({ ...d, unit: e.target.value }))}
                placeholder="예: g, 개, 큰술"
                className={inputCls}
              />
            </Field>
          </div>

          {/* 핵심 재료 토글 */}
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={draft.isEssential}
              onChange={e => setDraft(d => ({ ...d, isEssential: e.target.checked }))}
              className="w-4 h-4 accent-brand-600 rounded"
            />
            <span className="text-sm text-slate-600 font-medium">핵심 재료</span>
          </label>

          <button
            type="button"
            onClick={addIngredient}
            disabled={!draft.name.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            <Plus size={16} />
            재료 추가
          </button>

          {/* 추가된 재료 목록 */}
          {ingredients.length > 0 && (
            <ul className="mt-4 space-y-2">
              {ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                      ing.isEssential
                        ? 'bg-brand-600/10 text-brand-600'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {ing.isEssential ? '핵심' : '부재료'}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 truncate">{ing.name}</span>
                    {ing.quantity > 0 && (
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {ing.quantity}{ing.unit}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(i)}
                    className="ml-2 flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* ── 조리 단계 카드 ─────────────────────────────────────────────── */}
        <Card icon={<ListOrdered size={16} />} title="조리 단계">
          <Field label="단계 내용">
            <textarea
              value={stepDraft}
              onChange={e => setStepDraft(e.target.value)}
              placeholder="예: 두부를 먹기 좋은 크기로 자른다."
              rows={2}
              className={`${inputCls} resize-none`}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addStep();
                }
              }}
            />
          </Field>

          <button
            type="button"
            onClick={addStep}
            disabled={!stepDraft.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            <Plus size={16} />
            단계 추가
          </button>

          {/* 추가된 단계 목록 */}
          {steps.length > 0 && (
            <ol className="mt-4 space-y-2">
              {steps.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm text-slate-700 leading-relaxed">{step}</p>
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* ── 에러 메시지 ──────────────────────────────────────────────────── */}
        {error && (
          <p className="text-sm font-medium text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* ── 저장 버튼 ────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-brand-600 text-white text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform shadow-lg shadow-brand-600/20"
        >
          {saving ? '저장 중...' : '레시피 저장'}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl ios-shadow border border-slate-100 p-5 space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600/50 transition-colors';
