"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Phone, Tag, MessageSquare, Edit3, Save, Plus, User } from "lucide-react";
import Link from "next/link";

interface CrmClient {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string[];
  notes: string | null;
  source: string | null;
  status: string;
  totalSpent: number;
  sessionCount: number;
  lastContactAt: string | null;
  communications: Communication[];
  createdAt: string;
}

interface Communication {
  id: string;
  type: string;
  subject: string | null;
  content: string;
  createdAt: string;
}

export default function ClientDetailClient({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<CrmClient | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", status: "", tags: "" });
  const [newComm, setNewComm] = useState({ type: "NOTE", subject: "", content: "" });
  const [showCommForm, setShowCommForm] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/clients/${clientId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.client) {
          setClient(d.client);
          setForm({
            name: d.client.name,
            email: d.client.email || "",
            phone: d.client.phone || "",
            notes: d.client.notes || "",
            status: d.client.status,
            tags: d.client.tags.join(", "),
          });
        }
      });
  }, [clientId]);

  async function handleSave() {
    const res = await fetch(`/api/dashboard/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (data.client) {
      setClient({ ...client!, ...data.client });
      setEditing(false);
    }
  }

  async function handleAddComm() {
    if (!newComm.content) return;
    const res = await fetch(`/api/dashboard/clients/${clientId}/communications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComm),
    });
    const data = await res.json();
    if (data.communication) {
      setClient((c) => c ? { ...c, communications: [data.communication, ...c.communications] } : c);
      setNewComm({ type: "NOTE", subject: "", content: "" });
      setShowCommForm(false);
    }
  }

  if (!client) return <div className="p-8 text-center text-navy-400">Loading...</div>;

  const statusColors: Record<string, string> = {
    LEAD: "bg-yellow-100 text-yellow-800",
    ACTIVE: "bg-green-100 text-green-800",
    VIP: "bg-purple-100 text-purple-800",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/clients" className="rounded-lg p-2 hover:bg-cream-100">
          <ArrowLeft className="h-5 w-5 text-navy-500" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-navy-900">{client.name}</h1>
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[client.status] || "bg-gray-100"}`}>
            {client.status}
          </span>
        </div>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit3 className="h-4 w-4" /> Edit</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-lg text-navy-900">Contact Info</h2>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-xs block mb-1">Name</label>
                  <input className="input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label-xs block mb-1">Status</label>
                  <select className="input w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="label-xs block mb-1">Email</label>
                  <input className="input w-full" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label-xs block mb-1">Phone</label>
                  <input className="input w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label-xs block mb-1">Tags (comma-separated)</label>
                  <input className="input w-full" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="wedding, portrait, vip" />
                </div>
                <div className="col-span-2">
                  <label className="label-xs block mb-1">Notes</label>
                  <textarea className="input w-full" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-navy-600">
                  <Mail className="h-4 w-4 text-navy-400" /> {client.email || "No email"}
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-600">
                  <Phone className="h-4 w-4 text-navy-400" /> {client.phone || "No phone"}
                </div>
                {client.tags.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-navy-400" />
                    <div className="flex gap-1.5 flex-wrap">
                      {client.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {client.notes && <p className="text-sm text-navy-500 mt-2 whitespace-pre-wrap">{client.notes}</p>}
              </div>
            )}
          </div>

          {/* Communication History */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-navy-900">Communications</h2>
              <button onClick={() => setShowCommForm(!showCommForm)} className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700">
                <Plus className="h-4 w-4" /> Add Note
              </button>
            </div>

            {showCommForm && (
              <div className="mb-4 p-4 rounded-xl bg-cream-50 space-y-3">
                <select className="input w-full" value={newComm.type} onChange={(e) => setNewComm({ ...newComm, type: e.target.value })}>
                  <option value="NOTE">Note</option>
                  <option value="EMAIL">Email</option>
                  <option value="PHONE">Phone Call</option>
                  <option value="MEETING">Meeting</option>
                </select>
                <input className="input w-full" placeholder="Subject (optional)" value={newComm.subject} onChange={(e) => setNewComm({ ...newComm, subject: e.target.value })} />
                <textarea className="input w-full" rows={3} placeholder="Details..." value={newComm.content} onChange={(e) => setNewComm({ ...newComm, content: e.target.value })} />
                <button onClick={handleAddComm} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">
                  Save
                </button>
              </div>
            )}

            <div className="space-y-3">
              {client.communications.length === 0 && (
                <p className="text-sm text-navy-400 text-center py-4">No communications yet</p>
              )}
              {client.communications.map((c) => (
                <div key={c.id} className="flex gap-3 p-3 rounded-lg hover:bg-cream-50">
                  <MessageSquare className="h-4 w-4 text-navy-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-navy-400">
                      <span className="font-medium text-navy-600">{c.type}</span>
                      {c.subject && <span>— {c.subject}</span>}
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-navy-700 mt-0.5 whitespace-pre-wrap">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="font-display text-lg text-navy-900">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Total Spent</span>
                <span className="font-semibold text-navy-900">{client.totalSpent.toFixed(2)} EUR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Sessions</span>
                <span className="font-semibold text-navy-900">{client.sessionCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Source</span>
                <span className="font-semibold text-navy-900">{client.source || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Last Contact</span>
                <span className="font-semibold text-navy-900">
                  {client.lastContactAt ? new Date(client.lastContactAt).toLocaleDateString() : "Never"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">Client Since</span>
                <span className="font-semibold text-navy-900">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
