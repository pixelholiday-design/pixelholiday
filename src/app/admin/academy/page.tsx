"use client";
import { useEffect, useState } from "react";
import { GraduationCap, Plus, BookOpen, Shield } from "lucide-react";

const TYPES = ["ONBOARDING", "SALES_TRAINING", "PHOTOGRAPHY_TECHNIQUE", "SOFTWARE_TRAINING", "COMPLIANCE"];
const ROLES = ["CEO", "OPERATIONS_MANAGER", "SUPERVISOR", "PHOTOGRAPHER", "SALES_STAFF", "RECEPTIONIST", "ACADEMY_TRAINEE"];

export default function AcademyAdmin() {
  const [modules, setModules] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", content: "", type: "ONBOARDING", isRequired: false, requiredForRoles: [] as string[], quiz: "" });
  const [status, setStatus] = useState("");

  async function load() {
    const r = await fetch("/api/academy/modules").then((x) => x.json());
    setModules(r.modules || []);
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating…");
    await fetch("/api/academy/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setStatus("Created");
    setForm({ title: "", description: "", content: "", type: "ONBOARDING", isRequired: false, requiredForRoles: [], quiz: "" });
    load();
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-xs">Module 16</div>
          <h1 className="heading text-4xl mt-1">Academy</h1>
          <p className="text-navy-400 mt-1">
            Training modules, onboarding, and compliance.{" "}
            <a href="/admin/academy/progress" className="text-brand-400 hover:text-brand-700 font-medium">View progress tracker &rarr;</a>
          </p>
        </div>
      </header>

      <form onSubmit={create} className="card p-6 space-y-4">
        <h2 className="heading text-xl flex items-center gap-2"><Plus className="h-4 w-4" /> Create Module</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <textarea className="input h-32" placeholder="Markdown content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <textarea className="input h-20" placeholder='Quiz JSON: [{"q":"...","a":"..."}]' value={form.quiz} onChange={(e) => setForm({ ...form, quiz: e.target.value })} />
        <div className="flex flex-wrap items-center gap-4">
          <select className="input w-auto" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} className="accent-coral-500" />
            Required
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-navy-500">Required for:</span>
          {ROLES.map((r) => (
            <label key={r} className="text-xs flex items-center gap-1.5 text-navy-600">
              <input type="checkbox" checked={form.requiredForRoles.includes(r)} className="accent-coral-500" onChange={(e) => {
                const next = e.target.checked ? [...form.requiredForRoles, r] : form.requiredForRoles.filter((x) => x !== r);
                setForm({ ...form, requiredForRoles: next });
              }} />{r.replace(/_/g, " ")}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary">Save Module</button>
          {status && <span className="text-sm text-green-600">{status}</span>}
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-5">
        {modules.length === 0 && (
          <div className="card p-10 text-center col-span-2">
            <GraduationCap className="h-8 w-8 mx-auto text-navy-300 mb-3" />
            <div className="text-navy-500">No modules yet. Create your first one above.</div>
          </div>
        )}
        {modules.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-navy-900">{m.title}</div>
                  <div className="text-sm text-navy-400">{m.description}</div>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-wider bg-cream-200 text-navy-500 px-2 py-0.5 rounded-full font-medium">{m.type?.replace(/_/g, " ")}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {m.isRequired && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-coral-50 text-coral-700 px-2 py-0.5 rounded-full font-medium">
                  <Shield className="h-2.5 w-2.5" /> REQUIRED
                </span>
              )}
              {m.requiredForRoles?.length > 0 && (
                <span className="text-[10px] text-navy-400">For: {m.requiredForRoles.join(", ")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
