async function getInsights() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/growth`, { cache: "no-store" });
    return res.json();
  } catch {
    return { insights: [], metrics: { totalRevenue: 0, conversion: 0 } };
  }
}

export default async function AIInsightsPage() {
  const data = await getInsights();
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">🤖 AI Growth Insights</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">€{(data.metrics?.totalRevenue ?? 0).toFixed(0)}</div>
        </div>
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Conversion Rate</div>
          <div className="text-2xl font-bold">{((data.metrics?.conversion ?? 0) * 100).toFixed(1)}%</div>
        </div>
        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Insights Generated</div>
          <div className="text-2xl font-bold">{data.insights?.length ?? 0}</div>
        </div>
      </div>
      <div className="space-y-3">
        {(data.insights || []).map((i: any, idx: number) => (
          <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <div className="font-bold">{i.title}</div>
            <div className="text-sm text-gray-700">{i.detail}</div>
            <div className="mt-2 space-x-2">
              <button className="bg-green-600 text-white text-xs px-2 py-1 rounded">Accept</button>
              <button className="bg-gray-300 text-xs px-2 py-1 rounded">Dismiss</button>
              <span className="text-xs text-gray-500">{i.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
