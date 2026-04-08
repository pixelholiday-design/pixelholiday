"use client";
import { useEffect, useState } from "react";
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Award,
  Loader2,
  RefreshCw,
  Check,
} from "lucide-react";

type Insight = {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  actionTaken: boolean;
  createdAt: string;
};

type Briefing = {
  generatedAt: string;
  yesterday: any;
  baseline: any;
  predictions: any;
  recommendations: { title: string; message: string; priority: string }[];
  alerts: { title: string; message: string }[];
};

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [coaching, setCoaching] = useState<{ heatmap: any[]; alerts: any[] } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [i, b, c] = await Promise.all([
      fetch("/api/admin/ai/insights").then((r) => r.json()),
      fetch("/api/admin/ai/briefing").then((r) => r.json()),
      fetch("/api/ai/coaching-insights").then((r) => r.json()).catch(() => null),
    ]);
    setInsights(i.insights || []);
    setBriefing(b.briefing || null);
    setCoaching(c);
  }

  async function regenerate() {
    setBusy(true);
    await fetch("/api/admin/ai/briefing", { method: "POST" });
    setBusy(false);
    load();
  }

  async function dismiss(id: string) {
    await fetch("/api/admin/ai/insights", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actionTaken: true }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  if (insights === null) {
    return <div className="card p-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>;
  }

  const byPriority = {
    high: insights.filter((i) => i.priority === "high"),
    medium: insights.filter((i) => i.priority === "medium"),
    low: insights.filter((i) => i.priority === "low"),
  };

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">AI command center</div>
          <h1 className="heading text-4xl mt-1">AI insights</h1>
          <p className="text-navy-400 mt-1">Daily briefing, actionable recommendations, performance alerts.</p>
        </div>
        <button onClick={regenerate} disabled={busy} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Regenerate briefing
        </button>
      </header>

      {/* Photographer coaching heatmap */}
      {coaching && coaching.heatmap?.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-coral-500" />
            <h2 className="heading text-xl">Photographer coaching heatmap</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy-400">
                  <th className="py-2 pr-4">Photographer</th>
                  <th className="py-2 px-2">Individual</th>
                  <th className="py-2 px-2">Couple</th>
                  <th className="py-2 px-2">Family</th>
                  <th className="py-2 px-2">Kids</th>
                  <th className="py-2 px-2">Action</th>
                  <th className="py-2 px-2">Portrait</th>
                  <th className="py-2 pl-2">Avg</th>
                </tr>
              </thead>
              <tbody>
                {coaching.heatmap.map((row: any) => {
                  const cell = (v: number) =>
                    v >= 70
                      ? "bg-green-100 text-green-800"
                      : v >= 40
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800";
                  return (
                    <tr key={row.userId} className="border-t border-cream-200">
                      <td className="py-2 pr-4 font-medium">{row.name}</td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.individual)}`}>{row.individual}</span></td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.couple)}`}>{row.couple}</span></td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.family)}`}>{row.family}</span></td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.kids)}`}>{row.kids}</span></td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.action)}`}>{row.action}</span></td>
                      <td className="py-1 px-2"><span className={`inline-block rounded px-2 py-1 ${cell(row.portrait)}`}>{row.portrait}</span></td>
                      <td className="py-1 pl-2 font-semibold">{row.avgOverall}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {coaching.alerts?.length > 0 && (
            <div className="mt-4 space-y-2">
              {coaching.alerts.map((a: any, i: number) => (
                <div key={i} className="text-xs text-amber-800 bg-amber-50 rounded px-3 py-2">
                  ⚠️ {a.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily briefing */}
      {briefing && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-coral-500" />
            <h2 className="heading text-xl">Today's briefing</h2>
            <span className="text-xs text-navy-400 ml-auto">
              Generated {new Date(briefing.generatedAt).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat label="Revenue yesterday" value={`€${briefing.yesterday.revenue.toFixed(0)}`} />
            <Stat label="Galleries / sold" value={`${briefing.yesterday.galleries} / ${briefing.yesterday.sold}`} />
            <Stat label="Conversion" value={`${(briefing.yesterday.conversion * 100).toFixed(0)}%`} />
            <Stat label="Sleeping money" value={`€${briefing.yesterday.sleepingMoney.toFixed(0)}`} />
          </div>
          {briefing.yesterday.bestPhotographer && (
            <div className="rounded-xl bg-gold-500/10 border border-gold-500/30 p-3 text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-gold-600" />
              <span className="text-navy-700">
                Best photographer: <strong>{briefing.yesterday.bestPhotographer.name}</strong>
                {" · "}€{briefing.yesterday.bestPhotographer.revenue.toFixed(0)}
              </span>
            </div>
          )}
          <div className="text-xs text-navy-400 mt-3">
            Predicted today: €{briefing.predictions.revenueLow}–€{briefing.predictions.revenueHigh}
          </div>
        </div>
      )}

      {/* High-priority alerts */}
      {byPriority.high.length > 0 && (
        <Section title="Critical alerts" icon={<AlertTriangle className="h-4 w-4 text-coral-500" />}>
          {byPriority.high.map((i) => (
            <InsightCard key={i.id} insight={i} onDismiss={() => dismiss(i.id)} />
          ))}
        </Section>
      )}

      {/* Recommendations */}
      {byPriority.medium.length > 0 && (
        <Section title="Recommendations" icon={<TrendingUp className="h-4 w-4 text-gold-500" />}>
          {byPriority.medium.map((i) => (
            <InsightCard key={i.id} insight={i} onDismiss={() => dismiss(i.id)} />
          ))}
        </Section>
      )}

      {/* Promotion suggestions */}
      {byPriority.low.length > 0 && (
        <Section title="Promotion candidates" icon={<Award className="h-4 w-4 text-green-500" />}>
          {byPriority.low.map((i) => (
            <InsightCard key={i.id} insight={i} onDismiss={() => dismiss(i.id)} />
          ))}
        </Section>
      )}

      {insights.length === 0 && (
        <div className="card p-16 text-center">
          <Brain className="h-10 w-10 text-coral-500 mx-auto mb-3" />
          <div className="font-display text-xl text-navy-900">No insights yet</div>
          <p className="text-sm text-navy-400 mt-2 max-w-sm mx-auto">
            Click "Regenerate briefing" to run the AI analyzer over your latest data.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream-100 p-4">
      <div className="label-xs">{label}</div>
      <div className="font-display text-2xl text-navy-900">{value}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="heading text-lg flex items-center gap-2">
        {icon} {title}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function InsightCard({ insight, onDismiss }: { insight: Insight; onDismiss: () => void }) {
  const tint =
    insight.priority === "high"
      ? "border-coral-300 bg-coral-50/50"
      : insight.priority === "medium"
      ? "border-gold-300 bg-gold-50/50"
      : "border-green-300 bg-green-50/40";
  return (
    <div className={`rounded-2xl border p-5 ${tint}`}>
      <div className="text-[10px] uppercase tracking-widest text-navy-500 font-semibold mb-1">
        {insight.type} · {insight.targetType}
      </div>
      <h3 className="heading text-lg mb-1">{insight.title}</h3>
      <p className="text-sm text-navy-600 mb-3">{insight.message}</p>
      <div className="flex gap-2">
        <button onClick={onDismiss} className="btn-secondary !py-1.5 !px-3 text-xs">
          <Check className="h-3 w-3" /> Mark done
        </button>
      </div>
    </div>
  );
}
