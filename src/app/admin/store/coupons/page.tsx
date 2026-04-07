import { prisma } from "@/lib/db";
import { Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Coupons</h1>
        <p className="text-navy-400 mt-1">Discount codes for the customer gallery store.</p>
      </header>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Active codes</h2>
        </div>
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No coupons yet</div>
            <div className="text-sm text-navy-400 mt-1">Create your first discount code below.</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Value</th>
                <th className="px-6 py-3">Used</th>
                <th className="px-6 py-3">Expires</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-mono font-semibold text-navy-900">{c.code}</td>
                  <td className="px-6 py-3 text-navy-600">{c.type}</td>
                  <td className="px-6 py-3 text-navy-900 font-semibold">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : c.type === "FIXED_AMOUNT" ? `€${c.value}` : "Free shipping"}
                  </td>
                  <td className="px-6 py-3 text-navy-600">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-6 py-3 text-xs text-navy-500">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-1 ${
                        c.isActive ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-500"
                      }`}
                    >
                      {c.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
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
