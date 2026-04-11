export default function MarketingLoading() {
  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-5xl mx-auto px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-cream-200 rounded-lg w-2/3 mx-auto" />
          <div className="h-5 bg-cream-200 rounded w-1/2 mx-auto" />
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-cream-300 space-y-4">
                <div className="h-6 bg-cream-200 rounded w-1/3" />
                <div className="h-10 bg-cream-200 rounded w-1/2" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 bg-cream-100 rounded w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
