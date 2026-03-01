export default function Loading() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 animate-pulse pb-12">
      {/* Hero */}
      <div className="h-64 bg-slate-200" />

      <div className="px-6 pt-6 space-y-4">
        {/* Title + Score */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-7 bg-slate-200 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-4/5" />
          </div>
          <div className="w-14 h-16 bg-slate-200 rounded-2xl flex-shrink-0" />
        </div>

        {/* Explanation */}
        <div className="h-16 bg-slate-100 rounded-2xl" />

        {/* Summary stats */}
        <div className="h-28 bg-slate-200 rounded-2xl" />

        {/* Ingredient breakdown */}
        <div>
          <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
          <div className="bg-white rounded-2xl overflow-hidden divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-5 w-14 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 bg-white rounded-2xl p-4">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3.5 bg-slate-100 rounded w-full" />
                  <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
