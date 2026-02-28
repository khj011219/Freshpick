export default function Loading() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 animate-pulse pb-12">
      <div className="h-64 bg-slate-200" />
      <div className="px-6 py-6 space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
        </div>
        <div className="space-y-4 pt-2">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4">
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
  );
}
