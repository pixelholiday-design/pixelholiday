"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Banknote, Loader2, Lock, Plus, AlertTriangle, Check } from "lucide-react";

export default function RegisterDetail() {
  const params = useParams<{ locationId: string }>();
  const [data, setData] = useState<any>(null);
  const [opening, setOpening] = useState("100");
  const [actual, setActual] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setData(null);
    const r = await fetch(`/api/admin/cash/${params.locationId}`).then((r) => r.json());
    setData(r);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [params.locationId]);

  async function openReg() {
    setBusy(true);
    await fetch("/api/admin/cash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: params.locationId, openingBalance: parseFloat(opening) }),
    });
    setBusy(false);
    load();
  }

  async function closeReg() {
    if (!data?.register) return;
    setBusy(true);
    await fetch(`/api/admin/cash/${params.locationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registerId: data.register.id, actualBalance: parseFloat(actual) }),
    });
    setBusy(false);
    load();
  }

  if (!data) {
    return <div className="card p-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-navy-400" /></div>;
  }

  const reg = data.register;

  if (!reg) {
    return (
      <div className="space-y-6">
        <header>
          <div className="label-xs">Cash management</div>
          <h1 className="heading text-4xl mt-1">Open today's register</h1>
          <p className="text-navy-400 mt-1">Enter the opening drawer balance to start the day.</p>
        </header>
        <div className="card p-6 max-w-md">
          <label className="block">
            <div className="label-xs mb-1.5">Opening balance (€)</div>
            <input type="number" className="input" value={opening} onChange={(e) => setOpening(e.target.value)} />
          </label>
          <button onClick={openReg} disabled={busy} className="btn-primary w-full mt-4">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Open register
          </button>
        </div>
      </div>
    );
  }

  const cashIn = reg.transactions.filter((t: any) => t.type === "SALE").length;
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">{reg.location.name}</div>
          <h1 className="heading text-4xl mt-1">Register · {new Date(reg.date).toLocaleDateString()}</h1>
          <p className="text-navy-400 mt-1">Opened by {reg.openedBy} · status <strong>{reg.status}</strong></p>
        </div>
        {reg.discrepancy != null && Math.abs(reg.discrepancy) > 5 && (
          <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2 flex items-center gap-2 text-coral-700 text-sm">
            <AlertTriangle className="h-4 w-4" /> Discrepancy €{reg.discrepancy.toFixed(2)}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Stat label="Opening" value={`€${reg.openingBalance.toFixed(2)}`} />
        <Stat label="Cash in" value={`€${reg.totalCashIn.toFixed(2)}`} accent="green" />
        <Stat label="Out + expenses" value={`€${(reg.totalCashOut + reg.totalExpenses).toFixed(2)}`} accent="coral" />
        <Stat label="Expected" value={`€${reg.expectedBalance.toFixed(2)}`} accent="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg">Transactions ({reg.transactions.length})</h2>
          </div>
          {reg.transactions.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">No transactions yet.</div>
          ) : (
            <ul className="divide-y divide-cream-300/70 max-h-96 overflow-y-auto">
              {reg.transactions.map((t: any) => (
                <li key={t.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-navy-900">{t.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-navy-400">{new Date(t.createdAt).toLocaleTimeString()} · {t.description || ""}</div>
                  </div>
                  <div className={t.amount >= 0 ? "text-green-600 font-semibold" : "text-coral-600 font-semibold"}>
                    {t.amount >= 0 ? "+" : ""}€{t.amount.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg">Petty cash ({reg.expenses.length})</h2>
          </div>
          {reg.expenses.length === 0 ? (
            <div className="p-8 text-center text-navy-400 text-sm">No expenses logged.</div>
          ) : (
            <ul className="divide-y divide-cream-300/70">
              {reg.expenses.map((e: any) => (
                <li key={e.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-navy-900">{e.reason}</div>
                    <div className="text-xs text-navy-400">{new Date(e.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-coral-600 font-semibold">-€{e.amount.toFixed(2)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {reg.status === "OPEN" && (
        <div className="card p-6">
          <h2 className="heading text-lg mb-4">Close & reconcile</h2>
          <p className="text-sm text-navy-500 mb-4">
            Count the drawer and enter the actual amount. The system will calculate the discrepancy.
          </p>
          <div className="flex gap-3 max-w-md">
            <input
              type="number"
              className="input"
              placeholder={`Expected: €${reg.expectedBalance.toFixed(2)}`}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
            <button onClick={closeReg} disabled={busy || !actual} className="btn-primary whitespace-nowrap">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Close register
            </button>
          </div>
        </div>
      )}

      {reg.status === "RECONCILED" && (
        <div className="card p-6 bg-green-50/70 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl text-navy-900">Reconciled</div>
              <div className="text-sm text-navy-500">
                Closed at {reg.closedAt && new Date(reg.closedAt).toLocaleString()} by {reg.closedBy}.
                Counted €{reg.actualBalance?.toFixed(2)} (discrepancy €{reg.discrepancy?.toFixed(2)})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: any) {
  const tint =
    accent === "coral" ? "text-coral-600" :
    accent === "gold" ? "text-gold-600" :
    accent === "green" ? "text-green-600" :
    "text-navy-900";
  return (
    <div className="stat-card">
      <div className="label-xs">{label}</div>
      <div className={`font-display text-3xl ${tint}`}>{value}</div>
    </div>
  );
}
