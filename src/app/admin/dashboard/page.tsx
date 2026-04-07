"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";
import {
  TrendingUp, Camera, Users, Wallet, Sparkles, AlertTriangle, ArrowUpRight,
} from "lucide-react";

type Dash = any;

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  if (err) {
    return (
      <EmptyBanner icon={<AlertTriangle className="h-5 w-5" />} title="Couldn't load dashboard" sub={err} />
    );
  }
  if (!data) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Overview</div>
          <h1 className="heading text-4xl mt-1">Studio Dashboard</h1>
          <p className="text-navy-400 mt-1">Real-time revenue, conversion, and team performance.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-navy-500 bg-white rounded-xl px-4 py-2 shadow-card border border-cream-300/60">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat
          label="Total Revenue"
          value={eur(data.totalRevenue || 0)}
          icon={<Wallet className="h-4 w-4" />}
          accent="coral"
          trend="+12.4%"
        />
        <Stat
          label="Galleries Today"
          value={`${data.conversion?.uploaded || 0}`}
          icon={<Camera className="h-4 w-4" />}
          accent="navy"
          trend={`${data.conversion?.sold || 0} sold`}
        />
        <Stat
          label="Conversion Rate"
          value={`${conversionRate(data).toFixed(0)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="gold"
          trend="uploaded → sold"
        />
        <Stat
          label="Pending Payouts"
          value={eur(data.pendingPayouts || 0)}
          icon={<Users className="h-4 w-4" />}
          accent="coral"
          trend="This month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue trend */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="heading text-xl">Revenue by location</h2>
              <p className="text-xs text-navy-400 mt-1">All-time sales</p>
            </div>
            <div className="text-coral-500 text-xs font-semibold flex items-center gap-1">
              View detail <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.revenueByLocation || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E7DD" vertical={false} />
              <XAxis dataKey="name" stroke="#7A8EAC" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#7A8EAC" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #E9E7DD",
                  borderRadius: 12,
                  boxShadow: "0 12px 36px -12px rgba(15,27,45,.25)",
                }}
              />
              <Bar dataKey="revenue" fill="#E8593C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion */}
        <div className="card p-6 flex flex-col">
          <h2 className="heading text-xl">Sales mix</h2>
          <p className="text-xs text-navy-400 mt-1">Manual vs automated</p>
          <div className="flex-1 flex flex-col justify-center gap-5 mt-6">
            <MixRow
              label="Manual"
              value={data.salesBreakdown?.manual?.revenue || 0}
              total={mixTotal(data)}
              color="bg-coral-500"
            />
            <MixRow
              label="Sleeping Money"
              value={data.salesBreakdown?.automated?.revenue || 0}
              total={mixTotal(data)}
              color="bg-gold-500"
            />
          </div>
          <div className="mt-6 pt-6 border-t border-cream-300/70 flex items-center gap-2 text-xs text-navy-400">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Automation drives post-trip revenue.
          </div>
        </div>
      </div>

      {/* Photographer leaderboard */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading text-xl">Top photographers</h2>
            <p className="text-xs text-navy-400 mt-1">By conversion</p>
          </div>
        </div>
        {(data.photographerStats || []).length === 0 ? (
          <EmptyState label="No photographer stats yet" sub="Start uploading galleries to see data here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 border-b border-cream-300/70">
                  <th className="pb-3">Photographer</th>
                  <th className="pb-3">Uploaded</th>
                  <th className="pb-3">Sold</th>
                  <th className="pb-3">Rate</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/60">
                {(data.photographerStats || []).map((p: any, i: number) => (
                  <tr key={p.id} className="group hover:bg-cream-100/60 transition">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral-300 to-gold-400 text-white flex items-center justify-center font-semibold">
                          {p.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-navy-900">{p.name}</div>
                          <div className="text-xs text-navy-400">Rank #{i + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-navy-600">{p.uploaded}</td>
                    <td className="py-3 text-navy-600">{p.sold}</td>
                    <td className="py-3">
                      <span className="font-semibold text-navy-900">
                        {(p.conversionRate * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {p.flagged ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 text-coral-700 text-xs font-medium px-2.5 py-1">
                          <AlertTriangle className="h-3 w-3" /> Needs coaching
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1">
                          On target
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function eur(n: number) {
  return `€${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function conversionRate(d: Dash) {
  const u = d.conversion?.uploaded || 0;
  const s = d.conversion?.sold || 0;
  return u ? (s / u) * 100 : 0;
}
function mixTotal(d: Dash) {
  return (d.salesBreakdown?.manual?.revenue || 0) + (d.salesBreakdown?.automated?.revenue || 0);
}

function Stat({
  label,
  value,
  icon,
  accent,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: "coral" | "navy" | "gold";
  trend?: string;
}) {
  const dot =
    accent === "coral"
      ? "bg-coral-500/10 text-coral-600"
      : accent === "gold"
      ? "bg-gold-500/10 text-gold-600"
      : "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${dot}`}>{icon}</div>
        {trend && <div className="text-xs font-medium text-green-600">{trend}</div>}
      </div>
      <div className="label-xs mt-4">{label}</div>
      <div className="font-display text-3xl text-navy-900 tracking-tight">{value}</div>
    </div>
  );
}

function MixRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-navy-600">{label}</span>
        <span className="font-semibold text-navy-900">{eur(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[11px] text-navy-400 mt-1">{pct.toFixed(0)}% of total</div>
    </div>
  );
}

function EmptyState({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="text-center py-16 text-navy-400">
      <div className="font-medium text-navy-600">{label}</div>
      {sub && <div className="text-xs mt-1">{sub}</div>}
    </div>
  );
}

function EmptyBanner({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="card p-10 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-coral-50 text-coral-600 mb-4">
        {icon}
      </div>
      <div className="heading text-2xl mb-1">{title}</div>
      {sub && <div className="text-navy-400 text-sm">{sub}</div>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-cream-200 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-2xl shadow-card" />
        ))}
      </div>
      <div className="h-80 bg-white rounded-2xl shadow-card" />
    </div>
  );
}
