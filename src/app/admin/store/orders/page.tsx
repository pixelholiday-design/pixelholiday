import { prisma } from "@/lib/db";
import { ShoppingBag, Truck } from "lucide-react";
import RefundButton from "./RefundButton";

export const dynamic = "force-dynamic";

export default async function StoreOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      gallery: { include: { location: true } },
      items: true,
      fulfillments: { include: { printLab: true } },
    },
    orderBy: { id: "desc" },
    take: 100,
  });

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Orders</h1>
        <p className="text-navy-400 mt-1">All customer purchases — digital, prints, and packages.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center"><ShoppingBag className="h-4 w-4" /></div>
          <div className="label-xs mt-3">All-time orders</div>
          <div className="font-display text-3xl text-navy-900">{orders.length}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center"><ShoppingBag className="h-4 w-4" /></div>
          <div className="label-xs mt-3">Revenue</div>
          <div className="font-display text-3xl text-navy-900">€{totalRevenue.toFixed(0)}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center"><Truck className="h-4 w-4" /></div>
          <div className="label-xs mt-3">Pending fulfillment</div>
          <div className="font-display text-3xl text-navy-900">
            {orders.flatMap((o) => o.fulfillments).filter((f) => f.status === "PENDING").length}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Recent orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-sm">No orders yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Fulfillment</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-medium text-navy-900">{o.customer.name}</td>
                  <td className="px-6 py-3 text-navy-600">{o.gallery.location.name}</td>
                  <td className="px-6 py-3 text-navy-600">{o.items.length}</td>
                  <td className="px-6 py-3 text-navy-600 text-xs">{o.paymentMethod}</td>
                  <td className="px-6 py-3 font-semibold text-navy-900">€{o.amount.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-xs text-navy-500">
                    {o.fulfillments.length > 0
                      ? `${o.fulfillments[0].status} · ${o.fulfillments[0].printLab.name}`
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <RefundButton
                      orderId={o.id}
                      amount={o.amount}
                      refunded={(o as any).refundedAmount || 0}
                      status={o.status}
                    />
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
