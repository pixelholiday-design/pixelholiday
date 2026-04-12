"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Brain,
  TrendingUp,
  Building2,
  Camera,
  Users,
  Target,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  FileText,
  Handshake,
  Eye,
  Lightbulb,
  ShieldAlert,
  DollarSign,
  ArrowRight,
  Sparkles,
  BarChart3,
  HeartHandshake,
  Headphones,
  Wallet,
  Building,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════ */

type Metrics = {
  revenueThisMonth: number;
  activeSubscribers: number;
  tierBreakdown: Record<string, number>;
  activeVenues: number;
  marketplacePhotographers: number;
  revenueGoal: number;
};

type Briefing = { source: string; text: string };

type GenerateResult = { source: string; content: string };

type CompetitorResult = { source: string; competitor: string; text: string };

type CustomerInsights = {
  topRequests: { content: string; category: string; upvotes: number; status: string }[];
  openSupport: { id: string; status: string; lastMessage: string; channel: string }[];
  churnRisk: { id: string; name: string; tier: string; signupDate: string }[];
};

/* ═══════════════════════════════════════════════════
   HELPER: currency formatter
   ═══════════════════════════════════════════════════ */
const eur = (n: number) =>
  new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/* ═══════════════════════════════════════════════════
   SECTION 1 -- LIVE METRICS BAR
   ═══════════════════════════════════════════════════ */

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-brand-400">
        <Icon size={18} />
        <span className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
    </div>
  );
}

function LiveMetricsBar({ metrics }: { metrics: Metrics | null }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-navy-900/40" />
        ))}
      </div>
    );
  }

  const pct = Math.min((metrics.revenueThisMonth / metrics.revenueGoal) * 100, 100);
  const tierStr = Object.entries(metrics.tierBreakdown)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      <MetricCard icon={DollarSign} label="Revenue This Month" value={eur(metrics.revenueThisMonth)} />
      <MetricCard
        icon={Users}
        label="SaaS Subscribers"
        value={String(metrics.activeSubscribers)}
        sub={tierStr || "No tier data"}
      />
      <MetricCard icon={Building2} label="Active Venues" value={String(metrics.activeVenues)} />
      <MetricCard icon={Camera} label="Photographers" value={String(metrics.marketplacePhotographers)} />
      <div className="rounded-xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur">
        <div className="mb-2 flex items-center gap-2 text-brand-400">
          <Target size={18} />
          <span className="text-xs font-medium uppercase tracking-wide text-white/60">Revenue Goal</span>
        </div>
        <p className="text-lg font-bold text-white">{eur(metrics.revenueThisMonth)} / {eur(metrics.revenueGoal)}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-white/50">{pct.toFixed(2)}% of target</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 2 -- AI DAILY BRIEFING
   ═══════════════════════════════════════════════════ */

function DailyBriefing({
  briefing,
  loading,
  onRefresh,
}: {
  briefing: Briefing | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-brand-400" size={20} />
          <h2 className="text-lg font-semibold text-white">AI Daily Briefing</h2>
          {briefing && (
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/40">
              {briefing.source}
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs font-medium text-brand-300 transition hover:bg-brand-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh Insights
        </button>
      </div>
      {!briefing ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="animate-spin text-white/30" size={24} />
        </div>
      ) : (
        <div className="space-y-2">
          {briefing.text.split("\n").filter(Boolean).map((line, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/80">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-400" />
              <span>{line.replace(/^[-*]\s*/, "")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 3 -- AI MARKETING ASSISTANT
   ═══════════════════════════════════════════════════ */

const MARKETING_TABS = [
  { key: "email", label: "Write Email", icon: Mail },
  { key: "social", label: "Social Post", icon: MessageSquare },
  { key: "blog", label: "Blog Post", icon: FileText },
  { key: "partnership", label: "Partnership Outreach", icon: Handshake },
] as const;

const AUDIENCES = [
  "Hotel Partners",
  "Water Park Operators",
  "Wedding Photographers",
  "Resort Guests",
  "Franchise Leads",
  "Enterprise Clients",
  "General",
];

function MarketingAssistant() {
  const [tab, setTab] = useState<string>("email");
  const [audience, setAudience] = useState("General");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ai-command?action=generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab, audience, prompt }),
      });
      setResult(await res.json());
    } catch {
      setResult({ source: "error", content: "Failed to generate content." });
    }
    setLoading(false);
  }

  function copyToClipboard() {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="text-brand-400" size={20} />
        <h2 className="text-lg font-semibold text-white">AI Marketing Assistant</h2>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-white/5 p-1">
        {MARKETING_TABS.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition ${
              tab === key ? "bg-brand-500 text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            <TabIcon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-white/50">Target Audience</label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Topic / Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Summer waterpark photo packages promotion..."
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-navy-900 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading || !prompt.trim()}
        className="mb-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        Generate with AI
      </button>

      {/* Result */}
      {result && (
        <div className="relative rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/40">
              {result.source}
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-white/80">{result.content}</pre>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 4 -- AI COMPETITOR MONITOR
   ═══════════════════════════════════════════════════ */

const COMPETITORS = ["Pixieset", "Zno", "ShootProof", "Pic-Time"];

function CompetitorMonitor() {
  const [result, setResult] = useState<CompetitorResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function fetchCompetitor(name: string) {
    setLoading(name);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/ai-command?action=competitor&competitor=${encodeURIComponent(name)}`);
      setResult(await res.json());
    } catch {
      setResult({ source: "error", competitor: name, text: "Failed to fetch insights." });
    }
    setLoading(null);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="text-brand-400" size={20} />
        <h2 className="text-lg font-semibold text-white">AI Competitor Monitor</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {COMPETITORS.map((c) => (
          <button
            key={c}
            onClick={() => fetchCompetitor(c)}
            disabled={loading !== null}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-brand-500/50 hover:bg-brand-500/10 disabled:opacity-50"
          >
            {loading === c ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
            What&apos;s new at {c}?
          </button>
        ))}
        <button
          onClick={() => fetchCompetitor("all")}
          disabled={loading !== null}
          className="flex items-center gap-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm text-brand-300 transition hover:bg-brand-500/20 disabled:opacity-50"
        >
          {loading === "all" ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
          Suggest Features
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-2">
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] uppercase text-white/40">
              {result.source} {result.competitor !== "all" && `-- ${result.competitor}`}
            </span>
          </div>
          {result.source === "unavailable" ? (
            <p className="text-sm text-amber-300/80">{result.text}</p>
          ) : (
            <div className="space-y-1">
              {result.text.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm text-white/80">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 5 -- AI CUSTOMER INSIGHTS
   ═══════════════════════════════════════════════════ */

function CustomerInsightsSection({ data }: { data: CustomerInsights | null }) {
  const [expanded, setExpanded] = useState<string | null>("requests");

  if (!data) {
    return (
      <div className="h-48 animate-pulse rounded-xl bg-navy-900/40" />
    );
  }

  const sections = [
    {
      key: "requests",
      title: "Most Requested Features",
      icon: Lightbulb,
      count: data.topRequests.length,
      content: (
        <div className="space-y-2">
          {data.topRequests.length === 0 && (
            <p className="text-sm text-white/40">No suggestions yet.</p>
          )}
          {data.topRequests.map((r, i) => (
            <div key={i} className="flex items-start justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
              <div>
                <p className="text-sm text-white/80">{r.content.slice(0, 120)}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  {r.category} -- {r.status}
                </p>
              </div>
              <span className="shrink-0 rounded bg-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-300">
                {r.upvotes} votes
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "support",
      title: "Open Support Questions",
      icon: Headphones,
      count: data.openSupport.length,
      content: (
        <div className="space-y-2">
          {data.openSupport.length === 0 && (
            <p className="text-sm text-white/40">No open support chats.</p>
          )}
          {data.openSupport.map((s) => (
            <div key={s.id} className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-sm text-white/80">{s.lastMessage}</p>
              <p className="mt-0.5 text-xs text-white/40">
                {s.channel} -- {s.status}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "churn",
      title: "Churn Risk (Inactive 30+ Days)",
      icon: ShieldAlert,
      count: data.churnRisk.length,
      content: (
        <div className="space-y-2">
          {data.churnRisk.length === 0 && (
            <p className="text-sm text-white/40">No churn risks detected.</p>
          )}
          {data.churnRisk.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div>
                <p className="text-sm text-white/80">{c.name}</p>
                <p className="mt-0.5 text-xs text-white/40">
                  {c.tier} -- Signed up {new Date(c.signupDate).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">At Risk</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="text-brand-400" size={20} />
        <h2 className="text-lg font-semibold text-white">AI Customer Insights</h2>
      </div>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.key} className="rounded-lg border border-white/5">
            <button
              onClick={() => setExpanded(expanded === s.key ? null : s.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-2">
                <s.icon size={16} className="text-brand-400" />
                <span className="text-sm font-medium text-white">{s.title}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/50">
                  {s.count}
                </span>
              </div>
              {expanded === s.key ? (
                <ChevronUp size={16} className="text-white/40" />
              ) : (
                <ChevronDown size={16} className="text-white/40" />
              )}
            </button>
            {expanded === s.key && <div className="px-4 pb-4">{s.content}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 6 -- AI FINANCIAL PROJECTIONS
   ═══════════════════════════════════════════════════ */

function FinancialProjections({ metrics }: { metrics: Metrics | null }) {
  const subs = metrics?.activeSubscribers ?? 0;
  const goal = 10_000_000;
  const yearsLeft = 3; // target 2029
  const annualTarget = goal / yearsLeft;
  const monthlyTarget = annualTarget / 12;

  const unitEconomics = [
    { product: "Full Gallery (Online)", price: 89, cost: 2, margin: 87 },
    { product: "Digital Pass (Pre-Arrival)", price: 150, cost: 0, margin: 150 },
    { product: "Auto-Reel Video", price: 30, cost: 0, margin: 30 },
    { product: "Magic Shot AR", price: 20, cost: 0, margin: 20 },
    { product: "Printed Album", price: 150, cost: 35, margin: 115 },
    { product: "SaaS Subscription (avg)", price: 49, cost: 5, margin: 44 },
  ];

  const subsNeeded = Math.ceil(monthlyTarget / 49);

  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Wallet className="text-brand-400" size={20} />
        <h2 className="text-lg font-semibold text-white">AI Financial Projections</h2>
      </div>

      <div className="mb-6 rounded-lg bg-brand-500/10 p-4">
        <p className="mb-2 text-sm font-medium text-brand-300">
          To reach {eur(goal)} by 2029, you need:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <p className="text-xl font-bold text-white">{eur(annualTarget)}</p>
            <p className="text-xs text-white/50">Annual Revenue</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <p className="text-xl font-bold text-white">{eur(monthlyTarget)}</p>
            <p className="text-xs text-white/50">Monthly Revenue</p>
          </div>
          <div className="rounded-lg bg-black/20 p-3 text-center">
            <p className="text-xl font-bold text-white">{subsNeeded.toLocaleString()}</p>
            <p className="text-xs text-white/50">SaaS Subscribers Needed</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/40">
          Currently at {subs} subscribers ({((subs / subsNeeded) * 100).toFixed(1)}% of target).
        </p>
      </div>

      <h3 className="mb-3 text-sm font-medium text-white/70">Unit Economics Per Product</h3>
      <div className="overflow-hidden rounded-lg border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-3 py-2 text-left text-xs font-medium text-white/50">Product</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-white/50">Price</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-white/50">Cost</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-white/50">Margin</th>
            </tr>
          </thead>
          <tbody>
            {unitEconomics.map((row) => (
              <tr key={row.product} className="border-b border-white/5">
                <td className="px-3 py-2 text-white/80">{row.product}</td>
                <td className="px-3 py-2 text-right text-white/80">{eur(row.price)}</td>
                <td className="px-3 py-2 text-right text-white/50">{eur(row.cost)}</td>
                <td className="px-3 py-2 text-right font-medium text-green-400">{eur(row.margin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION 7 -- QUICK ACTIONS
   ═══════════════════════════════════════════════════ */

const QUICK_ACTIONS = [
  { href: "/admin/venue-applications", label: "Venue Applications", icon: Building2 },
  { href: "/admin/marketing", label: "Marketing", icon: TrendingUp },
  { href: "/admin/support", label: "Support Center", icon: Headphones },
  { href: "/admin/finance", label: "Finance", icon: Wallet },
  { href: "/admin/companies-manage", label: "Companies", icon: Building },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/admin/dashboard", label: "CEO Dashboard", icon: BarChart3 },
];

function QuickActions() {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <HeartHandshake className="text-brand-400" size={20} />
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-white"
          >
            <a.icon size={16} className="shrink-0 text-brand-400" />
            <span className="truncate">{a.label}</span>
            <ArrowRight size={14} className="ml-auto shrink-0 text-white/30" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */

export default function AICommandCenterPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const loadMetrics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-command?action=metrics");
      setMetrics(await res.json());
    } catch {
      /* fail silently */
    }
  }, []);

  const loadBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch("/api/admin/ai-command?action=briefing");
      setBriefing(await res.json());
    } catch {
      /* fail silently */
    }
    setBriefingLoading(false);
  }, []);

  const loadInsights = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-command?action=insights");
      setInsights(await res.json());
    } catch {
      /* fail silently */
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    loadBriefing();
    loadInsights();
  }, [loadMetrics, loadBriefing, loadInsights]);

  return (
    <div className="min-h-screen space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Brain className="text-brand-400" size={28} />
            AI Command Center
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Real-time intelligence, content generation, and strategic insights
          </p>
        </div>
        <button
          onClick={() => {
            loadMetrics();
            loadBriefing();
            loadInsights();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:text-white"
        >
          <RefreshCw size={14} />
          Refresh All
        </button>
      </div>

      {/* Section 1: Live Metrics */}
      <LiveMetricsBar metrics={metrics} />

      {/* Section 2: Daily Briefing */}
      <DailyBriefing briefing={briefing} loading={briefingLoading} onRefresh={loadBriefing} />

      {/* Two-column layout for sections 3+4 */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Section 3: Marketing Assistant */}
        <MarketingAssistant />

        {/* Section 4: Competitor Monitor */}
        <CompetitorMonitor />
      </div>

      {/* Two-column layout for sections 5+6 */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Section 5: Customer Insights */}
        <CustomerInsightsSection data={insights} />

        {/* Section 6: Financial Projections */}
        <FinancialProjections metrics={metrics} />
      </div>

      {/* Section 7: Quick Actions */}
      <QuickActions />
    </div>
  );
}
