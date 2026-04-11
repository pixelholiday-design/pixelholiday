import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Banknote, Clock, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Payouts — Fotiqo" };

export default async function DashboardPayoutsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as any).id;

  const bookings = await prisma.marketplaceBooking.findMany({
    where: { photographerId: userId, isPaid: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const pending = bookings.filter((b) => b.payoutStatus === "PENDING" || b.payoutStatus === "HELD");
  const paid = bookings.filter((b) => b.payoutStatus === "RELEASED" || b.payoutStatus === "PAID");
  const cancelled = bookings.filter((b) => b.payoutStatus === "CANCELLED");

  const totalPending = pending.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);
  const totalPaid = paid.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);
  const totalLifetime = bookings.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = paid.filter((b) => b.payoutAt && b.payoutAt >= startOfMonth);
  const totalThisMonth = thisMonth.reduce((s, b) => s + (b.photographerPayout ?? 0), 0);

  return (
    <div className="min-h-screen bg-cream-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your earnings and payout status across all marketplace bookings.
            </p>
          </div>
          <a href="/dashboard/payouts/onboard" className="btn-secondary text-sm">
            Stripe Connect Setup
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            label="Pending"
            value={`\u20AC${totalPending.toFixed(2)}`}
            sub={`${pending.length} booking${pending.length !== 1 ? "s" : ""}`}
          />
          <StatCard
            icon={<Banknote className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="This Month"
            value={`\u20AC${totalThisMonth.toFixed(2)}`}
            sub={`${thisMonth.length} payout${thisMonth.length !== 1 ? "s" : ""}`}
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            label="Total Paid"
            value={`\u20AC${totalPaid.toFixed(2)}`}
            sub={`${paid.length} completed`}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-[#0EA5A5]" />}
            iconBg="bg-[#0EA5A5]/10"
            label="Lifetime Earnings"
            value={`\u20AC${totalLifetime.toFixed(2)}`}
            sub="All time"
          />
        </div>

        {/* Pending notice */}
        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                {pending.length} payout{pending.length !== 1 ? "s" : ""} pending
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Payouts are released 48 hours after session completion. Funds are then transferred
                to your connected Stripe account within 2-5 business days.
              </p>
            </div>
          </div>
        )}

        {/* Payouts list */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Payout History</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Banknote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No payouts yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Complete your first booking to start earning.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((b) => {
                const statusColor =
                  b.payoutStatus === "PAID" || b.payoutStatus === "RELEASED"
                    ? "bg-emerald-50 text-emerald-700"
                    : b.payoutStatus === "HELD"
                    ? "bg-amber-50 text-amber-700"
                    : b.payoutStatus === "CANCELLED"
                    ? "bg-red-50 text-red-700"
                    : "bg-blue-50 text-blue-700";

                return (
                  <div key={b.id} className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {b.sessionType} &mdash; {b.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {b.sessionDate.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                      {b.payoutStatus}
                    </span>
                    <div className="text-right flex-shrink-0 w-24">
                      <p className="text-sm font-bold text-slate-900">
                        {"\u20AC"}{(b.photographerPayout ?? 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        of {"\u20AC"}{b.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
