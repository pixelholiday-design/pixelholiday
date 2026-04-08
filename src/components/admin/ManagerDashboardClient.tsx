"use client";
import { useEffect, useState } from "react";
import { MapPin, Users, Wallet, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import AlertsPanel from "./AlertsPanel";

export default function ManagerDashboardClient({ user }: { user: { name: string } }) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/manager-dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-navy-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Fleet view</div>
        <h1 className="heading text-4xl mt-1">{user.name}'s portfolio</h1>
        <p className="text-navy-400 mt-1">{data.locations?.length || 0} locations under your watch</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {(data.locations || []).map((loc: any) => {
          const above = loc.revenuePct >= 100;
          return (
            <Link
              key={loc.id}
              href={`/admin/dashboard?locationId=${loc.id}`}
              className={`card p-5 block border-l-4 ${above ? "border-green-500" : "border-coral-500"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-navy-500" />
                  <div className="font-semibold text-navy-900">{loc.name}</div>
                </div>
                <div className={`text-xs font-bold ${above ? "text-green-600" : "text-coral-600"}`}>
                  {loc.revenuePct}%
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-navy-400">Revenue</div>
                  <div className="font-display text-lg text-navy-900">€{loc.revenueToday.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-xs text-navy-400">Capture</div>
                  <div className="font-display text-lg text-navy-900">{loc.captureRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-navy-400">Staff</div>
                  <div className="font-display text-lg text-navy-900">{loc.staffCount}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <AlertsPanel title="Fix Now" />

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-navy-500" /> Staff roster today
          </h2>
        </div>
        {(data.rosterToday || []).length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No shifts scheduled for today.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/60">
                {data.rosterToday.map((r: any) => (
                  <tr key={r.id} className={r.absent ? "bg-red-50/50" : ""}>
                    <td className="px-6 py-3 font-medium text-navy-900">{r.name}</td>
                    <td className="px-6 py-3 text-navy-600">{r.locationName || "—"}</td>
                    <td className="px-6 py-3 text-navy-500">{r.role}</td>
                    <td className="px-6 py-3">
                      {r.absent ? (
                        <span className="inline-flex rounded-full bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1">
                          Absent
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1">
                          On duty
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
