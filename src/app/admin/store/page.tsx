import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShoppingBag, Ticket, Package, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StoreIndexPage() {
  const [orders, totalRevenue, pendingFulfillments, recentOrders, coupons] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
    prisma.fulfillmentOrder.count({ where: { status: { in: ["PENDING", "SUBMITTED_TO_LAB", "IN_PRODUCTION"] } } }).catch(() => 0),
    prisma.order.findMany({
      orderBy: { id: "desc" },
      take: 8,
      include: {
        customer: { select: { name: true, email: true } },
        gallery: { select: { location: { select: { name: true } } } },
        items: { select: { id: true } },
      },
    }),
    prisma.coupon.count({ where: { isActive: true } }).catch(() => 0),
  ]);

  const revenue = totalRevenue._sum.amount ?? 0;

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Overview</h1>
        <p className="text-navy-400 mt-1">
          Digital, print, and package sales across every location.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">All-time orders</div>
          <div className="font-display text-3xl text-navy-900">{orders}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Store revenue</div>
          <div className="font-display text-3xl text-navy-900">€{revenue.toFixed(0)}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
            <Package className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Pending fulfillments</div>
          <div className="font-display text-3xl text-navy-900">{pendingFulfillments}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
            <Ticket className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Active coupons</div>
          <div className="font-display text-3xl text-navy-900">{coupons}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Link
          href="/admin/store/orders"
          className="stat-card hover:shadow-lift transition group"
        >
          <div className="label-xs">Manage</div>
          <div className="font-display text-2xl text-navy-900 mt-1 group-hover:text-brand-700">
            Orders →
          </div>
          <p className="text-navy-500 text-sm mt-2">
            View, refund, and track fulfillment on every customer purchase.
          </p>
        </Link>
        <Link
          href="/admin/store/coupons"
          className="stat-card hover:shadow-lift transition group"
        >
          <div className="label-xs">Marketing</div>
          <div className="font-display text-2xl text-navy-900 mt-1 group-hover:text-brand-700">
            Coupons →
          </div>
          <p className="text-navy-500 text-sm mt-2">
            Manage promo codes, discount rules, and campaign links.
          </p>
        </Link>
        <Link
          href="/admin/store/labs"
          className="stat-card hover:shadow-lift transition group"
        >
          <div className="label-xs">Fulfillment</div>
          <div className="font-display text-2xl text-navy-900 mt-1 group-hover:text-brand-700">
            Print labs →
          </div>
          <p className="text-navy-500 text-sm mt-2">
            Connect print partners and configure automated print routing.
          </p>
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-2xl">Recent orders</h2>
          <Link href="/admin/store/orders" className="text-brand-700 hover:text-brand-500 text-sm font-semibold">
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card p-8 text-center text-navy-500">
            No orders yet.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-navy-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Location</th>
                  <th className="text-left px-5 py-3">Items</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-100">
                    <td className="px-5 py-3 text-navy-900 font-medium">
                      {o.customer?.name || o.customer?.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-navy-500">
                      {o.gallery?.location?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-navy-500">{o.items.length}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          o.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : o.status === "REFUNDED"
                            ? "bg-coral-100 text-coral-700"
                            : "bg-cream-200 text-navy-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-navy-900">
                      €{o.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
