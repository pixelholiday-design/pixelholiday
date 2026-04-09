"use client";
import { useEffect, useState } from "react";
import { Shield, AlertTriangle, Info, RefreshCw, Loader2, Filter } from "lucide-react";

type AlertSeverity = "HIGH" | "MEDIUM" | "LOW";
type AlertType =
  | "CASH_DISCREPANCY"
  | "NO_SHOW_STAFF"
  | "POS_ANOMALY"
  | "EXCESSIVE_REFUNDS"
  | "OFF_HOURS_ACTIVITY";

interface FraudAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  locationId?: string;
  staffId?: string;
}

const TYPE_LABELS: Record<AlertType, string> = {
  CASH_DISCREPANCY: "Cash Discrepancy",
  NO_SHOW_STAFF: "No-Show Staff",
  POS_ANOMALY: "POS Anomaly",
  EXCESSIVE_REFUNDS: "Excessive Refunds",
  OFF_HOURS_ACTIVITY: "Off-Hours Activity",
};

const ALL_TYPES: AlertType[] = [
  "CASH_DISCREPANCY",
  "NO_SHOW_STAFF",
  "POS_ANOMALY",
  "EXCESSIVE_REFUNDS",
  "OFF_HOURS_ACTIVITY",
];

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const classes =
    severity === "HIGH"
      ? "bg-red-100 text-red-700 border border-red-200"
      : severity === "MEDIUM"
      ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
      : "bg-brand-100 text-brand-700 border border-brand-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${classes}`}>
      {severity === "HIGH" && <AlertTriangle className="h-3 w-3" />}
      {severity === "MEDIUM" && <AlertTriangle className="h-3 w-3" />}
      {severity === "LOW" && <Info className="h-3 w-3" />}
      {severity}
    </span>
  );
}

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<AlertType | "">("");
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "">("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/fraud-alerts").then((r) => r.json());
      setAlerts(r.alerts || []);
    } catch {
      setAlerts([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = alerts.filter((a) => {
    if (filterType && a.type !== filterType) return false;
    if (filterSeverity && a.severity !== filterSeverity) return false;
    return true;
  });

  const highCount = alerts.filter((a) => a.severity === "HIGH").length;
  const medCount = alerts.filter((a) => a.severity === "MEDIUM").length;
  const lowCount = alerts.filter((a) => a.severity === "LOW").length;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <div className="label-xs">Business</div>
          <h1 className="heading text-4xl mt-1 flex items-center gap-3">
            <Shield className="h-8 w-8 text-coral-500" />
            Fraud Alerts
          </h1>
          <p className="text-navy-400 mt-1">Real-time detection of suspicious patterns across all locations.</p>
        </div>
        <button onClick={load} disabled={loading} className="btn-ghost flex items-center gap-2 mt-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </header>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{highCount}</div>
            <div className="text-xs text-navy-400 uppercase tracking-wider">High severity</div>
          </div>
        </div>
        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{medCount}</div>
            <div className="text-xs text-navy-400 uppercase tracking-wider">Medium severity</div>
          </div>
        </div>
        <div className="card px-6 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
            <Info className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-navy-900">{lowCount}</div>
            <div className="text-xs text-navy-400 uppercase tracking-wider">Low severity</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card px-6 py-4 flex items-center gap-4">
        <Filter className="h-4 w-4 text-coral-500 shrink-0" />
        <label className="text-sm font-medium text-navy-700 shrink-0">Filter by type:</label>
        <select
          className="input max-w-xs"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as AlertType | "")}
        >
          <option value="">All types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
        <label className="text-sm font-medium text-navy-700 shrink-0 ml-4">Severity:</label>
        <select
          className="input max-w-xs"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as AlertSeverity | "")}
        >
          <option value="">All severities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Alert list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70 flex items-center gap-2">
          <Shield className="h-4 w-4 text-coral-500" />
          <h2 className="heading text-lg">
            Active Alerts
            <span className="ml-2 text-sm font-normal text-navy-400">({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Scanning for anomalies…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-navy-600 font-medium">No alerts detected</p>
            <p className="text-navy-400 text-sm mt-1">All operations appear normal for today.</p>
          </div>
        ) : (
          <ul className="divide-y divide-cream-300/70">
            {filtered.map((alert) => (
              <li key={alert.id} className={`px-6 py-4 flex items-start gap-4 ${
                alert.severity === "HIGH" ? "bg-red-50/40" :
                alert.severity === "MEDIUM" ? "bg-yellow-50/30" : ""
              }`}>
                <div className="mt-0.5">
                  {alert.severity === "HIGH" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : alert.severity === "MEDIUM" ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Info className="h-5 w-5 text-brand-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-navy-900 text-sm">{alert.title}</span>
                    <SeverityBadge severity={alert.severity} />
                    <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-600">
                      {TYPE_LABELS[alert.type]}
                    </span>
                  </div>
                  <p className="text-sm text-navy-600 mt-1">{alert.description}</p>
                  {(alert.locationId || alert.staffId) && (
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-navy-400">
                      {alert.locationId && <span>Location: <code className="font-mono">{alert.locationId}</code></span>}
                      {alert.staffId && <span>Staff: <code className="font-mono">{alert.staffId}</code></span>}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
