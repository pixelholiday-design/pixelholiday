"use client";
import { useEffect, useState } from "react";

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
    setStatus("✓ Created");
    setForm({ title: "", description: "", content: "", type: "ONBOARDING", isRequired: false, requiredForRoles: [], quiz: "" });
    load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Academy — Module Management</h1>
      <a href="/admin/academy/progress" className="text-blue-600 underline text-sm">→ View progress tracker</a>

      <form onSubmit={create} className="bg-white p-6 rounded-xl shadow my-6 space-y-3">
        <h2 className="text-xl font-bold">Create Module</h2>
        <input className="w-full border p-2 rounded" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea className="w-full border p-2 rounded h-32" placeholder="Markdown content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <textarea className="w-full border p-2 rounded h-20" placeholder='Quiz JSON: [{"q":"...","a":"..."}]' value={form.quiz} onChange={(e) => setForm({ ...form, quiz: e.target.value })} />
        <select className="border p-2 rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-2 ml-3"><input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} /> Required</label>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm">Required for roles:</span>
          {ROLES.map((r) => (
            <label key={r} className="text-xs flex items-center gap-1">
              <input type="checkbox" checked={form.requiredForRoles.includes(r)} onChange={(e) => {
                const next = e.target.checked ? [...form.requiredForRoles, r] : form.requiredForRoles.filter((x) => x !== r);
                setForm({ ...form, requiredForRoles: next });
              }} />{r}
            </label>
          ))}
        </div>
        <button className="bg-orange-600 text-white px-4 py-2 rounded">Save Module</button>
        <span className="ml-3 text-sm">{status}</span>
      </form>

      <div className="grid md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div key={m.id} className="bg-white p-4 rounded-xl shadow">
            <div className="flex justify-between">
              <div className="font-bold">{m.title}</div>
              <span className="text-xs bg-gray-100 px-2 rounded">{m.type}</span>
            </div>
            <div className="text-sm text-gray-600">{m.description}</div>
            {m.isRequired && <span className="inline-block mt-2 text-xs bg-red-100 text-red-700 px-2 rounded">REQUIRED</span>}
            {m.requiredForRoles?.length > 0 && <div className="text-xs mt-1">For: {m.requiredForRoles.join(", ")}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
