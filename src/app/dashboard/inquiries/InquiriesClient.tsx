"use client";

import { useState } from "react";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string | null;
  eventDate: string | null;
  message: string;
  budget: string | null;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS = ["NEW", "CONTACTED", "BOOKED", "DECLINED"];
const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  BOOKED: "bg-green-100 text-green-700",
  DECLINED: "bg-gray-100 text-gray-500",
};

export default function InquiriesClient({ inquiries: initial }: { inquiries: Inquiry[] }) {
  const [inquiries, setInquiries] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "all" ? inquiries : inquiries.filter(i => i.status === filter);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/photographer/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setInquiries(inquiries.map(i => i.id === id ? { ...i, status } : i));
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">&larr; Dashboard</a>
          <h1 className="text-lg font-bold text-slate-900">Inquiries</h1>
          <span className="text-sm text-slate-400">({inquiries.length})</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {["all", ...STATUS_OPTIONS].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(inq => (
            <div key={inq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setExpanded(expanded === inq.id ? null : inq.id)} className="w-full p-4 flex items-center gap-4 text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{inq.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[inq.status]}`}>{inq.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 space-x-3">
                    <span>{inq.email}</span>
                    {inq.eventType && <span>{inq.eventType}</span>}
                    {inq.eventDate && <span>{new Date(inq.eventDate).toLocaleDateString()}</span>}
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-slate-400">{expanded === inq.id ? "−" : "+"}</span>
              </button>

              {expanded === inq.id && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-sm text-slate-700 whitespace-pre-line">{inq.message}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    {inq.phone && <span>Phone: {inq.phone}</span>}
                    {inq.budget && <span>Budget: {inq.budget}</span>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {STATUS_OPTIONS.map(s => (
                      <button key={s} onClick={() => updateStatus(inq.id, s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${inq.status === s ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg mb-1">No inquiries yet</p>
              <p className="text-sm">Share your website to start receiving booking requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
