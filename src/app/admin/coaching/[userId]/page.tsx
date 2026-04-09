"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Brain, TrendingUp, BookOpen, Send, CheckCircle, AlertTriangle } from "lucide-react";

const SKILL_LABELS: Record<string, string> = {
  individual: "Individual Poses",
  couple: "Couple Poses",
  family: "Family Poses",
  kids: "Kids",
  action: "Action / Sports",
  portrait: "Portrait",
};

const SKILL_KEYS = Object.keys(SKILL_LABELS);

function SkillBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "bg-green-500" : value >= 40 ? "bg-gold-500" : "bg-coral-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-navy-700">{label}</span>
        <span className="text-sm font-bold text-navy-900">{value}/100</span>
      </div>
      <div className="h-2.5 bg-cream-300 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function PhotographerCoachingPage() {
  const params = useParams();
  const userId = params?.userId as string;

  const [profileData, setProfileData] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingWa, setSendingWa] = useState(false);
  const [waSent, setWaSent] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/ai/skill-profile/${userId}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/ai/weekly-report/${userId}`).then((r) => r.json()).catch(() => null),
    ]).then(([profile, report]) => {
      setProfileData(profile);
      setReportData(report);
      setLoading(false);
    });
  }, [userId]);

  async function sendWhatsAppReport() {
    setSendingWa(true);
    setWaError(null);
    setWaSent(false);
    try {
      const res = await fetch("/api/ai/send-coaching-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setWaSent(true);
      } else {
        setWaError(data.error || "Failed to send.");
      }
    } catch (e: any) {
      setWaError(e.message || "Failed to send.");
    } finally {
      setSendingWa(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-navy-400">
        <Brain className="h-6 w-6 animate-pulse mr-2" /> Loading coaching data…
      </div>
    );
  }

  const profile = profileData?.profile;
  const assignments = profileData?.trainingAssignments || [];
  const report = reportData?.report;

  const skillValues = profile
    ? SKILL_KEYS.map((k) => ({ key: k, label: SKILL_LABELS[k], value: (profile as any)[`${k}Poses`] ?? 0 }))
    : [];

  const avgScore = skillValues.length
    ? Math.round(skillValues.reduce((s, v) => s + v.value, 0) / skillValues.length)
    : 0;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="label-xs">AI Growth Engine</div>
          <h1 className="heading text-4xl mt-1">Photographer Coaching</h1>
          <p className="text-navy-400 mt-1">Skill profile, improvement tips, and weekly report for this photographer.</p>
        </div>
        <button
          onClick={sendWhatsAppReport}
          disabled={sendingWa}
          className="btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <Send className="h-4 w-4" />
          {sendingWa ? "Sending…" : "Send Report via WhatsApp"}
        </button>
      </header>

      {waSent && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Weekly report sent via WhatsApp.
        </div>
      )}
      {waError && (
        <div className="flex items-center gap-2 bg-coral-50 border border-coral-200 text-coral-700 rounded-xl px-5 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {waError}
        </div>
      )}

      {/* Overall score */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center mb-3">
            <Brain className="h-4 w-4" />
          </div>
          <div className="label-xs">Overall skill score</div>
          <div className="font-display text-4xl text-navy-900 mt-1">{avgScore}<span className="text-lg font-normal text-navy-400">/100</span></div>
          <div className={`text-xs mt-1 font-medium ${avgScore >= 70 ? "text-green-600" : avgScore >= 40 ? "text-gold-600" : "text-coral-600"}`}>
            {avgScore >= 70 ? "Strong performer" : avgScore >= 40 ? "Developing" : "Needs coaching"}
          </div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-3">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="label-xs">Training assignments</div>
          <div className="font-display text-4xl text-navy-900 mt-1">{assignments.length}</div>
          <div className="text-xs text-navy-400 mt-1">
            {assignments.filter((a: any) => a.status === "completed").length} completed
          </div>
        </div>
        <div className="stat-card">
          <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-3">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="label-xs">Weakest skill</div>
          <div className="font-display text-xl text-navy-900 mt-1">
            {skillValues.length
              ? SKILL_LABELS[skillValues.reduce((min, v) => (v.value < min.value ? v : min), skillValues[0]).key]
              : "—"}
          </div>
          <div className="text-xs text-navy-400 mt-1">Focus training here</div>
        </div>
      </div>

      {/* Skill bars */}
      {skillValues.length > 0 && (
        <div className="card p-6">
          <h2 className="heading text-xl mb-5 flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand-600" /> Skill Profile
          </h2>
          <div className="space-y-4">
            {skillValues.map(({ key, label, value }) => (
              <SkillBar key={key} label={label} value={value} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly report */}
      {report && (
        <div className="card p-6">
          <h2 className="heading text-xl mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" /> Weekly Report
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div>
              <div className="label-xs">Skill score</div>
              <div className="font-display text-2xl text-navy-900">{report.avgOverallScore ?? "—"}<span className="text-sm font-normal text-navy-400">/100</span></div>
            </div>
            <div>
              <div className="label-xs">Score change</div>
              <div className={`font-display text-2xl ${(report.scoreChange ?? 0) >= 0 ? "text-green-700" : "text-coral-600"}`}>
                {report.scoreChange != null ? `${report.scoreChange >= 0 ? "+" : ""}${report.scoreChange}` : "—"}
              </div>
            </div>
            <div>
              <div className="label-xs">Photos analyzed</div>
              <div className="font-display text-2xl text-navy-900">{report.photosAnalyzed ?? "—"}</div>
            </div>
          </div>
          {(report.strengths || report.improvements || report.recommendations) && (
            <div className="space-y-3">
              {report.strengths && (
                <div>
                  <div className="label-xs mb-1 text-green-600">Strengths</div>
                  <p className="text-sm text-navy-700">{report.strengths}</p>
                </div>
              )}
              {report.improvements && (
                <div>
                  <div className="label-xs mb-1 text-gold-600">Areas to improve</div>
                  <p className="text-sm text-navy-700">{report.improvements}</p>
                </div>
              )}
              {report.recommendations && (
                <div>
                  <div className="label-xs mb-1 text-brand-600">Recommendations</div>
                  <p className="text-sm text-navy-700">{report.recommendations}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Training assignments */}
      {assignments.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-300/70">
            <h2 className="heading text-lg flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-600" /> Training Assignments
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3">Skill before</th>
                <th className="px-6 py-3">Skill after</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {assignments.map((a: any) => (
                <tr key={a.id} className="hover:bg-cream-100/60">
                  <td className="px-6 py-3 text-navy-900 font-medium">{a.module?.title || "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.skillBefore ?? "—"}</td>
                  <td className="px-6 py-3 text-navy-500">{a.skillAfter ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-1 ${
                        a.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : a.status === "in_progress"
                          ? "bg-brand-50 text-brand-700"
                          : "bg-cream-200 text-navy-500"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!profile && !report && (
        <div className="card p-10 text-center text-navy-400">
          <Brain className="h-8 w-8 mx-auto text-navy-300 mb-3" />
          <p>No coaching data yet for this photographer.</p>
          <p className="text-sm mt-1">Upload galleries and complete training to generate a profile.</p>
        </div>
      )}
    </div>
  );
}
