import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FranchiseDashboard({ params }: { params: { orgId: string } }) {
  const org = await prisma.organization.findUnique({
    where: { id: params.orgId },
    include: { locations: { include: { staff: true } }, staff: true },
  }).catch(() => null);

  if (!org) return notFound();

  const orders = await prisma.order.findMany({
    where: { gallery: { location: { orgId: org.id } }, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const totalRevenue = orders.reduce((s: number, o: any) => s + o.amount, 0);
  const saasCommission = totalRevenue * org.saasCommissionRate;
  const sleepingMoneyOrders = orders.filter((o: any) => o.isAutomatedSale);
  const sleepingMoneyRev = sleepingMoneyOrders.reduce((s: number, o: any) => s + o.amount, 0);
  const sleepingShare = sleepingMoneyRev * org.sleepingMoneyShare;
  const manualRev = totalRevenue - sleepingMoneyRev;
  const recentOrders = orders.slice(0, 8);

  // Revenue breakdown by location
  const revenueByLocation: Record<string, { name: string; revenue: number; orders: number }> = {};
  for (const loc of org.locations) {
    revenueByLocation[loc.id] = { name: loc.name, revenue: 0, orders: 0 };
  }

  // Fetch per-location data
  for (const loc of org.locations) {
    const locOrders = await prisma.order.aggregate({
      where: { gallery: { locationId: loc.id }, status: "COMPLETED" },
      _sum: { amount: true },
      _count: { id: true },
    }).catch(() => ({ _sum: { amount: 0 }, _count: { id: 0 } }));
    revenueByLocation[loc.id].revenue = locOrders._sum.amount ?? 0;
    revenueByLocation[loc.id].orders = locOrders._count.id ?? 0;
  }

  // Recent activity log (last 10 orders)
  const recentActivity = await prisma.order.findMany({
    where: { gallery: { location: { orgId: org.id } } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      customer: { select: { name: true, email: true } },
      gallery: { include: { location: { select: { name: true } } } },
    },
  }).catch(() => []);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Franchise</div>
        <h1 className="heading text-4xl mt-1">{org.name}</h1>
        <p className="text-navy-400 mt-1">Franchise Dashboard · {org.type}</p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Locations" value={org.locations.length} />
        <Stat label="Staff" value={org.staff.length} />
        <Stat label="Revenue" value={`€${totalRevenue.toFixed(0)}`} />
        <Stat label="HQ Owed" value={`€${(saasCommission + sleepingShare).toFixed(0)}`} />
      </div>

      {/* Revenue breakdown */}
      <div className="card p-6">
        <h2 className="heading text-xl mb-4">Revenue Breakdown</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-cream-100 rounded-xl p-4">
            <div className="label-xs">Manual sales</div>
            <div className="font-display text-2xl text-navy-900">€{manualRev.toFixed(0)}</div>
          </div>
          <div className="bg-cream-100 rounded-xl p-4">
            <div className="label-xs">Sleeping money (automated)</div>
            <div className="font-display text-2xl text-navy-900">€{sleepingMoneyRev.toFixed(0)}</div>
          </div>
          <div className="bg-cream-100 rounded-xl p-4">
            <div className="label-xs">Total orders</div>
            <div className="font-display text-2xl text-navy-900">{orders.length}</div>
          </div>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-cream-300">
            <tr><td className="py-2 text-navy-500">Total Revenue</td><td className="text-right font-semibold text-navy-900">€{totalRevenue.toFixed(2)}</td></tr>
            <tr><td className="py-2 text-navy-500">SaaS Commission ({(org.saasCommissionRate * 100).toFixed(1)}%)</td><td className="text-right text-coral-600 font-semibold">-€{saasCommission.toFixed(2)}</td></tr>
            <tr><td className="py-2 text-navy-500">Sleeping Money Share ({(org.sleepingMoneyShare * 100).toFixed(0)}%)</td><td className="text-right text-coral-600 font-semibold">-€{sleepingShare.toFixed(2)}</td></tr>
            <tr className="font-bold"><td className="py-2 text-navy-900">Total Owed to HQ</td><td className="text-right text-navy-900">€{(saasCommission + sleepingShare).toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Staff per location */}
      <div className="card p-6">
        <h2 className="heading text-xl mb-4">Staff per Location</h2>
        {org.locations.length === 0 ? (
          <p className="text-navy-400 text-sm">No locations yet.</p>
        ) : (
          <div className="space-y-3">
            {org.locations.map((loc: any) => (
              <div key={loc.id} className="flex items-center justify-between py-2 border-b border-cream-300/70 last:border-0">
                <div>
                  <div className="font-medium text-navy-900">{loc.name}</div>
                  <div className="text-xs text-navy-400">{loc.type}</div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <div className="text-xs text-navy-400">Staff</div>
                    <div className="font-semibold text-navy-900">{loc.staff?.length ?? 0}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-navy-400">Revenue</div>
                    <div className="font-semibold text-navy-900">€{(revenueByLocation[loc.id]?.revenue ?? 0).toFixed(0)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-navy-400">Orders</div>
                    <div className="font-semibold text-navy-900">{revenueByLocation[loc.id]?.orders ?? 0}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity log */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No activity yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {recentActivity.map((o: any) => (
                <tr key={o.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 text-navy-700">{o.customer?.name || o.customer?.email || "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{o.gallery?.location?.name ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex rounded-full text-xs font-semibold px-2 py-0.5 ${
                      o.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                      o.status === "REFUNDED" ? "bg-coral-50 text-coral-700" :
                      "bg-cream-200 text-navy-500"
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-navy-900">€{o.amount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-navy-400 text-xs">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className="font-display text-3xl text-navy-900 mt-1">{value}</div>
    </div>
  );
}
