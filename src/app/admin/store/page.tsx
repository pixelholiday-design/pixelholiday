import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShoppingBag, Ticket, Package, TrendingUp, Box, Wrench, DollarSign } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStoreMetrics() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    allTimeRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    pendingFulfillments,
    activeCoupons,
    activeProducts,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    // Revenue aggregates (ShopOrder)
    prisma.shopOrder.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } } }).catch(() => ({ _sum: { total: 0 } })),
    prisma.shopOrder.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: startOfToday } } }).catch(() => ({ _sum: { total: 0 } })),
    prisma.shopOrder.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: startOfWeek } } }).catch(() => ({ _sum: { total: 0 } })),
    prisma.shopOrder.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] }, createdAt: { gte: startOfMonth } } }).catch(() => ({ _sum: { total: 0 } })),
    prisma.shopOrder.count().catch(() => 0),
    prisma.shopOrder.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.shopOrder.count({ where: { status: "PROCESSING" } }).catch(() => 0),
    prisma.shopOrder.count({ where: { status: "SHIPPED" } }).catch(() => 0),
    prisma.shopOrder.count({ where: { status: "DELIVERED" } }).catch(() => 0),
    prisma.shopOrder.count({ where: { status: { in: ["CANCELLED", "REFUNDED"] } } }).catch(() => 0),
    prisma.shopOrder.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.coupon.count({ where: { isActive: true } }).catch(() => 0),
    prisma.shopProduct.count({ where: { isActive: true } }).catch(() => 0),
    // Top selling products
    prisma.shopOrderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }).then(async (rows) => {
      const ids = rows.map((r) => r.productId);
      const prods = await prisma.shopProduct.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, category: true } });
      const byId = new Map(prods.map((p) => [p.id, p]));
      return rows.map((r) => ({
        product: byId.get(r.productId),
        totalQty: r._sum.quantity ?? 0,
        totalRevenue: r._sum.totalPrice ?? 0,
      }));
    }).catch(() => []),
    // Recent orders
    prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        customer: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }).catch(() => []),
  ]);

  return {
    revenue: {
      allTime: allTimeRevenue._sum.total ?? 0,
      today: todayRevenue._sum.total ?? 0,
      week: weekRevenue._sum.total ?? 0,
      month: monthRevenue._sum.total ?? 0,
    },
    orders: {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },
    pendingFulfillments,
    activeCoupons,
    activeProducts,
    topProducts,
    recentOrders,
  };
}

export default async function StoreIndexPage() {
  // Also keep legacy Order counts for backward compat
  const [legacyOrders, legacyRevenue] = await Promise.all([
    prisma.order.count().catch(() => 0),
    prisma.order.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }).catch(() => ({ _sum: { amount: 0 } })),
  ]);

  const metrics = await getStoreMetrics();
  const legacyRev = legacyRevenue._sum.amount ?? 0;

  const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-gold-100 text-gold-700",
    PAID: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-brand-100 text-brand-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-coral-100 text-coral-700",
    REFUNDED: "bg-coral-100 text-coral-700",
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Overview</h1>
        <p className="text-navy-400 mt-1">
          Digital, print, and package sales across every location.
        </p>
      </header>

      {/* Revenue stats */}
      <div>
        <h2 className="heading text-xl mb-4">Revenue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="label-xs mt-3">Today</div>
            <div className="font-display text-3xl text-navy-900">€{metrics.revenue.today.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="label-xs mt-3">This week</div>
            <div className="font-display text-3xl text-navy-900">€{metrics.revenue.week.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="label-xs mt-3">This month</div>
            <div className="font-display text-3xl text-navy-900">€{metrics.revenue.month.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-navy-500/10 text-navy-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="label-xs mt-3">All-time (shop)</div>
            <div className="font-display text-3xl text-navy-900">€{(metrics.revenue.allTime + legacyRev).toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      <div>
        <h2 className="heading text-xl mb-4">Orders by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
            <div key={s} className="stat-card text-center">
              <div className="label-xs capitalize">{s}</div>
              <div className="font-display text-3xl text-navy-900 mt-1">{metrics.orders[s]}</div>
            </div>
          ))}
          <div className="stat-card text-center">
            <div className="label-xs">All orders</div>
            <div className="font-display text-3xl text-navy-900 mt-1">{metrics.orders.total + legacyOrders}</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="heading text-xl mb-4">Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link href="/admin/store/orders" className="stat-card hover:shadow-lift transition group">
            <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center mb-3">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div className="font-display text-2xl text-navy-900 group-hover:text-brand-700">Orders →</div>
            <p className="text-navy-500 text-sm mt-1">View, refund, and track every purchase.</p>
          </Link>
          <Link href="/admin/store/products" className="stat-card hover:shadow-lift transition group">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-3">
              <Box className="h-4 w-4" />
            </div>
            <div className="font-display text-2xl text-navy-900 group-hover:text-brand-700">Products →</div>
            <p className="text-navy-500 text-sm mt-1">{metrics.activeProducts} active products. Edit prices, toggle featured.</p>
          </Link>
          <Link href="/admin/store/fulfillment" className="stat-card hover:shadow-lift transition group">
            <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center mb-3">
              <Package className="h-4 w-4" />
            </div>
            <div className="font-display text-2xl text-navy-900 group-hover:text-brand-700">Fulfillment →</div>
            <p className="text-navy-500 text-sm mt-1">{metrics.pendingFulfillments} pending. Send to lab, mark shipped.</p>
          </Link>
          <Link href="/admin/store/coupons" className="stat-card hover:shadow-lift transition group">
            <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-3">
              <Ticket className="h-4 w-4" />
            </div>
            <div className="font-display text-2xl text-navy-900 group-hover:text-brand-700">Coupons →</div>
            <p className="text-navy-500 text-sm mt-1">{metrics.activeCoupons} active promo codes.</p>
          </Link>
        </div>
      </div>

      {/* Top selling products */}
      {metrics.topProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading text-xl">Top selling products</h2>
            <Link href="/admin/store/products" className="text-brand-700 hover:text-brand-500 text-sm font-semibold">
              Manage products →
            </Link>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-navy-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-left px-5 py-3">Category</th>
                  <th className="text-right px-5 py-3">Units sold</th>
                  <th className="text-right px-5 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300">
                {metrics.topProducts.map((row, i) => (
                  <tr key={i} className="hover:bg-cream-100">
                    <td className="px-5 py-3 text-navy-900 font-medium">{row.product?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-navy-500 text-xs">{row.product?.category ?? "—"}</td>
                    <td className="px-5 py-3 text-right text-navy-700">{row.totalQty}</td>
                    <td className="px-5 py-3 text-right font-semibold text-navy-900">€{row.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading text-xl">Recent orders</h2>
          <Link href="/admin/store/orders" className="text-brand-700 hover:text-brand-500 text-sm font-semibold">
            View all →
          </Link>
        </div>
        {metrics.recentOrders.length === 0 ? (
          <div className="card p-8 text-center text-navy-500">No orders yet.</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-navy-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-left px-5 py-3">Items</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300">
                {metrics.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-cream-100">
                    <td className="px-5 py-3 text-navy-900 font-medium">
                      {o.customer?.name || o.customer?.email || "Guest"}
                    </td>
                    <td className="px-5 py-3 text-navy-500">{o.items.length}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[o.status] ?? "bg-cream-200 text-navy-500"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-navy-900">
                      €{(o.total ?? 0).toFixed(2)}
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
