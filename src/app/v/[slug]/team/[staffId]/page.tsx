"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, BarChart3, GraduationCap, DollarSign, FileText, Settings, Loader2, Star, AlertTriangle, TrendingUp, Calendar, Mail, Phone, MapPin, Award, Shield, Edit3, Save, X } from "lucide-react";

/* ── Types ──────────────────────────────────────────── */

type StaffProfile = {
  id: string;
  userId: string;
  designation: string;
  department: string | null;
  level: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  performanceScore: number | null;
  isTopPerformer: boolean;
  needsTraining: boolean;
  needsCoaching: boolean;
  onProbation: boolean;
  salaryType: string;
  salaryAmount: number | null;
  salaryCurrency: string;
  commissionRate: number | null;
  phone: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  address: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  managerNotes: string | null;
  hrNotes: string | null;
  photoUrl: string | null;
  user: { id: string; name: string; email: string; phone: string | null; role: string; createdAt: string };
  reportsTo: { id: string; designation: string; user: { name: string } } | null;
  directReports: { id: string; designation: string; performanceScore: number | null; user: { name: string } }[];
  performanceReviews: any[];
  trainingRecords: any[];
  staffCommissions: any[];
  staffBonuses: any[];
  staffPayouts: any[];
};

const TABS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "training", label: "Training", icon: GraduationCap },
  { key: "compensation", label: "Compensation", icon: DollarSign },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ── Helpers ────────────────────────────────────────── */

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-600";

const scoreBg = (s: number) =>
  s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-red-500";

/* ── Main Page ──────────────────────────────────────── */

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const staffId = params.staffId as string;

  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [primaryColor, setPrimaryColor] = useState("#0EA5A5");

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, staffRes] = await Promise.all([
          fetch(`/api/v/${slug}/dashboard`),
          fetch(`/api/v/${slug}/team/${staffId}`),
        ]);
        if (dashRes.ok) {
          const d = await dashRes.json();
          setPrimaryColor(d.org?.brandPrimaryColor || "#0EA5A5");
        }
        if (!staffRes.ok) { router.push(`/v/${slug}/team`); return; }
        const s = await staffRes.json();
        setStaff(s.profile || s.staffProfile || s);
      } catch {
        router.push(`/v/${slug}/team`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, staffId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    );
  }
  if (!staff) return null;

  const perfScore = staff.performanceScore ?? 0;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Back */}
      <div className="max-w-5xl mx-auto px-6 pt-5">
        <Link href={`/v/${slug}/team`} className="inline-flex items-center gap-1.5 text-xs text-navy-400 hover:text-navy-700 transition">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Team
        </Link>
      </div>

      {/* Header card */}
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            {staff.photoUrl ? (
              <img src={staff.photoUrl} alt={staff.user.name} className="w-20 h-20 rounded-full object-cover border-4 border-cream-200 flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-cream-200 flex-shrink-0" style={{ background: primaryColor }}>
                {staff.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl text-navy-900">{staff.user.name}</h1>
              <p className="text-sm text-navy-500 mt-0.5">{staff.designation}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: primaryColor + "18", color: primaryColor }}>
                  {staff.level}
                </span>
                {staff.department && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 text-navy-600 font-medium">{staff.department}</span>
                )}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 text-navy-600 font-medium">{staff.employmentType.replace(/_/g, " ")}</span>
                <span className="text-xs text-navy-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Started {fmtDate(staff.startDate)}
                </span>
              </div>
            </div>
            {/* Performance circle */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e0d8" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={perfScore >= 80 ? "#10b981" : perfScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="3"
                    strokeDasharray={`${perfScore * 0.974} 97.4`} strokeLinecap="round" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-display text-sm ${scoreColor(perfScore)}`}>
                  {perfScore}
                </span>
              </div>
              <span className="text-xs text-navy-400 mt-1">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="max-w-5xl mx-auto px-6 mt-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.key;
            return (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${active ? "text-white shadow-sm" : "text-navy-500 hover:bg-white hover:text-navy-700"}`}
                style={active ? { background: primaryColor } : {}}>
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === "overview" && <OverviewTab staff={staff} slug={slug} primaryColor={primaryColor} />}
        {activeTab === "performance" && <PerformanceTab staff={staff} primaryColor={primaryColor} />}
        {activeTab === "training" && <TrainingTab staff={staff} primaryColor={primaryColor} />}
        {activeTab === "compensation" && <CompensationTab staff={staff} primaryColor={primaryColor} />}
        {activeTab === "documents" && <DocumentsTab staff={staff} primaryColor={primaryColor} />}
        {activeTab === "settings" && <SettingsTab staff={staff} slug={slug} staffId={staffId} primaryColor={primaryColor} />}
      </main>
    </div>
  );
}

/* ── Tab 1: Overview ────────────────────────────────── */

function OverviewTab({ staff, slug, primaryColor }: { staff: StaffProfile; slug: string; primaryColor: string }) {
  const perfScore = staff.performanceScore ?? 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        {/* Contact info */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-navy-400" />
              <div>
                <div className="text-xs text-navy-400">Email</div>
                <div className="text-sm text-navy-900">{staff.user.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-navy-400" />
              <div>
                <div className="text-xs text-navy-400">Phone</div>
                <div className="text-sm text-navy-900">{staff.phone || staff.user.phone || "-"}</div>
              </div>
            </div>
            {staff.emergencyContact && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs text-navy-400">Emergency Contact</div>
                  <div className="text-sm text-navy-900">{staff.emergencyContact} {staff.emergencyPhone ? `(${staff.emergencyPhone})` : ""}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personal info */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-4">Personal Information</h3>
          <div className="space-y-3">
            {staff.nationality && (
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-navy-400" />
                <div>
                  <div className="text-xs text-navy-400">Nationality</div>
                  <div className="text-sm text-navy-900">{staff.nationality}</div>
                </div>
              </div>
            )}
            {staff.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-navy-400" />
                <div>
                  <div className="text-xs text-navy-400">Date of Birth</div>
                  <div className="text-sm text-navy-900">{fmtDate(staff.dateOfBirth)}</div>
                </div>
              </div>
            )}
            {staff.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-navy-400" />
                <div>
                  <div className="text-xs text-navy-400">Address</div>
                  <div className="text-sm text-navy-900">{staff.address}</div>
                </div>
              </div>
            )}
            {!staff.nationality && !staff.dateOfBirth && !staff.address && (
              <p className="text-sm text-navy-400">No personal details recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-6">
        {/* Reports to */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Reports To</h3>
          {staff.reportsTo ? (
            <Link href={`/v/${slug}/team/${staff.reportsTo.id}`} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-cream-50 transition">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: primaryColor }}>
                {staff.reportsTo.user.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-navy-900">{staff.reportsTo.user.name}</div>
                <div className="text-xs text-navy-400">{staff.reportsTo.designation}</div>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-navy-400">No manager assigned</p>
          )}
        </div>

        {/* Direct reports */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Direct Reports ({staff.directReports.length})</h3>
          {staff.directReports.length > 0 ? (
            <div className="space-y-2">
              {staff.directReports.map((dr) => (
                <Link key={dr.id} href={`/v/${slug}/team/${dr.id}`} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-cream-50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: primaryColor }}>
                      {dr.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-navy-900">{dr.user.name}</div>
                      <div className="text-xs text-navy-400">{dr.designation}</div>
                    </div>
                  </div>
                  {dr.performanceScore != null && (
                    <span className={`text-xs font-medium ${scoreColor(dr.performanceScore)}`}>{dr.performanceScore}</span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">No direct reports</p>
          )}
        </div>

        {/* Performance gauge */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Performance</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e0d8" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.5" fill="none"
                  stroke={perfScore >= 80 ? "#10b981" : perfScore >= 60 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2.5" strokeDasharray={`${perfScore * 0.974} 97.4`} strokeLinecap="round" />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-display text-lg ${scoreColor(perfScore)}`}>
                {perfScore}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-navy-900">
                {perfScore >= 80 ? "Excellent" : perfScore >= 60 ? "Good" : "Needs Improvement"}
              </div>
              <div className="text-xs text-navy-400">out of 100</div>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Status</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${staff.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
              {staff.isActive ? "Active" : "Inactive"}
            </span>
            {staff.isTopPerformer && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-700">Top Performer</span>}
            {staff.needsTraining && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">Needs Training</span>}
            {staff.needsCoaching && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-100 text-orange-700">Needs Coaching</span>}
            {staff.onProbation && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-100 text-red-700">On Probation</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab 2: Performance ─────────────────────────────── */

function PerformanceTab({ staff, primaryColor }: { staff: StaffProfile; primaryColor: string }) {
  const reviews = staff.performanceReviews || [];
  const chartData = [...reviews].reverse().slice(-8);
  const maxScore = 10;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { key: "photoQuality", label: "Photo Quality" },
    { key: "salesPerformance", label: "Sales" },
    { key: "customerService", label: "Customer Service" },
    { key: "punctuality", label: "Punctuality" },
    { key: "teamwork", label: "Teamwork" },
    { key: "initiative", label: "Initiative" },
    { key: "appearance", label: "Appearance" },
    { key: "technicalSkills", label: "Technical Skills" },
  ];

  return (
    <div className="space-y-6">
      {/* Score chart */}
      <div className="card p-5">
        <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-4">Score History</h3>
        {chartData.length > 0 ? (
          <div className="flex items-end gap-3 h-44">
            {chartData.map((r: any) => {
              const pct = ((r.overallScore || 0) / maxScore) * 100;
              const sc = (r.overallScore || 0) * 10;
              return (
                <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                  <span className={`text-xs font-medium ${scoreColor(sc)}`}>{(r.overallScore || 0).toFixed(1)}</span>
                  <div className="w-full bg-cream-200 rounded-t-lg relative" style={{ height: "130px" }}>
                    <div className={`absolute bottom-0 w-full rounded-t-lg transition-all ${scoreBg(sc)}`} style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-navy-400 truncate max-w-full">{r.period}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No performance data yet</p>
        )}
      </div>

      {/* Reviews list */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-cream-200">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Performance Reviews</h3>
        </div>
        {reviews.length > 0 ? (
          <div className="divide-y divide-cream-100">
            {reviews.map((r: any) => {
              const expanded = expandedId === r.id;
              const sc = (r.overallScore || 0) * 10;
              return (
                <div key={r.id}>
                  <button onClick={() => setExpandedId(expanded ? null : r.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition text-left">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-navy-900">{r.period}</span>
                      <span className={`font-display text-sm ${scoreColor(sc)}`}>{(r.overallScore || 0).toFixed(1)}/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.recommendation === "PROMOTE" ? "bg-emerald-100 text-emerald-700" :
                        r.recommendation === "RETAIN" ? "bg-blue-100 text-blue-700" :
                        r.recommendation === "TRAIN" ? "bg-amber-100 text-amber-700" :
                        r.recommendation === "TERMINATE" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{r.recommendation || "N/A"}</span>
                      <TrendingUp className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""} text-navy-400`} />
                    </div>
                  </button>
                  {expanded && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* Category scores */}
                      <div className="space-y-2">
                        {categories.map((cat) => {
                          const val = r[cat.key];
                          if (val == null) return null;
                          return (
                            <div key={cat.key} className="flex items-center gap-3">
                              <span className="text-xs text-navy-600 w-32 flex-shrink-0">{cat.label}</span>
                              <div className="flex-1 h-2 bg-cream-200 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(val / maxScore) * 100}%`, background: primaryColor }} />
                              </div>
                              <span className="text-xs font-medium text-navy-700 w-8 text-right">{val.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Strengths / improvements / goals */}
                      {r.strengths && (
                        <div className="p-3 bg-emerald-50 rounded-xl">
                          <span className="text-xs font-medium text-emerald-700">Strengths</span>
                          <p className="text-sm text-emerald-800 mt-1">{r.strengths}</p>
                        </div>
                      )}
                      {r.improvements && (
                        <div className="p-3 bg-amber-50 rounded-xl">
                          <span className="text-xs font-medium text-amber-700">Areas for Improvement</span>
                          <p className="text-sm text-amber-800 mt-1">{r.improvements}</p>
                        </div>
                      )}
                      {r.goals && (
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <span className="text-xs font-medium text-blue-700">Goals</span>
                          <p className="text-sm text-blue-800 mt-1">{r.goals}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No reviews recorded</p>
        )}
      </div>
    </div>
  );
}

/* ── Tab 3: Training ────────────────────────────────── */

function TrainingTab({ staff, primaryColor }: { staff: StaffProfile; primaryColor: string }) {
  const records = staff.trainingRecords || [];

  const statusStyle = (s: string) => {
    switch (s) {
      case "ASSIGNED": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-700";
      case "COMPLETED": return "bg-emerald-100 text-emerald-700";
      case "EXPIRED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-cream-200">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Training Records</h3>
        </div>
        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Completed</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: any) => (
                  <tr key={r.id} className="border-b border-cream-100 hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-navy-900">{r.title || r.courseName || "-"}</td>
                    <td className="px-5 py-3 text-navy-600">{(r.trainingType || r.category || "-").replace(/_/g, " ")}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(r.status)}`}>
                        {r.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy-700">{r.score != null ? `${r.score}%` : "-"}</td>
                    <td className="px-5 py-3 text-navy-500 text-xs">{fmtDate(r.completedDate || r.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No training records</p>
        )}
      </div>
    </div>
  );
}

/* ── Tab 4: Compensation ────────────────────────────── */

function CompensationTab({ staff, primaryColor }: { staff: StaffProfile; primaryColor: string }) {
  const currency = staff.salaryCurrency || "EUR";
  const commissions = staff.staffCommissions || [];
  const bonuses = staff.staffBonuses || [];
  const payouts = staff.staffPayouts || [];

  return (
    <div className="space-y-6">
      {/* Salary info */}
      <div className="card p-5">
        <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-3">Salary</h3>
        {staff.salaryAmount != null ? (
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl text-navy-900">{currency} {staff.salaryAmount.toLocaleString()}</span>
            <span className="text-sm text-navy-400">/ {(staff.salaryType || "MONTHLY").toLowerCase().replace(/_/g, " ")}</span>
          </div>
        ) : (
          <p className="text-sm text-navy-400">No salary configured</p>
        )}
      </div>

      {/* Commission configs */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-cream-200">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Commission Configuration</h3>
        </div>
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Rate</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Description</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c: any) => (
                  <tr key={c.id} className="border-b border-cream-100 hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-navy-900">{(c.commissionType || c.type || "").replace(/_/g, " ")}</td>
                    <td className="px-5 py-3 text-navy-700">
                      {c.commissionRate != null ? `${(c.commissionRate * 100).toFixed(0)}%` : c.rate != null ? `${(c.rate * 100).toFixed(0)}%` : "-"}
                    </td>
                    <td className="px-5 py-3 text-navy-500 text-xs">{c.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No commission rules configured</p>
        )}
      </div>

      {/* Bonus targets */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-cream-200">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Bonus Targets</h3>
        </div>
        {bonuses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Metric</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Target</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Current</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Reward</th>
                </tr>
              </thead>
              <tbody>
                {bonuses.map((b: any) => {
                  const pct = b.currentValue != null && b.targetValue ? Math.min((b.currentValue / b.targetValue) * 100, 100) : 0;
                  return (
                    <tr key={b.id} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-navy-900">{(b.metricType || b.metric || "").replace(/_/g, " ")}</div>
                        <div className="w-full h-1.5 bg-cream-200 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: primaryColor }} />
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-navy-700">{b.targetValue ?? "-"}</td>
                      <td className="px-5 py-3 text-right text-navy-700">{b.currentValue ?? "-"}</td>
                      <td className="px-5 py-3 text-right font-medium" style={{ color: primaryColor }}>{currency} {b.bonusAmount ?? b.reward ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No bonus targets set</p>
        )}
      </div>

      {/* Recent payouts */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-cream-200">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Recent Payouts</h3>
        </div>
        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Month</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Base</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Commission</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Bonus</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-navy-400">Total</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-navy-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: any) => (
                  <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50">
                    <td className="px-5 py-3 font-medium text-navy-900">{p.period || p.month || "-"}</td>
                    <td className="px-5 py-3 text-right text-navy-700">{currency} {(p.baseSalary || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-navy-700">{currency} {(p.commissionEarned || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-navy-700">{currency} {(p.bonusEarned || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-medium text-navy-900">{currency} {(p.totalPayout || p.totalPaid || 0).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                        p.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-navy-400 text-center py-8">No payout records</p>
        )}
      </div>
    </div>
  );
}

/* ── Tab 5: Documents ───────────────────────────────── */

function DocumentsTab({ staff, primaryColor }: { staff: StaffProfile; primaryColor: string }) {
  const docs = [
    { label: "CV / Resume", key: "cvUrl", icon: FileText },
    { label: "Employment Contract", key: "contractUrl", icon: FileText },
    { label: "ID Document", key: "idDocumentUrl", icon: Shield },
    { label: "Work Permit", key: "workPermitUrl", icon: Award },
  ];

  const staffAny = staff as any;
  const workPermitExpiry = staffAny.workPermitExpiry as string | null;
  const isExpiringSoon = workPermitExpiry && !isExpired(workPermitExpiry) && new Date(workPermitExpiry) < new Date(Date.now() + 60 * 86400000);
  const expired = workPermitExpiry ? isExpired(workPermitExpiry) : false;

  function isExpired(d: string) {
    return new Date(d) < new Date();
  }

  return (
    <div className="space-y-6">
      {/* Work permit warning */}
      {workPermitExpiry && (isExpiringSoon || expired) && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${expired ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${expired ? "text-red-500" : "text-amber-500"}`} />
          <div>
            <div className={`text-sm font-medium ${expired ? "text-red-700" : "text-amber-700"}`}>
              {expired ? "Work Permit Expired" : "Work Permit Expiring Soon"}
            </div>
            <div className={`text-xs ${expired ? "text-red-600" : "text-amber-600"}`}>
              {expired ? "Expired" : "Expires"} {fmtDate(workPermitExpiry)}
            </div>
          </div>
        </div>
      )}

      {/* Document cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {docs.map((doc) => {
          const Icon = doc.icon;
          const url = staffAny[doc.key] as string | null;
          return (
            <div key={doc.key} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: primaryColor + "15" }}>
                  <Icon className="h-5 w-5" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy-900">{doc.label}</div>
                  <div className="text-xs text-navy-400">{url ? "Uploaded" : "Not uploaded"}</div>
                </div>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium px-3 py-1.5 rounded-lg border border-cream-300 text-navy-600 hover:border-navy-300 transition">
                    View
                  </a>
                ) : (
                  <span className="text-xs px-3 py-1.5 rounded-lg bg-cream-100 text-navy-400">No file</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Work permit expiry date */}
      {workPermitExpiry && (
        <div className="card p-5">
          <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-2">Work Permit Expiry</h3>
          <p className="text-sm text-navy-900">{fmtDate(workPermitExpiry)}</p>
        </div>
      )}
    </div>
  );
}

/* ── Tab 6: Settings (inline edit) ──────────────────── */

function SettingsTab({ staff, slug, staffId, primaryColor }: { staff: StaffProfile; slug: string; staffId: string; primaryColor: string }) {
  const [form, setForm] = useState({
    designation: staff.designation,
    department: staff.department || "",
    level: staff.level,
    employmentType: staff.employmentType,
    salaryAmount: staff.salaryAmount ?? "",
    salaryCurrency: staff.salaryCurrency || "EUR",
    managerNotes: staff.managerNotes || "",
    hrNotes: staff.hrNotes || "",
    needsTraining: staff.needsTraining,
    needsCoaching: staff.needsCoaching,
    onProbation: staff.onProbation,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body = {
        ...form,
        salaryAmount: form.salaryAmount === "" ? null : Number(form.salaryAmount),
        department: form.department || null,
        managerNotes: form.managerNotes || null,
        hrNotes: form.hrNotes || null,
      };
      await fetch(`/api/v/${slug}/team/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-cream-300 text-sm text-navy-900 focus:outline-none focus:ring-2 transition";

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="text-xs font-medium text-navy-400 uppercase tracking-wider mb-5">Edit Staff Profile</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Designation */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Designation</label>
            <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className={inputClass} style={{ "--tw-ring-color": primaryColor } as any} />
          </div>
          {/* Department */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Photography, Sales" className={inputClass} style={{ "--tw-ring-color": primaryColor } as any} />
          </div>
          {/* Level */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Level</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
              className={inputClass} style={{ "--tw-ring-color": primaryColor } as any}>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid</option>
              <option value="SENIOR">Senior</option>
              <option value="LEAD">Lead</option>
              <option value="MANAGER">Manager</option>
              <option value="DIRECTOR">Director</option>
            </select>
          </div>
          {/* Employment type */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Employment Type</label>
            <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              className={inputClass} style={{ "--tw-ring-color": primaryColor } as any}>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>
          {/* Salary amount */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Salary Amount</label>
            <input type="number" value={form.salaryAmount} onChange={(e) => setForm({ ...form, salaryAmount: e.target.value })}
              placeholder="0" className={inputClass} style={{ "--tw-ring-color": primaryColor } as any} />
          </div>
          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-navy-600 mb-1.5">Currency</label>
            <select value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })}
              className={inputClass} style={{ "--tw-ring-color": primaryColor } as any}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="TND">TND</option>
            </select>
          </div>
        </div>

        {/* Toggle switches */}
        <div className="mt-6 space-y-4">
          <h4 className="text-xs font-medium text-navy-400 uppercase tracking-wider">Status Flags</h4>
          {[
            { key: "needsTraining" as const, label: "Needs Training", desc: "Flag this staff member for training" },
            { key: "needsCoaching" as const, label: "Needs Coaching", desc: "Flag this staff member for coaching sessions" },
            { key: "onProbation" as const, label: "On Probation", desc: "Mark as on probation period" },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-navy-900">{toggle.label}</div>
                <div className="text-xs text-navy-400">{toggle.desc}</div>
              </div>
              <button
                onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form[toggle.key] ? "" : "bg-cream-300"}`}
                style={form[toggle.key] ? { background: primaryColor } : {}}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form[toggle.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>

        {/* Manager notes */}
        <div className="mt-6">
          <label className="block text-xs font-medium text-navy-600 mb-1.5">Manager Notes</label>
          <textarea value={form.managerNotes} onChange={(e) => setForm({ ...form, managerNotes: e.target.value })}
            rows={3} placeholder="Notes visible to managers..."
            className={`${inputClass} resize-none`} style={{ "--tw-ring-color": primaryColor } as any} />
        </div>

        {/* HR notes */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-navy-600 mb-1.5">HR Notes</label>
          <textarea value={form.hrNotes} onChange={(e) => setForm({ ...form, hrNotes: e.target.value })}
            rows={3} placeholder="Confidential HR notes..."
            className={`${inputClass} resize-none`} style={{ "--tw-ring-color": primaryColor } as any} />
        </div>

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-60"
            style={{ background: primaryColor }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">Changes saved successfully</span>
          )}
        </div>
      </div>
    </div>
  );
}
