"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, XCircle, Database, Shield, CreditCard,
  Image, HardDrive, Mail, Brain, Truck, RefreshCw, ExternalLink,
  Server, Globe,
} from "lucide-react";

type VarInfo = {
  key: string;
  service: string;
  category: string;
  docs: string;
  set: boolean;
  hint: string;
};

type SetupData = {
  database: { connected: boolean; latency: string; tableCount: number };
  variables: VarInfo[];
  summary: { configured: number; total: number; readiness: number };
};

const CATEGORY_ICONS: Record<string, any> = {
  Database: Database,
  Auth: Shield,
  Payments: CreditCard,
  Images: Image,
  Storage: HardDrive,
  Email: Mail,
  AI: Brain,
  Fulfillment: Truck,
};

export default function SetupPage() {
  const [data, setData] = useState<SetupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/setup").then((r) => r.json()),
      fetch("/api/health").then((r) => r.json()),
    ])
      .then(([setup, h]) => {
        setData(setup);
        setHealth(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-brand-400" />
          <span className="text-navy-500">Checking services...</span>
        </div>
      </div>
    );
  }

  // Group variables by category
  const categories = Array.from(new Set(data.variables.map((v) => v.category)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Production Setup</h1>
          <p className="text-navy-500 mt-1 text-sm">Environment configuration and service health</p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Readiness score */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-navy-500 uppercase tracking-wide">Readiness</div>
            <div className="font-display text-4xl text-navy-900">{data.summary.readiness}%</div>
            <div className="text-sm text-navy-400 mt-1">
              {data.summary.configured} of {data.summary.total} services configured
            </div>
          </div>
          <div className={`text-6xl ${data.summary.readiness >= 80 ? "text-green-500" : data.summary.readiness >= 50 ? "text-gold-500" : "text-coral-500"}`}>
            <Server className="h-16 w-16" />
          </div>
        </div>
        <div className="w-full bg-cream-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              data.summary.readiness >= 80 ? "bg-green-500" : data.summary.readiness >= 50 ? "bg-gold-500" : "bg-coral-500"
            }`}
            style={{ width: `${data.summary.readiness}%` }}
          />
        </div>
      </div>

      {/* Database status */}
      <div className="card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className={`h-5 w-5 ${data.database.connected ? "text-green-500" : "text-coral-500"}`} />
          <div>
            <div className="font-semibold text-navy-900">PostgreSQL (Neon)</div>
            <div className="text-xs text-navy-400">
              {data.database.connected
                ? `Connected \u00b7 ${data.database.latency} \u00b7 ${data.database.tableCount} tables`
                : "Disconnected"}
            </div>
          </div>
        </div>
        {data.database.connected
          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
          : <XCircle className="h-5 w-5 text-coral-500" />
        }
      </div>

      {/* Health summary */}
      {health && (
        <div className="card p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className={`h-5 w-5 ${health.status === "ok" ? "text-green-500" : "text-gold-500"}`} />
            <div>
              <div className="font-semibold text-navy-900">System Health</div>
              <div className="text-xs text-navy-400">
                Status: {health.status} \u00b7 Uptime: {health.uptime} \u00b7 v{health.version}
              </div>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            health.status === "ok" ? "bg-green-100 text-green-700" : "bg-gold-100 text-gold-700"
          }`}>
            {health.status.toUpperCase()}
          </span>
        </div>
      )}

      {/* Environment variables by category */}
      {categories.map((cat) => {
        const vars = data.variables.filter((v) => v.category === cat);
        const allSet = vars.every((v) => v.set);
        const Icon = CATEGORY_ICONS[cat] || Shield;
        return (
          <div key={cat} className="card overflow-hidden">
            <div className={`px-5 py-3 border-b border-cream-200 flex items-center justify-between ${allSet ? "bg-green-50" : "bg-cream-50"}`}>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${allSet ? "text-green-600" : "text-navy-400"}`} />
                <span className="font-semibold text-navy-900 text-sm">{cat}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${allSet ? "bg-green-100 text-green-700" : "bg-coral-100 text-coral-700"}`}>
                {vars.filter((v) => v.set).length}/{vars.length}
              </span>
            </div>
            <div className="divide-y divide-cream-200">
              {vars.map((v) => (
                <div key={v.key} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {v.set
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        : <XCircle className="h-4 w-4 text-coral-400 flex-shrink-0" />
                      }
                      <code className="text-sm font-mono text-navy-800 truncate">{v.key}</code>
                    </div>
                    <div className="text-xs text-navy-400 mt-0.5 ml-6">{v.service}</div>
                  </div>
                  {!v.set && v.docs && (
                    <a
                      href={v.docs.startsWith("http") ? v.docs : undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 flex-shrink-0"
                      title={v.docs}
                    >
                      {v.docs.startsWith("http") ? (
                        <><ExternalLink className="h-3 w-3" /> Setup</>
                      ) : (
                        <span className="text-navy-400">{v.docs}</span>
                      )}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Stripe webhook setup instructions */}
      <div className="card p-6 space-y-3">
        <h3 className="font-display text-lg text-navy-900">Stripe Webhook Setup</h3>
        <ol className="text-sm text-navy-600 space-y-2 list-decimal list-inside">
          <li>Go to <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noreferrer" className="text-brand-500 underline">Stripe Webhooks Dashboard</a></li>
          <li>Click "Add endpoint"</li>
          <li>Set URL to: <code className="bg-cream-200 px-2 py-0.5 rounded text-xs">https://your-domain.com/api/webhooks/stripe</code></li>
          <li>Select events: <code className="text-xs">checkout.session.completed</code>, <code className="text-xs">payment_intent.succeeded</code>, <code className="text-xs">payment_intent.payment_failed</code></li>
          <li>Copy the signing secret (starts with <code className="text-xs">whsec_</code>)</li>
          <li>Add to Vercel: <code className="text-xs">STRIPE_WEBHOOK_SECRET=whsec_...</code></li>
        </ol>
      </div>
    </div>
  );
}
