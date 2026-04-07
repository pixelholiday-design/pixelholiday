import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [revenueAgg, lastRevenueAgg] = await Promise.all([
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: monthStart }, status: "COMPLETED" },
    }),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1),
          lt: monthStart,
        },
        status: "COMPLETED",
      },
    }),
  ]);
  const revenue = revenueAgg._sum.amount || 0;
  const lastRevenue = lastRevenueAgg._sum.amount || 0;
  // Auto-targets: +15% of last month, or fallback €1500
  const targets = [
    { key: "revenue",  label: "Monthly revenue",  target: Math.max(1500, Math.round(lastRevenue * 1.15)), actual: revenue },
    { key: "digital",  label: "Digital passes sold", target: 40, actual: await prisma.customer.count({ where: { hasDigitalPass: true, createdAt: { gte: monthStart } } }) },
    { key: "galleries",label: "Galleries created", target: 200, actual: await prisma.gallery.count({ where: { createdAt: { gte: monthStart } } }) },
  ];

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Budget</div>
        <h1 className="heading text-4xl mt-1">Budget vs actual</h1>
        <p className="text-navy-400 mt-1">
          Targets auto-set to 115% of the previous month. Last month's revenue: €{lastRevenue.toFixed(0)}.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {targets.map((t) => {
          const pct = Math.min(100, (t.actual / t.target) * 100);
          const status = pct >= 100 ? "text-green-600" : pct >= 80 ? "text-gold-600" : "text-coral-600";
          return (
            <div key={t.key} className="stat-card">
              <div className="label-xs">{t.label}</div>
              <div className={`font-display text-3xl ${status}`}>
                {typeof t.actual === "number" && t.key === "revenue" ? `€${t.actual.toFixed(0)}` : t.actual}
              </div>
              <div className="text-xs text-navy-400 mt-1">
                Target: {t.key === "revenue" ? `€${t.target}` : t.target} · {pct.toFixed(0)}%
              </div>
              <div className="h-2 rounded-full bg-cream-200 overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    pct >= 100 ? "bg-green-500" : pct >= 80 ? "bg-gold-500" : "bg-coral-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6 text-sm text-navy-500">
        <p>
          <strong>How targets are set:</strong> auto-computed as 115% of the previous month's actual.
          Override by seeding a <code>Budget</code> model if you need manual control.
        </p>
      </div>
    </div>
  );
}
