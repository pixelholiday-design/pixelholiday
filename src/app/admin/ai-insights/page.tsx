async function fetchInsights() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const r = await fetch(`${base}/api/ai/growth`, { cache: "no-store" });
    return await r.json();
  } catch {
    return { insights: [] };
  }
}

export default async function AIInsightsPage() {
  const data = await fetchInsights();
  const insights = data.insights || [];
  const categories = ["trend", "pricing", "staff", "franchise", "marketing"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">AI Growth Engine v2</h1>
      <p className="text-sm text-slate-500 mb-6">Self-learning insights from your data</p>
      {categories.map((cat) => {
        const items = insights.filter((i: any) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mb-6">
            <h2 className="font-semibold mb-2 capitalize">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((i: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4">
                  <div className="text-xs text-slate-500 uppercase">{i.type}</div>
                  <div className="font-semibold mt-1">{i.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{i.description}</div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {insights.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-slate-500">
          No insights yet. The AI needs more data to generate recommendations.
        </div>
      )}
    </div>
  );
}
