"use client";
import { useEffect, useState } from "react";
import { Wallet, Trophy, ArrowDownToLine, Loader2, Check } from "lucide-react";

type Row = {
  userId: string;
  name: string;
  email: string;
  totalSales: number;
  commission: number;
  paidCommission: number;
  unpaidCommission: number;
};

export default function PayrollPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<{ rows: Row[]; summary: any } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setData(null);
    const r = await fetch(`/api/admin/payroll?month=${month}`).then((r) => r.json());
    setData(r);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [month]);

  async function markPaid(userId?: string, all?: boolean) {
    setBusy(userId || "all");
    await fetch("/api/admin/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, userId, all }),
    });
    setBusy(null);
    load();
  }

  function exportCsv() {
    if (!data) return;
    const lines = ["name,email,total_sales,commission,paid,unpaid"];
    for (const r of data.rows) {
      lines.push(`${r.name},${r.email},${r.totalSales.toFixed(2)},${r.commission.toFixed(2)},${r.paidCommission.toFixed(2)},${r.unpaidCommission.toFixed(2)}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Build last 12 months
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Business</div>
          <h1 className="heading text-4xl mt-1">Payroll</h1>
          <p className="text-navy-400 mt-1">Monthly commissions per photographer.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input !w-auto" value={month} onChange={(e) => setMonth(e.target.value)}>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={exportCsv} disabled={!data} className="btn-secondary">
            <ArrowDownToLine className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => markPaid(undefined, true)} disabled={busy === "all" || !data} className="btn-primary">
            {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Mark all paid
          </button>
        </div>
      </header>

      {!data ? (
        <div className="card p-12 text-center text-navy-400">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <Stat label="Owed this month" value={`€${data.summary.totalOwed.toFixed(0)}`} icon={<Wallet />} accent="coral" />
            <Stat label="Paid YTD" value={`€${data.summary.ytdPaid.toFixed(0)}`} icon={<Wallet />} accent="green" />
            <Stat label="Highest earner" value={data.summary.highestEarner?.name || "—"} sub={data.summary.highestEarner ? `€${data.summary.highestEarner.commission.toFixed(0)}` : ""} icon={<Trophy />} accent="gold" />
            <Stat label="Lowest earner" value={data.summary.lowestEarner?.name || "—"} sub={data.summary.lowestEarner ? `€${data.summary.lowestEarner.commission.toFixed(0)}` : ""} icon={<Wallet />} />
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-cream-300/70">
              <h2 className="heading text-lg">Photographers</h2>
            </div>
            {data.rows.length === 0 ? (
              <div className="p-16 text-center text-navy-400">No commissions for {month}.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                    <th className="px-6 py-3">Photographer</th>
                    <th className="px-6 py-3">Total sales</th>
                    <th className="px-6 py-3">Commission</th>
                    <th className="px-6 py-3">Paid</th>
                    <th className="px-6 py-3">Unpaid</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-300/70">
                  {data.rows.map((r) => (
                    <tr key={r.userId} className="hover:bg-cream-100/60">
                      <td className="px-6 py-3">
                        <div className="font-medium text-navy-900">{r.name}</div>
                        <div className="text-xs text-navy-400">{r.email}</div>
                      </td>
                      <td className="px-6 py-3 text-navy-600">€{r.totalSales.toFixed(2)}</td>
                      <td className="px-6 py-3 font-semibold text-navy-900">€{r.commission.toFixed(2)}</td>
                      <td className="px-6 py-3 text-green-600">€{r.paidCommission.toFixed(2)}</td>
                      <td className="px-6 py-3 text-coral-600 font-semibold">€{r.unpaidCommission.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          disabled={r.unpaidCommission === 0 || busy === r.userId}
                          onClick={() => markPaid(r.userId)}
                          className="btn-primary !py-2 !px-3 text-xs disabled:!opacity-30"
                        >
                          {busy === r.userId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Mark paid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: React.ReactNode; accent?: "coral" | "green" | "gold" }) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "gold" ? "bg-gold-500/10 text-gold-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-2xl text-navy-900 truncate">{value}</div>
      {sub && <div className="text-xs text-navy-400">{sub}</div>}
    </div>
  );
}
