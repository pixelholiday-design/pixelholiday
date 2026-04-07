"use client";
import { useEffect, useState } from "react";

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
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">HR — Job Postings</h1>
      <a href="/admin/hr/applications" className="text-blue-600 underline text-sm">→ Application pipeline</a>

      <form onSubmit={create} className="bg-white p-6 rounded-xl shadow my-6 space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full border p-2 rounded" placeholder="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Location ID (optional)" value={form.locationId} onChange={(e) => setForm({ ...form, locationId: e.target.value })} />
        <button className="bg-orange-600 text-white px-4 py-2 rounded">Post Job</button>
      </form>

      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
            <div>
              <div className="font-bold">{j.title} <span className="text-xs bg-gray-100 px-2 rounded">{j.status}</span></div>
              <div className="text-sm text-gray-600">{j.requirements}</div>
            </div>
            {j.status === "OPEN" && <button onClick={() => close(j.id)} className="text-red-600 text-sm">Close</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
