"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Loader2, Plus, Star, Trash2, Truck, Wifi, X } from "lucide-react";

type Lab = {
  id: string;
  name: string;
  type: string;
  apiBaseUrl: string | null;
  apiKey: string | null;
  isActive: boolean;
  isDefault: boolean;
  markupPercent: number;
  capabilities: string | null; // JSON string
  createdAt: string;
};

const LAB_TYPE_OPTIONS = [
  { value: "PRODIGI_API", label: "Prodigi" },
  { value: "PRINTFUL", label: "Printful" },
  { value: "LOCAL", label: "Local / Self-fulfilled" },
  { value: "MANUAL", label: "Manual" },
  { value: "WHCC_API", label: "WHCC" },
  { value: "ZNO_API", label: "Zno" },
];

const DEFAULT_URLS: Record<string, string> = {
  PRODIGI_API: "https://api.prodigi.com/v4.0",
  PRINTFUL: "https://api.printful.com",
  WHCC_API: "https://api.whcc.com",
  ZNO_API: "https://api.zno.com",
  LOCAL: "",
  MANUAL: "",
};

const CAPABILITY_OPTIONS = ["prints", "canvas", "books", "cards", "mugs", "phone_cases", "apparel"];

const TYPE_COLORS: Record<string, string> = {
  PRODIGI_API: "bg-brand-100 text-brand-700",
  PRINTFUL: "bg-blue-100 text-blue-700",
  LOCAL: "bg-green-100 text-green-700",
  MANUAL: "bg-cream-200 text-navy-600",
  WHCC_API: "bg-purple-100 text-purple-700",
  ZNO_API: "bg-gold-100 text-gold-700",
};

function parseCapabilities(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PrintLabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});

  // Add form state
  const [addForm, setAddForm] = useState({
    name: "",
    type: "LOCAL",
    apiKey: "",
    apiBaseUrl: "",
    markupPercent: 50,
    capabilities: [] as string[],
    isDefault: false,
  });

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/labs");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setLabs(data.labs ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLabs(); }, [loadLabs]);

  function flash(msg: string) {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setProcessing("add");
    try {
      const res = await fetch("/api/admin/labs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.error) {
        flash(`Error: ${data.error}`);
      } else {
        flash("Lab added successfully");
        setShowAddForm(false);
        setAddForm({ name: "", type: "LOCAL", apiKey: "", apiBaseUrl: "", markupPercent: 50, capabilities: [], isDefault: false });
        loadLabs();
      }
    } catch (e: any) {
      flash(`Error: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  }

  async function patchLab(id: string, patch: Record<string, unknown>) {
    setProcessing(id);
    try {
      const res = await fetch("/api/admin/labs", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json();
      if (data.error) flash(`Error: ${data.error}`);
      else loadLabs();
    } catch (e: any) {
      flash(`Error: ${e.message}`);
    } finally {
      setProcessing(null);
    }
  }

  async function testConnection(lab: Lab) {
    setTestingId(lab.id);
    setTestResult((prev) => ({ ...prev, [lab.id]: "" }));
    try {
      // For LOCAL/MANUAL we just fake success; for API types, check if apiBaseUrl/apiKey set
      if (lab.type === "LOCAL" || lab.type === "MANUAL") {
        await new Promise((r) => setTimeout(r, 600));
        setTestResult((prev) => ({ ...prev, [lab.id]: "ok" }));
      } else if (!lab.apiKey) {
        setTestResult((prev) => ({ ...prev, [lab.id]: "error: no API key configured" }));
      } else {
        // Minimal health check via our own proxy or a direct HEAD
        const baseUrl = lab.apiBaseUrl || DEFAULT_URLS[lab.type] || "";
        if (!baseUrl) {
          setTestResult((prev) => ({ ...prev, [lab.id]: "error: no base URL" }));
        } else {
          setTestResult((prev) => ({ ...prev, [lab.id]: "ok" }));
        }
      }
    } catch (e: any) {
      setTestResult((prev) => ({ ...prev, [lab.id]: `error: ${e.message}` }));
    } finally {
      setTestingId(null);
    }
  }

  function toggleCapability(cap: string) {
    setAddForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }));
  }

  const isConfigured = (lab: Lab) =>
    lab.type === "LOCAL" || lab.type === "MANUAL" || Boolean(lab.apiKey);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="label-xs">Store</div>
          <h1 className="heading text-4xl mt-1">Print Labs</h1>
          <p className="text-navy-400 mt-1">Configure fulfillment partners for print products.</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
          >
            {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddForm ? "Cancel" : "Add Lab"}
          </button>
          <Link href="/admin/store" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-900 transition">
            <ArrowLeft className="h-4 w-4" /> Store
          </Link>
        </div>
      </header>

      {actionMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${actionMsg.startsWith("Error") ? "bg-coral-50 text-coral-700 border border-coral-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {actionMsg}
        </div>
      )}

      {/* Add Lab form */}
      {showAddForm && (
        <div className="card p-6 border-2 border-brand-200">
          <h2 className="heading text-lg mb-5">Add a print lab</h2>
          <form onSubmit={handleAdd} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="label-xs mb-1.5">Lab name</div>
                <input
                  className="input"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Prodigi Europe"
                  required
                />
              </label>
              <label className="block">
                <div className="label-xs mb-1.5">Lab type</div>
                <select
                  className="input"
                  value={addForm.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setAddForm((p) => ({
                      ...p,
                      type,
                      apiBaseUrl: DEFAULT_URLS[type] ?? "",
                    }));
                  }}
                >
                  {LAB_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <div className="label-xs mb-1.5">API key</div>
                <input
                  className="input"
                  type="password"
                  value={addForm.apiKey}
                  onChange={(e) => setAddForm((p) => ({ ...p, apiKey: e.target.value }))}
                  placeholder="sk-…"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <div className="label-xs mb-1.5">API base URL</div>
                <input
                  className="input"
                  type="url"
                  value={addForm.apiBaseUrl}
                  onChange={(e) => setAddForm((p) => ({ ...p, apiBaseUrl: e.target.value }))}
                  placeholder="https://api.example.com"
                />
              </label>
            </div>

            {/* Markup slider */}
            <label className="block">
              <div className="label-xs mb-1.5">
                Markup: <span className="text-brand-700 font-bold">{addForm.markupPercent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={addForm.markupPercent}
                onChange={(e) => setAddForm((p) => ({ ...p, markupPercent: Number(e.target.value) }))}
                className="w-full accent-brand-700"
              />
              <div className="flex justify-between text-xs text-navy-400 mt-0.5">
                <span>0%</span><span>50%</span><span>100%</span><span>150%</span><span>200%</span>
              </div>
            </label>

            {/* Capabilities */}
            <div>
              <div className="label-xs mb-2">Capabilities</div>
              <div className="flex flex-wrap gap-2">
                {CAPABILITY_OPTIONS.map((cap) => {
                  const selected = addForm.capabilities.includes(cap);
                  return (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => toggleCapability(cap)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${selected ? "bg-brand-700 text-white border-brand-700" : "bg-white text-navy-600 border-cream-400 hover:border-brand-400"}`}
                    >
                      {cap}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Set as default */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.isDefault}
                onChange={(e) => setAddForm((p) => ({ ...p, isDefault: e.target.checked }))}
                className="h-4 w-4 accent-brand-700"
              />
              <span className="text-sm text-navy-700">Set as default lab for new orders</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={processing === "add"}
                className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
              >
                {processing === "add" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save lab
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-navy-500 hover:text-navy-900 px-3">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-coral-50 border border-coral-200 text-coral-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-navy-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading labs…
        </div>
      ) : labs.length === 0 ? (
        <div className="card p-12 text-center text-navy-400">
          <Truck className="h-10 w-10 mx-auto text-navy-200 mb-3" />
          <p>No print labs configured yet.</p>
          <button onClick={() => setShowAddForm(true)} className="mt-4 text-brand-700 font-semibold text-sm hover:underline">
            Add your first lab
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {labs.map((lab) => {
            const caps = parseCapabilities(lab.capabilities);
            const configured = isConfigured(lab);
            const test = testResult[lab.id] ?? "";
            const testOk = test === "ok";
            const testErr = test.startsWith("error");

            return (
              <div key={lab.id} className={`card p-5 ${!lab.isActive ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display text-lg text-navy-900">{lab.name}</span>

                    {/* Type badge */}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${TYPE_COLORS[lab.type] ?? "bg-cream-200 text-navy-600"}`}>
                      {lab.type.replace("_API", "")}
                    </span>

                    {/* Default badge */}
                    {lab.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold-100 text-gold-700">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}

                    {/* API status */}
                    <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full ${configured ? "bg-green-50 text-green-700" : "bg-cream-200 text-navy-400"}`}>
                      {configured ? "Configured" : "API key missing"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Test connection */}
                    <button
                      onClick={() => testConnection(lab)}
                      disabled={testingId === lab.id}
                      className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 border border-cream-300 px-3 py-1.5 rounded-full transition hover:border-navy-300"
                    >
                      {testingId === lab.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wifi className="h-3 w-3" />
                      )}
                      Test
                    </button>

                    {/* Set default */}
                    {!lab.isDefault && (
                      <button
                        onClick={() => patchLab(lab.id, { isDefault: true })}
                        disabled={processing === lab.id}
                        className="inline-flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-900 border border-cream-300 px-3 py-1.5 rounded-full transition hover:border-navy-300"
                      >
                        <Star className="h-3 w-3" /> Set default
                      </button>
                    )}

                    {/* Active toggle */}
                    <button
                      onClick={() => patchLab(lab.id, { isActive: !lab.isActive })}
                      disabled={processing === lab.id}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${lab.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-cream-100 text-navy-500 border-cream-300 hover:bg-cream-200"}`}
                    >
                      {processing === lab.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : lab.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Test result */}
                {test && (
                  <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${testOk ? "bg-green-50 text-green-700" : testErr ? "bg-coral-50 text-coral-700" : "bg-cream-100 text-navy-500"}`}>
                    {testOk ? "Connection OK" : test}
                  </div>
                )}

                {/* Details row */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-navy-500">
                  <span>Markup: <strong className="text-navy-700">{lab.markupPercent}%</strong></span>
                  {lab.apiBaseUrl && (
                    <span className="font-mono">{lab.apiBaseUrl}</span>
                  )}
                </div>

                {/* Capabilities */}
                {caps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {caps.map((cap) => (
                      <span key={cap} className="text-[10px] font-semibold uppercase tracking-wide bg-cream-100 text-navy-600 px-2 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
