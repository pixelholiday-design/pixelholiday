"use client";

import { useEffect, useState } from "react";
import {
  Lightbulb, ThumbsUp, Check, Clock, X, AlertTriangle,
  Filter, TrendingUp, Bug, Palette, DollarSign, Zap, Shield, Plug, MoreHorizontal,
} from "lucide-react";

type Suggestion = {
  id: string;
  content: string;
  category: string;
  product: string | null;
  page: string | null;
  customerName: string | null;
  userRole: string | null;
  impactScore: number | null;
  feasibility: number | null;
  priorityScore: number | null;
  status: string;
  autoImplemented: boolean;
  responseToUser: string | null;
  aiSummary: string | null;
  upvotes: number;
  createdAt: string;
};

type Stats = {
  total: number;
  new: number;
  aiReviewed: number;
  autoApplied: number;
  inProgress: number;
  completed: number;
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  AI_REVIEWED: "bg-purple-100 text-purple-700",
  AUTO_APPLIED: "bg-green-100 text-green-700",
  APPROVED: "bg-brand-100 text-brand-700",
  IN_PROGRESS: "bg-gold-100 text-gold-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-cream-200 text-navy-500",
  DUPLICATE: "bg-cream-200 text-navy-400",
};

const CATEGORY_ICONS: Record<string, any> = {
  FEATURE: TrendingUp,
  UI_UX: Palette,
  PRICING: DollarSign,
  BUG: Bug,
  CONTENT: MoreHorizontal,
  PERFORMANCE: Zap,
  SECURITY: Shield,
  INTEGRATION: Plug,
  OTHER: Lightbulb,
};

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (categoryFilter !== "ALL") params.set("category", categoryFilter);
    fetch(`/api/suggestions?${params}`)
      .then((r) => r.json())
      .then((d) => { setSuggestions(d.suggestions || []); setStats(d.stats || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  async function updateStatus(id: string, status: string) {
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    await fetch(`/api/suggestions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Suggestions</h1>
          <p className="text-navy-500 text-sm mt-1">AI-evaluated feedback from customers, photographers, and staff</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, icon: Lightbulb, color: "text-brand-500" },
            { label: "New", value: stats.new, icon: AlertTriangle, color: "text-blue-500" },
            { label: "AI Reviewed", value: stats.aiReviewed, icon: Zap, color: "text-purple-500" },
            { label: "Auto Applied", value: stats.autoApplied, icon: Check, color: "text-green-500" },
            { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-gold-500" },
            { label: "Completed", value: stats.completed, icon: ThumbsUp, color: "text-green-600" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card p-4">
                <Icon className={`h-4 w-4 ${s.color} mb-1`} />
                <div className="font-display text-xl text-navy-900">{s.value}</div>
                <div className="text-[10px] text-navy-400 uppercase tracking-wide">{s.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select className="input !w-auto text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="AI_REVIEWED">AI Reviewed</option>
          <option value="AUTO_APPLIED">Auto Applied</option>
          <option value="APPROVED">Approved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="DECLINED">Declined</option>
        </select>
        <select className="input !w-auto text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="ALL">All categories</option>
          <option value="FEATURE">Feature</option>
          <option value="UI_UX">UI/UX</option>
          <option value="PRICING">Pricing</option>
          <option value="BUG">Bug</option>
          <option value="PERFORMANCE">Performance</option>
          <option value="SECURITY">Security</option>
          <option value="INTEGRATION">Integration</option>
        </select>
      </div>

      {/* Suggestions list */}
      {loading ? (
        <div className="text-center py-16 text-navy-400">Loading suggestions...</div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb className="h-12 w-12 mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 font-medium">No suggestions yet</p>
          <p className="text-sm text-navy-400 mt-1">Suggestions from customers and staff will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s) => {
            const CatIcon = CATEGORY_ICONS[s.category] || Lightbulb;
            return (
              <div key={s.id} className="card p-5 hover:shadow-card transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <CatIcon className="h-5 w-5 text-navy-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[s.status] || "bg-cream-200 text-navy-500"}`}>
                        {s.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-navy-400">{s.category.replace("_", "/")}</span>
                      {s.product && <span className="text-xs text-navy-400">&middot; {s.product}</span>}
                      {s.autoImplemented && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Auto-applied</span>
                      )}
                    </div>
                    <p className="text-navy-900 text-sm leading-relaxed">{s.content}</p>
                    {s.aiSummary && s.aiSummary !== s.content.slice(0, 120) && (
                      <p className="text-xs text-navy-500 mt-1 italic">AI: {s.aiSummary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-navy-400">
                      <span>{s.customerName || "Anonymous"} ({s.userRole || "Visitor"})</span>
                      {s.page && <span>on {s.page}</span>}
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      {s.priorityScore && (
                        <span className="font-semibold text-navy-600">Priority: {s.priorityScore}/100</span>
                      )}
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {s.upvotes}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => updateStatus(s.id, "APPROVED")}
                      className="h-8 w-8 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(s.id, "DECLINED")}
                      className="h-8 w-8 rounded-lg bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-navy-400 transition"
                      title="Decline"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
