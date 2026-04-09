"use client";
import { useEffect, useState } from "react";
import { Briefcase, Plus, X } from "lucide-react";

export default function HRJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", requirements: "", locationId: "" });

  async function load() { const r = await fetch("/api/hr/jobs").then((x) => x.json()); setJobs(r.jobs || []); }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/hr/jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", requirements: "", locationId: "" });
    load();
  }

  async function close(id: string) {
    await fetch("/api/hr/jobs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: "CLOSED" }) });
    load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Module 16</div>
          <h1 className="heading text-4xl mt-1">Job Postings</h1>
          <p className="text-navy-400 mt-1">
            Manage open positions.{" "}
            <a href="/admin/hr/applications" className="text-brand-400 hover:text-brand-700 font-medium">Application pipeline &rarr;</a>
          </p>
        </div>
      </header>

      <form onSubmit={create} className="card p-6 space-y-4">
        <h2 className="heading text-xl flex items-center gap-2"><Plus className="h-4 w-4" /> Post a Job</h2>
        <input className="input" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input h-24" placeholder="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
        <input className="input" placeholder="Location ID (optional)" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} />
        <button className="btn-primary">Post Job</button>
      </form>

      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <Briefcase className="h-8 w-8 mx-auto text-navy-300 mb-3" />
          <div className="text-navy-500">No job postings yet.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="card p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-navy-900 flex items-center gap-2">
                  {j.title}
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                    j.status === "OPEN" ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-500"
                  }`}>{j.status}</span>
                </div>
                <div className="text-sm text-navy-400 mt-0.5">{j.requirements}</div>
              </div>
              {j.status === "OPEN" && (
                <button onClick={() => close(j.id)} className="btn-ghost text-coral-600 hover:bg-coral-50">
                  <X className="h-4 w-4" /> Close
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
