"use client";
import { useEffect, useState } from "react";
import { Users, Plus, FileText } from "lucide-react";

const FLOW = ["RECEIVED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED"];
const STAGE_COLOR: Record<string, string> = {
  RECEIVED: "bg-cream-200 text-navy-600",
  SHORTLISTED: "bg-brand-50 text-brand-700",
  INTERVIEWED: "bg-gold-500/10 text-gold-600",
  OFFERED: "bg-green-50 text-green-700",
  REJECTED: "bg-coral-50 text-coral-700",
};

export default function HRApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [form, setForm] = useState({ jobId: "", applicantName: "", applicantEmail: "", cvUrl: "" });

  async function load() { const r = await fetch("/api/hr/applications").then((x) => x.json()); setApps(r.applications || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/hr/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ jobId: "", applicantName: "", applicantEmail: "", cvUrl: "" });
    load();
  }

  async function move(id: string, status: string) {
    await fetch("/api/hr/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Module 16</div>
        <h1 className="heading text-4xl mt-1">Application Pipeline</h1>
        <p className="text-navy-400 mt-1">Drag candidates through your hiring workflow.</p>
      </header>

      <form onSubmit={create} className="card p-5 flex flex-wrap gap-3 items-end">
        <input className="input flex-1 min-w-[140px]" placeholder="Job ID" value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })} required />
        <input className="input flex-1 min-w-[140px]" placeholder="Name" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required />
        <input className="input flex-1 min-w-[140px]" placeholder="Email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} required />
        <input className="input flex-1 min-w-[140px]" placeholder="CV URL" value={form.cvUrl} onChange={(e) => setForm({ ...form, cvUrl: e.target.value })} />
        <button className="btn-primary"><Plus className="h-4 w-4" /> Add</button>
      </form>

      <div className="grid md:grid-cols-5 gap-3">
        {FLOW.map((stage) => (
          <div key={stage} className="card p-3 min-h-[200px]">
            <div className={`text-[10px] font-semibold uppercase tracking-wider text-center mb-3 px-2 py-1 rounded-lg ${STAGE_COLOR[stage]}`}>
              {stage}
            </div>
            <div className="space-y-2">
              {apps.filter((a) => a.status === stage).map((a) => (
                <div key={a.id} className="bg-cream-100 rounded-xl p-3 text-sm">
                  <div className="font-semibold text-navy-900">{a.applicantName}</div>
                  <div className="text-xs text-navy-400 truncate">{a.applicantEmail}</div>
                  {a.cvUrl && (
                    <a href={a.cvUrl} className="text-brand-400 hover:text-brand-700 text-xs inline-flex items-center gap-1 mt-1">
                      <FileText className="h-3 w-3" /> CV
                    </a>
                  )}
                  <select
                    className="mt-2 w-full text-xs rounded-lg border border-cream-300 bg-white px-2 py-1.5 text-navy-600 focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                    value={a.status}
                    onChange={(e) => move(a.id, e.target.value)}
                  >
                    {FLOW.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
