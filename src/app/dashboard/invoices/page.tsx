"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Send, Check, Clock, DollarSign, X, Loader2 } from "lucide-react";

type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  items: { description: string; amount: number }[];
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load invoices from API (or show empty state)
    fetch("/api/dashboard/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0),
    pending: invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Invoices</h1>
          <p className="text-navy-500 text-sm mt-1">Create and track invoices for your clients</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> New invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{stats.total}</div>
              <div className="text-xs text-navy-400">Total invoices</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">&euro;{stats.paid.toFixed(0)}</div>
              <div className="text-xs text-navy-400">Paid</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gold-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">&euro;{stats.pending.toFixed(0)}</div>
              <div className="text-xs text-navy-400">Pending</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-coral-500" />
            <div>
              <div className="font-display text-2xl text-navy-900">{stats.overdue}</div>
              <div className="text-xs text-navy-400">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      {loading ? (
        <div className="text-center py-16 text-navy-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto text-navy-300 mb-3" />
          <p className="text-navy-500 font-medium">No invoices yet</p>
          <p className="text-sm text-navy-400 mt-1">Create your first invoice to start tracking payments from clients.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">
            <Plus className="h-4 w-4" /> Create invoice
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-3 bg-cream-50 border-b border-cream-200 text-xs font-semibold text-navy-500 uppercase tracking-wide">
            <div>Client</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Due date</div>
            <div>Actions</div>
          </div>
          {invoices.map((inv) => (
            <div key={inv.id} className="grid grid-cols-[1fr,auto,auto,auto,auto] gap-4 px-5 py-4 border-b border-cream-100 items-center">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{inv.clientName}</div>
                <div className="text-xs text-navy-400">{inv.clientEmail}</div>
              </div>
              <div className="font-display text-navy-900">&euro;{inv.amount.toFixed(2)}</div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  inv.status === "PAID" ? "bg-green-100 text-green-700" :
                  inv.status === "SENT" ? "bg-blue-100 text-blue-700" :
                  inv.status === "OVERDUE" ? "bg-coral-100 text-coral-700" :
                  "bg-cream-200 text-navy-500"
                }`}>
                  {inv.status}
                </span>
              </div>
              <div className="text-sm text-navy-500">{new Date(inv.dueDate).toLocaleDateString()}</div>
              <div>
                {inv.status === "DRAFT" && (
                  <button className="text-xs text-brand-500 hover:text-brand-700 font-medium flex items-center gap-1">
                    <Send className="h-3 w-3" /> Send
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create invoice modal */}
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateInvoiceModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", description: "", amount: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    // Save invoice via API
    try {
      await fetch("/api/dashboard/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount) || 0,
        }),
      });
      onClose();
      window.location.reload();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lift w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-navy-900">New Invoice</h2>
          <button onClick={onClose} className="text-navy-400 hover:text-navy-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label-xs block mb-1.5">Client name</label>
            <input className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="John Smith" />
          </div>
          <div>
            <label className="label-xs block mb-1.5">Client email</label>
            <input className="input" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="john@example.com" />
          </div>
          <div>
            <label className="label-xs block mb-1.5">Description</label>
            <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Wedding photography — May 15" />
          </div>
          <div>
            <label className="label-xs block mb-1.5">Amount (&euro;)</label>
            <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="1500.00" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.clientName || !form.amount} className="btn-primary flex-1">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
