"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

type Alert = {
  id: string;
  severity: "RED" | "YELLOW" | "GREEN";
  title: string;
  body: string;
  category: string;
  locationId?: string | null;
  actionHref?: string;
};

const styleFor = (sev: Alert["severity"]) => {
  if (sev === "RED") return { bg: "bg-red-50 border-red-200", icon: AlertTriangle, iconColor: "text-red-600", dot: "🔴" };
  if (sev === "YELLOW") return { bg: "bg-gold-50 border-gold-200", icon: AlertCircle, iconColor: "text-gold-600", dot: "🟡" };
  return { bg: "bg-green-50 border-green-200", icon: TrendingUp, iconColor: "text-green-600", dot: "🟢" };
};

export default function AlertsPanel({
  locationId,
  title = "Needs Your Attention",
  emptyMessage = "All clear — nothing to flag right now.",
}: {
  locationId?: string;
  title?: string;
  emptyMessage?: string;
}) {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (locationId) params.set("locationId", locationId);
    fetch(`/api/admin/alerts?${params}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts || []))
      .catch(() => setAlerts([]));
  }, [locationId]);

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-cream-300/70 flex items-center justify-between">
        <h2 className="heading text-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-coral-500" /> {title}
        </h2>
        {alerts && (
          <div className="text-xs text-navy-400">
            {alerts.filter((a) => a.severity === "RED").length} critical · {alerts.filter((a) => a.severity === "YELLOW").length} warnings
          </div>
        )}
      </div>
      {alerts === null ? (
        <div className="p-10 text-center text-navy-400 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Running health checks…
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-10 text-center">
          <div className="text-3xl">🎉</div>
          <div className="font-display text-xl text-navy-900 mt-2">{emptyMessage}</div>
        </div>
      ) : (
        <div className="divide-y divide-cream-300/60">
          {alerts.map((a) => {
            const s = styleFor(a.severity);
            const Icon = s.icon;
            const content = (
              <div className={`flex items-start gap-3 px-6 py-4 ${s.bg} border-l-4`}>
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${s.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy-900">{a.title}</div>
                  <div className="text-sm text-navy-600 mt-0.5">{a.body}</div>
                  <div className="text-[10px] uppercase tracking-wider text-navy-400 mt-1">{a.category}</div>
                </div>
                {a.actionHref && <ArrowRight className="h-4 w-4 text-navy-400 shrink-0" />}
              </div>
            );
            return a.actionHref ? (
              <Link key={a.id} href={a.actionHref} className="block hover:opacity-90 transition">
                {content}
              </Link>
            ) : (
              <div key={a.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
