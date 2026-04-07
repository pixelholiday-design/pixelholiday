"use client";
import { useEffect, useState } from "react";
import { Moon, Sparkles, TrendingUp, Loader2, Save } from "lucide-react";

type Campaign = {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  discountPct: number;
  delayDays: number;
  template: string;
};

export default function SleepingMoneyPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setData(null);
    const r = await fetch("/api/admin/sleeping-money").then((r) => r.json());
    setData(r);
  }
  useEffect(() => { load(); }, []);

  async function save(id: string, patch: Partial<Campaign>) {
    setSaving(id);
    await fetch("/api/admin/sleeping-money", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    setSaving(null);
    load();
  }

  if (!data) {
    return (
      <div className="card p-12 text-center text-navy-400">
        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
      </div>
    );
  }

  const s = data.summary;
  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Business</div>
        <h1 className="heading text-4xl mt-1">Sleeping money</h1>
        <p className="text-navy-400 mt-1">Automated post-trip sales — abandoned-cart and sweep-up campaigns.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat label="Total automated revenue" value={`€${s.totalRevenue.toFixed(0)}`} icon={<Moon />} accent="coral" />
        <Stat label="Revenue this month" value={`€${s.revenueThisMonth.toFixed(0)}`} icon={<TrendingUp />} accent="green" />
        <Stat label="Active campaigns" value={`${s.activeCampaigns}`} icon={<Sparkles />} accent="gold" />
        <Stat label="Pending follow-ups" value={`${s.pendingFollowups}`} icon={<Moon />} />
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Campaigns</h2>
        </div>
        <ul className="divide-y divide-cream-300/70">
          {data.campaigns.map((c: Campaign) => (
            <li key={c.id} className="p-6 flex flex-col lg:flex-row gap-5 lg:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="heading text-lg">{c.name}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-navy-400">{c.type}</span>
                  <span
                    className={`inline-flex items-center rounded-full text-[10px] font-semibold px-2 py-0.5 ${
                      c.enabled ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-500"
                    }`}
                  >
                    {c.enabled ? "ACTIVE" : "PAUSED"}
                  </span>
                </div>
                <p className="text-sm text-navy-500 italic">"{c.template}"</p>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:w-72">
                <label className="block">
                  <div className="label-xs mb-1">Delay (days)</div>
                  <input
                    type="number"
                    className="input"
                    defaultValue={c.delayDays}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (v !== c.delayDays) save(c.id, { delayDays: v });
                    }}
                  />
                </label>
                <label className="block">
                  <div className="label-xs mb-1">Discount %</div>
                  <input
                    type="number"
                    className="input"
                    defaultValue={Math.round(c.discountPct * 100)}
                    onBlur={(e) => {
                      const v = parseFloat(e.target.value) / 100;
                      if (v !== c.discountPct) save(c.id, { discountPct: v });
                    }}
                  />
                </label>
              </div>
              <button
                onClick={() => save(c.id, { enabled: !c.enabled })}
                disabled={saving === c.id}
                className={c.enabled ? "btn-secondary" : "btn-primary"}
              >
                {saving === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {c.enabled ? "Pause" : "Activate"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">Recent automated sales</h2>
        </div>
        {data.recent.length === 0 ? (
          <div className="p-12 text-center text-navy-400 text-sm">No automated sales yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {data.recent.map((r: any) => (
                <tr key={r.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 text-navy-900">{r.customer}</td>
                  <td className="px-6 py-3 text-navy-700 font-semibold">€{r.amount.toFixed(2)}</td>
                  <td className="px-6 py-3 text-navy-500">{r.discountApplied ? `${Math.round(r.discountApplied * 100)}%` : "—"}</td>
                  <td className="px-6 py-3 text-xs text-navy-400">{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent?: "coral" | "green" | "gold" }) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "gold" ? "bg-gold-500/10 text-gold-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900 truncate">{value}</div>
    </div>
  );
}
