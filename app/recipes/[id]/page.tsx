import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Recipe = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  steps: string[];
};

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('id, title, description, image_url, steps')
    .eq('id', id)
    .single<Recipe>();

  if (error || !recipe) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400">
        <p className="text-lg font-semibold">Recipe not found</p>
        <Link href="/" className="text-sm text-brand-600 font-medium">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      {/* Hero image + back button */}
      <div className="relative h-64">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Link
          href="/"
          className="absolute top-12 left-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center ios-shadow"
        >
          <ChevronLeft size={20} className="text-slate-700" />
        </Link>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900">{recipe.title}</h1>

        {/* Description */}
        {recipe.description && (
          <p className="text-slate-500 text-sm leading-relaxed">{recipe.description}</p>
        )}

        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">How to Cook</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
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
