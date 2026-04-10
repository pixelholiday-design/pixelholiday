"use client";
import { useEffect, useState } from "react";
import { FileSignature, Plus, Send, Check, Clock, Eye, Loader2, X } from "lucide-react";

type Contract = { id: string; title: string; clientName: string; clientEmail: string; status: string; sentAt: string | null; clientSignedAt: string | null; createdAt: string };
type Template = { id: string; name: string; content: string; category: string };

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-cream-200 text-navy-500", SENT: "bg-blue-100 text-blue-700", VIEWED: "bg-purple-100 text-purple-700",
  PHOTOGRAPHER_SIGNED: "bg-gold-100 text-gold-700", FULLY_SIGNED: "bg-green-100 text-green-700",
  EXPIRED: "bg-cream-200 text-navy-400", CANCELLED: "bg-coral-100 text-coral-700",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, signed: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetch("/api/contracts").then((r) => r.json()).then((d) => { setContracts(d.contracts || []); setStats(d.stats || {}); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function sendContract(id: string) {
    await fetch(`/api/contracts/${id}/send`, { method: "POST" });
    setContracts((prev) => prev.map((c) => c.id === id ? { ...c, status: "SENT", sentAt: new Date().toISOString() } : c));
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-900">Contracts</h1>
          <p className="text-navy-500 text-sm mt-1">Send legally binding contracts with e-signatures</p>
        </div>
        <button onClick={() => { setShowCreate(true); fetch("/api/contracts/templates").then((r) => r.json()).then((d) => setTemplates(d.templates || [])); }} className="btn-primary"><Plus className="h-4 w-4" /> New contract</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, icon: FileSignature, color: "text-brand-500" },
          { label: "Draft", value: stats.draft, icon: Clock, color: "text-navy-400" },
          { label: "Sent", value: stats.sent, icon: Send, color: "text-blue-500" },
          { label: "Signed", value: stats.signed, icon: Check, color: "text-green-500" },
        ].map((s) => { const Icon = s.icon; return (
          <div key={s.label} className="card p-4"><Icon className={`h-4 w-4 ${s.color} mb-1`} /><div className="font-display text-xl text-navy-900">{s.value}</div><div className="text-xs text-navy-400">{s.label}</div></div>
        ); })}
      </div>

      {loading ? <div className="text-center py-16 text-navy-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div> : contracts.length === 0 ? (
        <div className="text-center py-16"><FileSignature className="h-12 w-12 mx-auto text-navy-300 mb-3" /><p className="text-navy-500 font-medium">No contracts yet</p><p className="text-sm text-navy-400 mt-1">Create your first contract from a template.</p></div>
      ) : (
        <div className="card overflow-hidden">
          {contracts.map((c) => (
            <div key={c.id} className="px-5 py-4 border-b border-cream-100 flex items-center justify-between hover:bg-cream-50 transition">
              <div>
                <div className="font-semibold text-navy-900 text-sm">{c.title}</div>
                <div className="text-xs text-navy-400 mt-0.5">{c.clientName} &middot; {c.clientEmail}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[c.status] || "bg-cream-200 text-navy-500"}`}>{c.status.replace("_", " ")}</span>
                {c.status === "DRAFT" && <button onClick={() => sendContract(c.id)} className="text-xs text-brand-500 hover:text-brand-700 font-medium flex items-center gap-1"><Send className="h-3 w-3" /> Send</button>}
                {c.status === "FULLY_SIGNED" && <Check className="h-4 w-4 text-green-500" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateContractModal templates={templates} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); window.location.reload(); }} />}
    </div>
  );
}

function CreateContractModal({ templates, onClose, onCreated }: { templates: Template[]; onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState({ title: "", content: "", clientName: "", clientEmail: "" });
  const [saving, setSaving] = useState(false);

  function selectTemplate(t: Template) {
    setSelectedTemplate(t);
    setForm((f) => ({ ...f, title: t.name, content: t.content }));
    setStep(2);
  }

  async function create() {
    setSaving(true);
    await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-lift w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-navy-900">{step === 1 ? "Choose template" : "Contract details"}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-navy-400" /></button>
        </div>
        {step === 1 ? (
          <div className="space-y-2">
            {templates.map((t) => (
              <button key={t.id} onClick={() => selectTemplate(t)} className="w-full text-left card p-4 hover:shadow-card transition">
                <div className="font-semibold text-navy-900 text-sm">{t.name}</div>
                <div className="text-xs text-navy-400">{t.category}</div>
              </button>
            ))}
            <button onClick={() => { setForm((f) => ({ ...f, title: "Custom Contract", content: "<h1>Contract</h1><p>Enter your contract terms here.</p>" })); setStep(2); }} className="w-full text-left card p-4 hover:shadow-card transition border-dashed border-2 border-cream-300">
              <div className="font-semibold text-navy-900 text-sm">Start blank</div>
              <div className="text-xs text-navy-400">Write your own contract from scratch</div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div><label className="label-xs block mb-1">Title</label><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="label-xs block mb-1">Client name</label><input className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="John Smith" /></div>
            <div><label className="label-xs block mb-1">Client email</label><input className="input" type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="john@example.com" /></div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
              <button onClick={create} disabled={saving || !form.clientName || !form.clientEmail} className="btn-primary flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSignature className="h-4 w-4" />} Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
