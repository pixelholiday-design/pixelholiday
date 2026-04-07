import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RevenuePage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: monthStart }, status: "COMPLETED" },
    include: { gallery: { include: { location: true } } },
  });
  const byLocation = new Map<string, number>();
  const byMethod = new Map<string, number>();
  for (const o of orders) {
    const loc = o.gallery.location.name;
    byLocation.set(loc, (byLocation.get(loc) || 0) + o.amount);
    byMethod.set(o.paymentMethod, (byMethod.get(o.paymentMethod) || 0) + o.amount);
  }
  const total = orders.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Revenue</div>
        <h1 className="heading text-4xl mt-1">Revenue breakdown</h1>
        <p className="text-navy-400 mt-1">Month-to-date across all locations and payment methods.</p>
      </header>

      <div className="stat-card max-w-sm">
        <div className="label-xs">Total revenue MTD</div>
        <div className="font-display text-4xl text-green-600">€{total.toFixed(0)}</div>
        <div className="text-xs text-navy-400 mt-1">{orders.length} completed orders</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="heading text-lg mb-4">By location</h2>
          {Array.from(byLocation.entries()).map(([k, v]) => (
            <Bar key={k} label={k} value={v} total={total} color="bg-coral-500" />
          ))}
        </div>
        <div className="card p-6">
          <h2 className="heading text-lg mb-4">By payment method</h2>
          {Array.from(byMethod.entries()).map(([k, v]) => (
            <Bar key={k} label={k.replace(/_/g, " ")} value={v} total={total} color="bg-gold-500" />
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Recent orders</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300/70">
            {orders.slice(0, 20).map((o) => (
              <tr key={o.id} className="hover:bg-cream-100/60">
                <td className="px-6 py-3 text-xs text-navy-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-navy-700">{o.gallery.location.name}</td>
                <td className="px-6 py-3 text-navy-500 text-xs font-mono">{o.paymentMethod}</td>
                <td className="px-6 py-3 text-right font-semibold text-navy-900">€{o.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Bar({ label, value, total, color }: any) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-navy-600">{label}</span>
        <span className="font-semibold text-navy-900">€{value.toFixed(0)}</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
