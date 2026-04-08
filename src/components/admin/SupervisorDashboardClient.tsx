"use client";
import { useEffect, useState } from "react";
import { Clock, Users, TrendingUp, Wallet, CalendarCheck, Loader2 } from "lucide-react";
import AlertsPanel from "./AlertsPanel";

export default function SupervisorDashboardClient({
  user,
}: {
  user: { id: string; name: string; locationId?: string | null };
}) {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/admin/supervisor-dashboard${user.locationId ? `?locationId=${user.locationId}` : ""}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, [user.locationId]);

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
        <div className="label-xs">Floor Commander</div>
        <h1 className="heading text-4xl mt-1">Good day, {user.name.split(" ")[0]}</h1>
        <p className="text-navy-400 mt-1">{data.location?.name ?? "Your location"} — live floor view</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat
          icon={<Wallet className="h-4 w-4" />}
          label="Revenue today"
          value={`€${(data.revenueToday ?? 0).toFixed(0)}`}
          sub={data.targetDailyRevenue ? `Target €${data.targetDailyRevenue.toFixed(0)} · ${data.revenuePct}%` : ""}
          accent={data.revenuePct < 60 ? "coral" : "green"}
        />
        <Stat
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Appointments"
          value={`${data.appointments?.completed ?? 0}/${data.appointments?.total ?? 0}`}
          sub={`${data.appointments?.noShows ?? 0} no-shows`}
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Capture rate"
          value={`${data.captureRate ?? 0}%`}
          sub={data.targetCaptureRate ? `Target ${data.targetCaptureRate}%` : ""}
          accent={(data.captureRate ?? 0) < (data.targetCaptureRate ?? 40) ? "coral" : "green"}
        />
        <Stat
          icon={<Wallet className="h-4 w-4" />}
          label="Cash balance"
          value={`€${(data.cashBalance ?? 0).toFixed(0)}`}
          sub={data.cashRegisterStatus || "—"}
        />
      </div>

      <AlertsPanel locationId={user.locationId || undefined} title="Right Now" />

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg flex items-center gap-2">
            <Users className="h-4 w-4 text-navy-500" /> My team today
          </h2>
        </div>
        {(data.team || []).length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No photographers on duty yet.</div>
        ) : (
          <div className="divide-y divide-cream-300/60">
            {data.team.map((p: any) => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-coral-400 to-gold-500 text-white flex items-center justify-center font-semibold">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy-900">{p.name}</div>
                  <div className="text-xs text-navy-400">
                    {p.zone ? `${p.zone} · ${p.timeInZone}` : "No zone assigned"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-xs text-navy-400">Photos</div>
                    <div className="font-semibold text-navy-900">{p.photosToday}</div>
                  </div>
                  <div>
                    <div className="text-xs text-navy-400">Sales</div>
                    <div className="font-semibold text-navy-900">€{p.salesToday.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-navy-400">Conv.</div>
                    <div className={`font-semibold ${p.conversionRate < 0.5 ? "text-coral-600" : "text-green-600"}`}>
                      {(p.conversionRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-xl">
                  {p.mood === "green" ? "🟢" : p.mood === "yellow" ? "🟡" : "🔴"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.nextAppointment && (
        <div className="card p-6 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="label-xs">Next appointment</div>
            <div className="font-display text-xl text-navy-900">{data.nextAppointment.customer}</div>
            <div className="text-sm text-navy-500">
              {data.nextAppointment.time} — {data.nextAppointment.photographer || "Unassigned"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: "coral" | "green";
}) {
  const tint =
    accent === "coral" ? "bg-coral-500/10 text-coral-600" :
    accent === "green" ? "bg-green-500/10 text-green-600" :
    "bg-navy-800/10 text-navy-700";
  return (
    <div className="stat-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
      <div className="label-xs mt-3">{label}</div>
      <div className="font-display text-3xl text-navy-900">{value}</div>
      {sub && <div className="text-xs text-navy-400 mt-1">{sub}</div>}
    </div>
  );
}
