import { prisma } from "@/lib/db";
import { Banknote, Clock, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payouts — Admin — Fotiqo" };

export default async function AdminPayoutsPage() {
  const bookings = await prisma.marketplaceBooking.findMany({
    where: { isPaid: true },
    include: {
      photographer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const pending = bookings.filter((b) => b.payoutStatus === "PENDING" || b.payoutStatus === "HELD");
  const released = bookings.filter((b) => b.payoutStatus === "RELEASED" || b.payoutStatus === "PAID");
  const cancelled = bookings.filter((b) => b.payoutStatus === "CANCELLED");

  const totalPending = pending.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);
  const totalReleased = released.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);
  const totalPlatformFees = bookings.reduce((s, b) => s + (b.platformFee ?? 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Finance</div>
        <h1 className="heading text-4xl mt-1">Payouts</h1>
        <p className="text-navy-400 mt-1">Manage photographer payouts and platform fees.</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Pending payouts</div>
          <div className="font-display text-2xl text-navy-900">{pending.length}</div>
          <div className="text-xs text-navy-400">{"\u20AC"}{totalPending.toFixed(2)} owed</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Completed payouts</div>
          <div className="font-display text-2xl text-navy-900">{released.length}</div>
          <div className="text-xs text-navy-400">{"\u20AC"}{totalReleased.toFixed(2)} paid</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">
            <XCircle className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Cancelled</div>
          <div className="font-display text-2xl text-navy-900">{cancelled.length}</div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-navy-800/10 text-navy-700 flex items-center justify-center">
            <Banknote className="h-4 w-4" />
          </div>
          <div className="label-xs mt-3">Platform fees earned</div>
          <div className="font-display text-2xl text-navy-900">{"\u20AC"}{totalPlatformFees.toFixed(2)}</div>
        </div>
      </div>

      {/* Pending payouts table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70 flex items-center justify-between">
          <h2 className="heading text-lg">Pending Payouts</h2>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            {pending.length} awaiting
          </span>
        </div>
        {pending.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-sm">No pending payouts.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Photographer</th>
                <th className="px-6 py-3">Booking</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Booking total</th>
                <th className="px-6 py-3 text-right">Platform fee</th>
                <th className="px-6 py-3 text-right">Payout amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {pending.map((b) => (
                <tr key={b.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3">
                    <div className="font-medium text-navy-900">{b.photographer.name}</div>
                    <div className="text-xs text-navy-400">{b.photographer.email}</div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-navy-600">{b.sessionType}</div>
                    <div className="text-xs text-navy-400">
                      {b.sessionDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        b.payoutStatus === "HELD"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {b.payoutStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-navy-600">
                    {"\u20AC"}{b.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right text-navy-400">
                    {"\u20AC"}{(b.platformFee ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right font-display text-lg text-navy-900">
                    {"\u20AC"}{(b.photographerPayout ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent completed payouts */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Completed Payouts</h2>
        </div>
        {released.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-sm">No completed payouts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Photographer</th>
                <th className="px-6 py-3">Session</th>
                <th className="px-6 py-3">Paid at</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {released.slice(0, 50).map((b) => (
                <tr key={b.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 font-medium text-navy-900">{b.photographer.name}</td>
                  <td className="px-6 py-3 text-navy-600">{b.sessionType}</td>
                  <td className="px-6 py-3 text-navy-400 text-xs">
                    {b.payoutAt
                      ? b.payoutAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-right font-display text-lg text-green-700">
                    {"\u20AC"}{(b.photographerPayout ?? 0).toFixed(2)}
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
