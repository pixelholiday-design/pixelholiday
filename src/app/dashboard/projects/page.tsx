"use client";

import { useEffect, useState } from "react";
import { Kanban, Plus, Calendar, GripVertical, Trash2, Edit, X } from "lucide-react";

type Project = {
  id: string;
  title: string;
  status: string;
  eventDate: string | null;
  eventType: string | null;
  notes: string | null;
  clientId: string | null;
  createdAt: string;
};

const COLUMNS = [
  { id: "INQUIRY", label: "Inquiry", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "BOOKED", label: "Booked", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "SHOT", label: "Shot", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "EDITING", label: "Editing", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-700 border-green-200" },
  { id: "ARCHIVED", label: "Archived", color: "bg-cream-200 text-navy-500 border-cream-300" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", eventDate: "", eventType: "", notes: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    fetch("/api/dashboard/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function createProject() {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: "", eventDate: "", eventType: "", notes: "" });
        setShowCreate(false);
        loadProjects();
      }
    } finally {
      setCreating(false);
    }
  }

  async function moveProject(id: string, newStatus: string) {
    await fetch(`/api/dashboard/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setProjects(projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p)));
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/dashboard/projects/${id}`, { method: "DELETE" });
    loadProjects();
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <Kanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
            <p className="text-navy-500 text-sm">Track your photography workflow</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-800">New Project</h2>
            <button onClick={() => setShowCreate(false)} className="p-1 text-navy-400 hover:text-navy-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-navy-600 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Smith Wedding"
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Event Date</label>
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Event Type</label>
              <input
                type="text"
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                placeholder="Wedding, Portrait, etc."
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
          </div>
          <button
            onClick={createProject}
            disabled={creating || !form.title.trim()}
            className="px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Project"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse grid grid-cols-6 gap-4">
          {COLUMNS.map((c) => <div key={c.id} className="h-64 bg-cream-100 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.id);
            return (
              <div key={col.id} className="min-h-[200px]">
                <div className={`rounded-lg px-3 py-2 mb-3 text-xs font-semibold border ${col.color}`}>
                  {col.label} ({colProjects.length})
                </div>
                <div className="space-y-2">
                  {colProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg border border-cream-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-navy-800 leading-tight">{project.title}</h4>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="p-0.5 text-navy-300 hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      {project.eventType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-100 text-navy-500 font-medium">
                          {project.eventType}
                        </span>
                      )}
                      {project.eventDate && (
                        <div className="flex items-center gap-1 text-[10px] text-navy-400 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(project.eventDate).toLocaleDateString()}
                        </div>
                      )}
                      {/* Move buttons */}
                      <div className="flex gap-1 mt-2">
                        {COLUMNS.filter((c) => c.id !== col.id)
                          .slice(0, 3)
                          .map((target) => (
                            <button
                              key={target.id}
                              onClick={() => moveProject(project.id, target.id)}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-cream-50 text-navy-500 hover:bg-brand-50 hover:text-brand-600 border border-cream-200"
                            >
                              {target.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
