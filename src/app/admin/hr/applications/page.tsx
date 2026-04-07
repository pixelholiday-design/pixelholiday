"use client";
import { useEffect, useState } from "react";

const FLOW = ["RECEIVED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED"];

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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">HR — Application Pipeline</h1>
      <form onSubmit={create} className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-5 gap-2">
        <input className="border p-2 rounded" placeholder="Job ID" value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Name" value={form.applicantName} onChange={(e) => setForm({ ...form, applicantName: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Email" value={form.applicantEmail} onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="CV URL" value={form.cvUrl} onChange={(e) => setForm({ ...form, cvUrl: e.target.value })} />
        <button className="bg-orange-600 text-white rounded">Add</button>
      </form>

      <div className="grid md:grid-cols-5 gap-2">
        {FLOW.map((stage) => (
          <div key={stage} className="bg-gray-100 rounded-xl p-2 min-h-[200px]">
            <div className="font-bold text-xs text-center mb-2">{stage}</div>
            {apps.filter((a) => a.status === stage).map((a) => (
              <div key={a.id} className="bg-white p-2 rounded mb-2 text-xs">
                <div className="font-bold">{a.applicantName}</div>
                <div className="text-gray-500">{a.applicantEmail}</div>
                {a.cvUrl && <a href={a.cvUrl} className="text-blue-600 underline">CV</a>}
                <select className="mt-1 w-full text-xs" value={a.status} onChange={(e) => move(a.id, e.target.value)}>
                  {FLOW.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
