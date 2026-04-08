"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, ShoppingBag, Users, Loader2 } from "lucide-react";

export default function SalesDashboardClient({ user }: { user: { name: string } }) {
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    fetch("/api/me/today")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    );
  }
  const salesToday = data.progress?.revenueToday ?? 0;
  const target = data.targets?.revenue ?? 200;
  const pct = target > 0 ? Math.min(100, (salesToday / target) * 100) : 0;

  return (
    <div className="min-h-screen bg-cream-100 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header>
          <div className="label-xs">Sales desk</div>
          <h1 className="heading text-4xl mt-1">Hello, {user.name}</h1>
          <p className="text-navy-400 mt-1">Close the day strong 💪</p>
        </header>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="label-xs">Today's sales</div>
              <div className="font-display text-4xl text-coral-600">€{salesToday.toFixed(0)}</div>
            </div>
            <div className="text-right">
              <div className="label-xs">Target</div>
              <div className="font-display text-2xl text-navy-900">€{target}</div>
            </div>
          </div>
          <div className="h-3 rounded-full bg-cream-200 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-coral-500 to-gold-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="text-xs text-navy-400 mt-2 text-right">{pct.toFixed(0)}% of target</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Stat icon={<ShoppingBag className="h-4 w-4" />} label="Orders today" value={`${data.progress?.appointmentsToday ?? 0}`} />
          <Stat icon={<Wallet className="h-4 w-4" />} label="Commissions MTD" value={`€${(data.earnings?.commissions ?? 0).toFixed(0)}`} />
          <Stat icon={<Users className="h-4 w-4" />} label="Kiosk queue" value="—" sub="Open kiosk to check" />
        </div>

        <Link
          href="/kiosk/sale-point"
          className="block card p-8 text-center hover:shadow-card-hover transition"
        >
          <div className="font-display text-2xl text-navy-900">Open Sale Point</div>
          <div className="text-sm text-navy-400 mt-1">Process walk-in customers and close sales</div>
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: any) {
  return (
    <div className="stat-card">
      <div className="h-9 w-9 rounded-xl bg-coral-500/10 text-coral-600 flex items-center justify-center">{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}
