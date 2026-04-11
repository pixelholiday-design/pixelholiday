"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Clock, Users, MapPin, DollarSign, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";

type MiniSession = {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxSlots: number;
  bookedSlots: number;
  price: number;
  currency: string;
  location: string;
  coverImage: string | null;
  isPublished: boolean;
  slug: string;
};

export default function MiniSessionsPage() {
  const [sessions, setSessions] = useState<MiniSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 20,
    maxSlots: 12,
    price: 99,
    currency: "EUR",
    location: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  function loadSessions() {
    fetch("/api/dashboard/mini-sessions")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function createSession() {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/mini-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      setShowForm(false);
      setForm({ title: "", description: "", date: "", startTime: "09:00", endTime: "17:00", slotDuration: 20, maxSlots: 12, price: 99, currency: "EUR", location: "" });
      loadSessions();
    } catch {
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(id: string, published: boolean) {
    await fetch(`/api/dashboard/mini-sessions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !published }),
    });
    loadSessions();
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this mini session?")) return;
    await fetch(`/api/dashboard/mini-sessions/${id}`, { method: "DELETE" });
    loadSessions();
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Mini Sessions</h1>
            <p className="text-navy-500 text-sm">Create bookable short photo sessions</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Session
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-cream-200 p-6 mb-6">
          <h2 className="font-semibold text-navy-800 mb-4">Create Mini Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-navy-600 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Spring Mini Session"
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Central Park, NY"
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-navy-600 mb-1">Start</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-navy-600 mb-1">End</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Slot Duration (min)</label>
              <input
                type="number"
                value={form.slotDuration}
                onChange={(e) => setForm({ ...form, slotDuration: parseInt(e.target.value) || 20 })}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Max Slots</label>
              <input
                type="number"
                value={form.maxSlots}
                onChange={(e) => setForm({ ...form, maxSlots: parseInt(e.target.value) || 12 })}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-600 mb-1">Price</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-navy-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe what's included..."
              className="w-full px-3 py-2 rounded-lg border border-cream-300 text-sm"
            />
          </div>
          <button
            onClick={createSession}
            disabled={saving || !form.title || !form.date}
            className="px-5 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "Creating..." : "Create Session"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-cream-100 rounded-xl" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-cream-50 rounded-xl border border-cream-200">
          <Calendar className="h-12 w-12 text-navy-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy-800 mb-2">No mini sessions yet</h3>
          <p className="text-navy-500 text-sm">Create your first mini session to start booking clients</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-cream-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-navy-900">{s.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.isPublished ? "bg-green-100 text-green-700" : "bg-cream-200 text-navy-500"}`}>
                      {s.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-navy-500 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(s.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {s.slotDuration}min slots</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {s.bookedSlots}/{s.maxSlots} booked</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {s.price} {s.currency}</span>
                    {s.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {s.location}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.isPublished && (
                    <a
                      href={`/mini/${s.slug}`}
                      target="_blank"
                      className="p-2 text-navy-400 hover:text-brand-600 rounded-lg hover:bg-cream-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => togglePublish(s.id, s.isPublished)}
                    className="p-2 text-navy-400 hover:text-brand-600 rounded-lg hover:bg-cream-50"
                  >
                    {s.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteSession(s.id)}
                    className="p-2 text-navy-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
