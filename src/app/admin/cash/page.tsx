"use client";
import { useEffect, useState } from "react";
import { Banknote, ArrowDownToLine, AlertTriangle, Loader2, Wallet, ArrowRightLeft } from "lucide-react";
import Link from "next/link";

export default function CashDashboard() {
  const [data, setData] = useState<any>(null);

  async function load() {
    setData(null);
    const r = await fetch("/api/admin/cash").then((r) => r.json());
    setData(r);
  }
  useEffect(() => { load(); }, []);

  if (!data) {
    return <div className="card p-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-navy-400" /></div>;
  }

  const s = data.summary;
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Business</div>
          <h1 className="heading text-4xl mt-1">Cash management</h1>
          <p className="text-navy-400 mt-1">Live registers, transactions, handovers, and reconciliation across all locations.</p>
        </div>
        <a href="/api/admin/cash/export?days=30" className="btn-secondary">
          <ArrowDownToLine className="h-4 w-4" /> Export 30d CSV
        </a>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Cash in (today)" value={`€${s.totalCashIn.toFixed(0)}`} icon={<Banknote />} accent="green" />
        <Stat label="Change out" value={`€${s.totalCashOut.toFixed(0)}`} icon={<ArrowRightLeft />} accent="coral" />
        <Stat label="Net cash" value={`€${s.netCash.toFixed(0)}`} icon={<Wallet />} accent="gold" />
        <Stat label="Pending handovers" value={`${s.pendingHandovers}`} icon={<AlertTriangle />} accent={s.pendingHandovers > 0 ? "coral" : "navy"} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Today's registers</h2>
        </div>
        {data.todayRegisters.length === 0 ? (
          <div className="p-10 text-center text-navy-400 text-sm">No registers opened today.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Opening</th>
                <th className="px-6 py-3">Cash in</th>
                <th className="px-6 py-3">Out + expenses</th>
                <th className="px-6 py-3">Expected</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {data.todayRegisters.map((r: any) => (
                <tr key={r.id} className={r.status === "DISCREPANCY" ? "bg-coral-50/50" : "hover:bg-cream-100/60"}>
                  <td className="px-6 py-3 font-medium text-navy-900">{r.location.name}</td>
                  <td className="px-6 py-3 text-navy-600">€{r.openingBalance.toFixed(2)}</td>
                  <td className="px-6 py-3 text-green-600">€{r.totalCashIn.toFixed(2)}</td>
                  <td className="px-6 py-3 text-coral-600">€{(r.totalCashOut + r.totalExpenses).toFixed(2)}</td>
                  <td className="px-6 py-3 font-semibold text-navy-900">€{r.expectedBalance.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <StatusPill status={r.status} discrepancy={r.discrepancy} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/admin/cash/${r.locationId}`} className="text-coral-600 hover:underline text-xs font-semibold">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg">Payment mix (this month)</h2>
          </div>
          <div className="p-6 space-y-4">
            {data.breakdown.map((b: any) => {
              const total = data.breakdown.reduce((s: number, x: any) => s + (x._sum.amount || 0), 0);
              const pct = total > 0 ? ((b._sum.amount || 0) / total) * 100 : 0;
              return (
                <div key={b.paymentMethod}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-navy-600">{b.paymentMethod.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-navy-900">€{(b._sum.amount || 0).toFixed(0)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.paymentMethod === "CASH" ? "bg-green-500" :
                        b.paymentMethod === "STRIPE_TERMINAL" ? "bg-coral-500" : "bg-gold-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg">Recent cash transactions</h2>
          </div>
          {data.recent.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">None yet.</div>
          ) : (
            <ul className="divide-y divide-cream-300/70">
              {data.recent.slice(0, 8).map((t: any) => (
                <li key={t.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-navy-900">{t.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-navy-400">{t.cashRegister.location.name} · {new Date(t.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className={t.amount >= 0 ? "text-green-600 font-semibold" : "text-coral-600 font-semibold"}>
                    {t.amount >= 0 ? "+" : ""}€{t.amount.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: any) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "gold" ? "bg-gold-500/10 text-gold-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
    </div>
  );
}

function StatusPill({ status, discrepancy }: { status: string; discrepancy: number | null }) {
  const tones: Record<string, string> = {
    OPEN: "bg-green-50 text-green-700",
    CLOSED: "bg-cream-200 text-navy-600",
    RECONCILED: "bg-green-50 text-green-700",
    DISCREPANCY: "bg-coral-50 text-coral-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-1 ${tones[status] || "bg-cream-200"}`}>
      {status}{discrepancy != null && status === "DISCREPANCY" && ` · €${discrepancy.toFixed(2)}`}
    </span>
  );
}
