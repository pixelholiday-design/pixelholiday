"use client";
import { useEffect, useState } from "react";
import { Save, History, Tag, Loader2, Star, EyeOff } from "lucide-react";

type Price = {
  id: string;
  productKey: string;
  name: string;
  price: number;
  currency: string;
  isAnchor?: boolean;
  isHidden?: boolean;
  displayOrder?: number;
};
type Hist = { id: string; productKey: string; oldPrice: number; newPrice: number; changedBy: string | null; createdAt: string };

export default function PricingPage() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [history, setHistory] = useState<Hist[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/pricing").then((r) => r.json());
    setPrices(r.prices || []);
    setHistory(r.history || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(productKey: string) {
    const v = parseFloat(drafts[productKey]);
    if (!Number.isFinite(v) || v <= 0) return;
    setSaving(productKey);
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey, price: v }),
    });
    setSaving(null);
    setDrafts((d) => { const n = { ...d }; delete n[productKey]; return n; });
    load();
  }

  async function toggleFlag(productKey: string, flag: "isAnchor" | "isHidden", value: boolean) {
    setSaving(productKey);
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey, [flag]: value }),
    });
    setSaving(null);
    load();
  }

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Business</div>
        <h1 className="heading text-4xl mt-1">Pricing</h1>
        <p className="text-navy-400 mt-1">All checkout flows read from these values. Changes apply immediately.</p>
      </header>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70 flex items-center gap-2">
          <Tag className="h-4 w-4 text-coral-500" />
          <h2 className="heading text-lg">Catalogue</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center text-navy-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Key</th>
                <th className="px-6 py-3">Current</th>
                <th className="px-6 py-3">New price</th>
                <th className="px-6 py-3 text-center" title="Anchor product — shown first on kiosk">Anchor</th>
                <th className="px-6 py-3 text-center" title="Hidden from kiosk — staff offers verbally">Hidden</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300/70">
              {prices.map((p) => (
                <tr key={p.id} className={`hover:bg-cream-100/60 ${p.isAnchor ? "bg-gold-500/5" : ""}`}>
                  <td className="px-6 py-3 font-medium text-navy-900">
                    {p.name}
                    {p.isAnchor && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-600"><Star className="h-3 w-3" />Anchor</span>}
                    {p.isHidden && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-navy-800/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-700"><EyeOff className="h-3 w-3" />Hidden</span>}
                  </td>
                  <td className="px-6 py-3 text-navy-400 font-mono text-xs">{p.productKey}</td>
                  <td className="px-6 py-3 text-navy-600">€{p.price.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="input w-28"
                      placeholder={p.price.toFixed(2)}
                      value={drafts[p.productKey] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [p.productKey]: e.target.value }))}
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!p.isAnchor}
                      disabled={saving === p.productKey}
                      onChange={(e) => toggleFlag(p.productKey, "isAnchor", e.target.checked)}
                      className="h-4 w-4 accent-gold-500"
                    />
                  </td>
                  <td className="px-6 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={!!p.isHidden}
                      disabled={saving === p.productKey}
                      onChange={(e) => toggleFlag(p.productKey, "isHidden", e.target.checked)}
                      className="h-4 w-4 accent-navy-700"
                    />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => save(p.productKey)}
                      disabled={saving === p.productKey || !drafts[p.productKey]}
                      className="btn-primary !py-2 !px-3 text-xs"
                    >
                      {saving === p.productKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b border-cream-300/70 flex items-center gap-2">
          <History className="h-4 w-4 text-coral-500" />
          <h2 className="heading text-lg">Recent changes</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-navy-400 text-sm">No price changes yet.</div>
        ) : (
          <ul className="divide-y divide-cream-300/70">
            {history.map((h) => (
              <li key={h.id} className="px-6 py-3 text-sm flex items-center justify-between">
                <span>
                  <span className="font-mono text-xs text-navy-400">{h.productKey}</span>{" "}
                  <span className="text-navy-600">
                    €{h.oldPrice.toFixed(2)} → <strong className="text-navy-900">€{h.newPrice.toFixed(2)}</strong>
                  </span>
                </span>
                <span className="text-xs text-navy-400">
                  {h.changedBy || "—"} · {new Date(h.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
