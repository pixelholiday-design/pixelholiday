import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  // Treat B2BDelivery rows and completed SaaS subscription events as "invoices"
  // until a dedicated Invoice model exists.
  const b2b = await prisma.b2BDelivery.findMany({
    include: { location: true },
    orderBy: { id: "desc" },
    take: 25,
  });
  const barterTotal = b2b.reduce((s, b) => s + (b.rentDiscountPercent || 0) * 1, 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance · Invoices</div>
        <h1 className="heading text-4xl mt-1">Invoices & barter</h1>
        <p className="text-navy-400 mt-1">
          B2B media-barter deliveries (in lieu of cash rent) and vendor invoices.
        </p>
      </header>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">B2B media-barter deliveries ({b2b.length})</h2>
        </div>
        {b2b.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">None yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Photos delivered</th>
                <th className="px-6 py-3">Rent discount</th>
                <th className="px-6 py-3">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {b2b.map((d) => (
                <tr key={d.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 text-navy-700">{d.month}</td>
                  <td className="px-6 py-3 text-navy-700">{d.location.name}</td>
                  <td className="px-6 py-3 text-navy-600">{d.photoCount}</td>
                  <td className="px-6 py-3 text-green-600 font-semibold">
                    {d.rentDiscountPercent ? `${Math.round(d.rentDiscountPercent * 100)}%` : "—"}
                  </td>
                  <td className="px-6 py-3 text-xs text-navy-500">
                    {d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString() : "pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6 text-sm text-navy-500">
        <p>Traditional vendor invoices will land here once the Invoice model ships.</p>
      </div>
    </div>
  );
}
