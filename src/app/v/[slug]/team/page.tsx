"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Network, BarChart3, GraduationCap, Briefcase, Plus, Search, Filter, ChevronRight, Loader2, ArrowLeft, Star, AlertTriangle, TrendingUp, Award, UserPlus, X } from "lucide-react";

/* ── Types ───────────────────────────────────────────────── */

type StaffMember = {
  id: string;
  userId: string;
  designation: string;
  department: string | null;
  level: string;
  employmentType: string;
  performanceScore: number | null;
  isTopPerformer: boolean;
  needsTraining: boolean;
  needsCoaching: boolean;
  onProbation: boolean;
  salaryAmount: number | null;
  salaryCurrency: string;
  reportsToId: string | null;
  user: { id: string; name: string; email: string; phone: string | null; role: string };
  reportsTo: { id: string; userId: string; designation: string; user: { name: string } } | null;
  directReports: { id: string; userId: string; designation: string; user: { name: string } }[];
};

type TrainingRecord = {
  id: string;
  staffName: string;
  course: string;
  category: string;
  status: string;
  score: number | null;
};

type PayrollEntry = {
  id: string;
  name: string;
  designation: string;
  salaryType: string;
  salaryAmount: number;
  salaryCurrency: string;
  commissionRate: number | null;
};

type PerformanceData = {
  total: number;
  topPerformers: number;
  needsAttention: number;
  avgScore: number;
  leaderboard: StaffMember[];
};

type OrgInfo = {
  id: string;
  name: string;
  slug: string;
  brandName: string | null;
  brandPrimaryColor: string | null;
};

/* ── Constants ───────────────────────────────────────────── */

const TABS = [
  { key: "org", label: "Org Chart", icon: Network },
  { key: "list", label: "Team List", icon: Users },
  { key: "perf", label: "Performance", icon: BarChart3 },
  { key: "train", label: "Training", icon: GraduationCap },
  { key: "hr", label: "HR", icon: Briefcase },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const ROLES = ["CEO", "OPERATIONS_MANAGER", "SUPERVISOR", "PHOTOGRAPHER", "SALES_STAFF", "RECEPTIONIST", "ACADEMY_TRAINEE"];
const LEVELS = ["C_LEVEL", "MANAGEMENT", "SENIOR", "STAFF", "JUNIOR", "TRAINEE"];
const LEVEL_ORDER = ["C_LEVEL", "MANAGEMENT", "SENIOR", "STAFF", "JUNIOR", "TRAINEE"];
const CURRENCIES = ["EUR", "USD", "GBP", "TND"];

function scoreColor(score: number | null): string {
  if (score === null) return "bg-gray-200 text-gray-500";
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function scoreBarColor(score: number | null): string {
  if (score === null) return "bg-gray-300";
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-500";
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function fmtCurrency(amount: number | null, currency: string): string {
  if (amount === null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function levelLabel(level: string): string {
  return level.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Org Chart Node ──────────────────────────────────────── */

function OrgNode({ member, allMembers, slug, primaryColor }: { member: StaffMember; allMembers: StaffMember[]; slug: string; primaryColor: string }) {
  const reports = allMembers.filter((m) => m.reportsToId === member.id);

  return (
    <div className="org-node">
      <Link
        href={`/v/${slug}/team/${member.id}`}
        className="org-card bg-white rounded-xl border border-cream-300 px-4 py-3 shadow-sm hover:shadow-md transition inline-block text-center min-w-[160px]"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold mx-auto mb-2"
          style={{ background: primaryColor }}
        >
          {initials(member.user.name)}
        </div>
        <p className="text-sm font-semibold text-navy-900 truncate">{member.user.name}</p>
        <p className="text-xs text-navy-400 truncate">{member.designation}</p>
        {member.performanceScore !== null && (
          <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${scoreColor(member.performanceScore)}`}>
            {member.performanceScore}%
          </span>
        )}
      </Link>
      {reports.length > 0 && (
        <div className="org-children">
          {reports.map((r) => (
            <OrgNode key={r.id} member={r} allMembers={allMembers} slug={slug} primaryColor={primaryColor} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [team, setTeam] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("org");

  // Lazy-loaded tab data
  const [perfData, setPerfData] = useState<PerformanceData | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingRecord[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>([]);
  const [perfLoaded, setPerfLoaded] = useState(false);
  const [trainLoaded, setTrainLoaded] = useState(false);
  const [hrLoaded, setHrLoaded] = useState(false);

  // Team list filters
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterType, setFilterType] = useState("");

  // Add staff modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "PHOTOGRAPHER",
    designation: "", department: "", level: "STAFF", employmentType: "FULL_TIME",
    reportsToId: "", destinationId: "",
    salaryType: "MONTHLY", salaryAmount: "", salaryCurrency: "EUR",
  });

  const primaryColor = org?.brandPrimaryColor || "#0EA5A5";
  const companyName = org?.brandName || org?.name || "Company";

  /* ── Data fetching ─────────────────────────────────────── */

  useEffect(() => { fetchTeam(); }, []);

  useEffect(() => {
    if (tab === "perf" && !perfLoaded) fetchPerformance();
    if (tab === "train" && !trainLoaded) fetchTraining();
    if (tab === "hr" && !hrLoaded) fetchPayroll();
  }, [tab]);

  async function fetchTeam() {
    try {
      const res = await fetch(`/api/v/${slug}/team`);
      if (!res.ok) { router.push(`/v/${slug}/dashboard`); return; }
      const data = await res.json();
      setOrg(data.org);
      setTeam(data.staff || []);
    } catch {
      router.push(`/v/${slug}/dashboard`);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPerformance() {
    try {
      const res = await fetch(`/api/v/${slug}/team/performance`);
      if (res.ok) { setPerfData(await res.json()); }
    } catch { /* silent */ }
    setPerfLoaded(true);
  }

  async function fetchTraining() {
    try {
      const res = await fetch(`/api/v/${slug}/team/training`);
      if (res.ok) { const d = await res.json(); setTrainingData(d.records || []); }
    } catch { /* silent */ }
    setTrainLoaded(true);
  }

  async function fetchPayroll() {
    try {
      const res = await fetch(`/api/v/${slug}/team/payroll`);
      if (res.ok) { const d = await res.json(); setPayrollData(d.entries || []); }
    } catch { /* silent */ }
    setHrLoaded(true);
  }

  /* ── Add Staff submit ──────────────────────────────────── */

  async function handleAddStaff() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v/${slug}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salaryAmount: form.salaryAmount ? parseFloat(form.salaryAmount) : null,
          reportsToId: form.reportsToId || null,
          destinationId: form.destinationId || null,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setStep(1);
        setForm({ name: "", email: "", phone: "", role: "PHOTOGRAPHER", designation: "", department: "", level: "STAFF", employmentType: "FULL_TIME", reportsToId: "", destinationId: "", salaryType: "MONTHLY", salaryAmount: "", salaryCurrency: "EUR" });
        fetchTeam();
      }
    } catch { /* silent */ }
    setSubmitting(false);
  }

  /* ── Derived data ──────────────────────────────────────── */

  const departments = Array.from(new Set(team.map((m) => m.department).filter(Boolean))) as string[];
  const employmentTypes = Array.from(new Set(team.map((m) => m.employmentType)));

  const filteredTeam = team.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.user.name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q) || m.designation.toLowerCase().includes(q);
    const matchDept = !filterDept || m.department === filterDept;
    const matchLevel = !filterLevel || m.level === filterLevel;
    const matchType = !filterType || m.employmentType === filterType;
    return matchSearch && matchDept && matchLevel && matchType;
  });

  const rootMembers = team.filter((m) => m.reportsToId === null);

  /* ── Loading state ─────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-cream-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/v/${slug}/dashboard`} className="text-navy-400 hover:text-navy-700 transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-navy-900">{companyName}</h1>
              <p className="text-sm text-navy-400">Team &amp; Org Chart</p>
            </div>
          </div>
          <button
            onClick={() => { setShowModal(true); setStep(1); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
            style={{ background: primaryColor }}
          >
            <Plus className="h-4 w-4" /> Add Staff
          </button>
        </div>
      </header>

      {/* ── Tab Bar ────────────────────────────────────────── */}
      <div className="bg-white border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  active ? "text-navy-900" : "text-navy-400 border-transparent hover:text-navy-600"
                }`}
                style={active ? { borderColor: primaryColor, color: primaryColor } : undefined}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {tab === "org" && (
          <section>
            <style jsx>{`
              .org-tree {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .org-node {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
              }
              .org-children {
                display: flex;
                justify-content: center;
                gap: 24px;
                padding-top: 24px;
                position: relative;
              }
              .org-children::before {
                content: '';
                position: absolute;
                top: 0;
                left: 50%;
                width: 0;
                height: 24px;
                border-left: 2px solid #d1d5db;
              }
              .org-children > .org-node::before {
                content: '';
                position: absolute;
                top: -24px;
                left: 50%;
                width: 0;
                height: 24px;
                border-left: 2px solid #d1d5db;
              }
              .org-children > .org-node:not(:first-child):not(:last-child)::after {
                content: '';
                position: absolute;
                top: -24px;
                left: -12px;
                right: -12px;
                height: 0;
                border-top: 2px solid #d1d5db;
              }
              .org-children > .org-node:first-child:not(:only-child)::after {
                content: '';
                position: absolute;
                top: -24px;
                left: 50%;
                right: -12px;
                height: 0;
                border-top: 2px solid #d1d5db;
              }
              .org-children > .org-node:last-child:not(:only-child)::after {
                content: '';
                position: absolute;
                top: -24px;
                left: -12px;
                right: 50%;
                height: 0;
                border-top: 2px solid #d1d5db;
              }
            `}</style>
            {rootMembers.length === 0 ? (
              <div className="text-center py-16 text-navy-400">
                <Network className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">No org chart data</p>
                <p className="text-sm mt-1">Add team members to build your org chart.</p>
              </div>
            ) : (
              <div className="org-tree overflow-x-auto pb-8">
                {rootMembers.map((m) => (
                  <OrgNode key={m.id} member={m} allMembers={team} slug={slug} primaryColor={primaryColor} />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "list" && (
          <section>
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ ["--tw-ring-color" as string]: primaryColor }}
                />
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-900">
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="px-3 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-900">
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
              </select>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2.5 rounded-xl border border-cream-300 bg-white text-sm text-navy-900">
                <option value="">All Types</option>
                {employmentTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            {/* Mobile: cards */}
            <div className="sm:hidden space-y-3">
              {filteredTeam.map((m) => (
                <button
                  key={m.id}
                  onClick={() => router.push(`/v/${slug}/team/${m.id}`)}
                  className="w-full bg-white rounded-xl border border-cream-300 p-4 text-left hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: primaryColor }}>
                      {initials(m.user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{m.user.name}</p>
                      <p className="text-xs text-navy-400 truncate">{m.designation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scoreColor(m.performanceScore)}`}>
                        {m.performanceScore !== null ? `${m.performanceScore}%` : "-"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-navy-300" />
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className="text-xs bg-cream-200 text-navy-600 px-2 py-0.5 rounded-full">{levelLabel(m.level)}</span>
                    {m.department && <span className="text-xs bg-cream-200 text-navy-600 px-2 py-0.5 rounded-full">{m.department}</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block bg-white rounded-xl border border-cream-300 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-cream-50 border-b border-cream-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Level</th>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-navy-600">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeam.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => router.push(`/v/${slug}/team/${m.id}`)}
                      className="border-b border-cream-200 hover:bg-cream-50 cursor-pointer transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: primaryColor }}>
                            {initials(m.user.name)}
                          </div>
                          <span className="font-medium text-navy-900">{m.user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-navy-700">{m.designation}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-cream-200 text-navy-600 px-2 py-0.5 rounded-full">{levelLabel(m.level)}</span>
                      </td>
                      <td className="px-4 py-3 text-navy-600">{m.department || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scoreColor(m.performanceScore)}`}>
                          {m.performanceScore !== null ? `${m.performanceScore}%` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-navy-400">{m.user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeam.length === 0 && (
                <div className="text-center py-12 text-navy-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No team members found.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "perf" && (
          <section>
            {!perfLoaded ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy-400" /></div>
            ) : perfData ? (
              <>
                {/* Stats bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Staff", value: perfData.total, icon: Users },
                    { label: "Top Performers", value: perfData.topPerformers, icon: Award },
                    { label: "Needs Attention", value: perfData.needsAttention, icon: AlertTriangle },
                    { label: "Avg Score", value: `${Math.round(perfData.avgScore)}%`, icon: TrendingUp },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-cream-300 p-4">
                      <div className="flex items-center gap-2 text-navy-400 mb-1">
                        <s.icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{s.label}</span>
                      </div>
                      <p className="text-2xl font-display text-navy-900">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-xl border border-cream-300 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cream-300">
                    <h3 className="font-display text-lg text-navy-900">Performance Leaderboard</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-cream-50 border-b border-cream-300">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-navy-600 w-16">#</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">Designation</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600 w-48">Score</th>
                        <th className="text-left px-4 py-3 font-medium text-navy-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfData.leaderboard.map((m, i) => (
                        <tr key={m.id} className="border-b border-cream-200 hover:bg-cream-50">
                          <td className="px-4 py-3 font-bold text-navy-400">{i + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
                                {initials(m.user.name)}
                              </div>
                              <span className="font-medium text-navy-900">{m.user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-navy-600">{m.designation}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div className={`h-full rounded-full ${scoreBarColor(m.performanceScore)}`} style={{ width: `${m.performanceScore ?? 0}%` }} />
                              </div>
                              <span className="text-xs font-medium text-navy-700 w-10 text-right">{m.performanceScore ?? 0}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {m.isTopPerformer && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Top Performer</span>}
                              {m.needsTraining && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Needs Training</span>}
                              {m.onProbation && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">On Probation</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-navy-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>No performance data available.</p>
              </div>
            )}
          </section>
        )}

        {tab === "train" && (
          <section>
            {!trainLoaded ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy-400" /></div>
            ) : (
              <>
                {/* Needs Training Section */}
                {team.filter((m) => m.needsTraining).length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-display text-lg text-navy-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      Needs Training
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {team.filter((m) => m.needsTraining).map((m) => (
                        <div key={m.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
                              {initials(m.user.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-navy-900">{m.user.name}</p>
                              <p className="text-xs text-navy-400">{m.designation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Training Records */}
                <div className="bg-white rounded-xl border border-cream-300 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cream-300">
                    <h3 className="font-display text-lg text-navy-900">Training Records</h3>
                  </div>
                  {trainingData.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-cream-50 border-b border-cream-300">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Staff</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Course</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Category</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trainingData.map((r) => (
                          <tr key={r.id} className="border-b border-cream-200">
                            <td className="px-4 py-3 font-medium text-navy-900">{r.staffName}</td>
                            <td className="px-4 py-3 text-navy-700">{r.course}</td>
                            <td className="px-4 py-3 text-navy-600">{r.category}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                r.status === "ASSIGNED" ? "bg-blue-100 text-blue-700" :
                                r.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" :
                                r.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                                r.status === "EXPIRED" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>
                                {r.status.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-navy-600">{r.score !== null ? `${r.score}%` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-navy-400">
                      <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>No training records yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {tab === "hr" && (
          <section>
            {!hrLoaded ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-navy-400" /></div>
            ) : (
              <>
                {/* Payroll summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-white rounded-xl border border-cream-300 p-4">
                    <p className="text-xs font-medium text-navy-400 mb-1">Total Monthly Cost</p>
                    <p className="text-2xl font-display text-navy-900">
                      {fmtCurrency(payrollData.reduce((sum, e) => sum + (e.salaryAmount || 0), 0), payrollData[0]?.salaryCurrency || "EUR")}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border border-cream-300 p-4">
                    <p className="text-xs font-medium text-navy-400 mb-1">Staff Count</p>
                    <p className="text-2xl font-display text-navy-900">{payrollData.length}</p>
                  </div>
                </div>

                {/* Payroll table */}
                <div className="bg-white rounded-xl border border-cream-300 overflow-hidden">
                  <div className="px-4 py-3 border-b border-cream-300">
                    <h3 className="font-display text-lg text-navy-900">Payroll</h3>
                  </div>
                  {payrollData.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead className="bg-cream-50 border-b border-cream-300">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Designation</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Type</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Salary</th>
                          <th className="text-left px-4 py-3 font-medium text-navy-600">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrollData.map((e) => (
                          <tr key={e.id} className="border-b border-cream-200">
                            <td className="px-4 py-3 font-medium text-navy-900">{e.name}</td>
                            <td className="px-4 py-3 text-navy-700">{e.designation}</td>
                            <td className="px-4 py-3 text-navy-600">{e.salaryType.replace(/_/g, " ")}</td>
                            <td className="px-4 py-3 text-navy-900 font-medium">{fmtCurrency(e.salaryAmount, e.salaryCurrency)}</td>
                            <td className="px-4 py-3 text-navy-600">{e.commissionRate !== null ? `${(e.commissionRate * 100).toFixed(0)}%` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-navy-400">
                      <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>No payroll data yet.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* ── Add Staff Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300">
              <h2 className="font-display text-lg text-navy-900">
                Add Staff Member — Step {step} of 3
              </h2>
              <button onClick={() => setShowModal(false)} className="text-navy-400 hover:text-navy-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
                    <input
                      type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: primaryColor }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Email</label>
                    <input
                      type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Phone</label>
                    <input
                      type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="+216 ..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Role</label>
                    <select
                      value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Designation</label>
                    <input
                      type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="Lead Photographer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Department</label>
                    <input
                      type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="Photography"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                    <select
                      value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      {LEVELS.map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Employment Type</label>
                    <select
                      value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="SEASONAL">Seasonal</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Reports To</label>
                    <select
                      value={form.reportsToId} onChange={(e) => setForm({ ...form, reportsToId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      <option value="">None (Top Level)</option>
                      {team.map((m) => <option key={m.id} value={m.id}>{m.user.name} — {m.designation}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Destination</label>
                    <input
                      type="text" value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="Destination ID (optional)"
                    />
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Salary Type</label>
                    <select
                      value={form.salaryType} onChange={(e) => setForm({ ...form, salaryType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="HOURLY">Hourly</option>
                      <option value="COMMISSION_ONLY">Commission Only</option>
                      <option value="DAILY">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Salary Amount</label>
                    <input
                      type="number" value={form.salaryAmount} onChange={(e) => setForm({ ...form, salaryAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Currency</label>
                    <select
                      value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none"
                    >
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-cream-300">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-4 py-2 text-sm text-navy-600 hover:text-navy-900 transition">
                  Back
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90"
                  style={{ background: primaryColor }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleAddStaff}
                  disabled={submitting || !form.name || !form.email}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: primaryColor }}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Staff"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
