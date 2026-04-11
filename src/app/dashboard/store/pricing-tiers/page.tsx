"use client";

import { useEffect, useState } from "react";
import { Layers, Plus, Trash2, Save, DollarSign } from "lucide-react";

type Tier = {
  id?: string;
  minQuantity: number;
  maxQuantity: number | null;
  pricePerUnit: number;
};

type PriceSheet = {
  id: string;
  name: string;
};

export default function PricingTiersPage() {
  const [sheets, setSheets] = useState<PriceSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/store/pricing-tiers")
      .then((r) => r.json())
      .then((d) => {
        setSheets(d.priceSheets || []);
        if (d.priceSheets?.[0]) {
          setSelectedSheet(d.priceSheets[0].id);
          setTiers(d.tiers?.[d.priceSheets[0].id] || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function selectSheet(id: string) {
    setSelectedSheet(id);
    fetch(`/api/dashboard/store/pricing-tiers?sheetId=${id}`)
      .then((r) => r.json())
      .then((d) => setTiers(d.tiers || []))
      .catch(() => {});
  }

  function addTier() {
    const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].maxQuantity || tiers[tiers.length - 1].minQuantity) + 1 : 1;
    setTiers([...tiers, { minQuantity: lastMax, maxQuantity: null, pricePerUnit: 0 }]);
  }

  function removeTier(idx: number) {
    setTiers(tiers.filter((_, i) => i !== idx));
  }

  function updateTier(idx: number, field: keyof Tier, val: number | null) {
    setTiers(tiers.map((t, i) => (i === idx ? { ...t, [field]: val } : t)));
  }

  async function saveTiers() {
    if (!selectedSheet) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/store/pricing-tiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceSheetId: selectedSheet, tiers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setTiers(data.tiers || tiers);
      setMessage("Pricing tiers saved successfully!");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded w-1/3" />
          <div className="h-40 bg-cream-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Volume Pricing</h1>
            <p className="text-navy-500 text-sm">Set quantity-based pricing tiers</p>
          </div>
        </div>
        <button
          onClick={saveTiers}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Tiers"}
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {sheets.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm text-navy-600 mb-1">Price Sheet</label>
          <select
            value={selectedSheet}
            onChange={(e) => selectSheet(e.target.value)}
            className="px-3 py-2 rounded-lg border border-cream-300 text-sm"
          >
            {sheets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl border border-cream-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-cream-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase">Min Qty</th>
              <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase">Max Qty</th>
              <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase">Price / Unit</th>
              <th className="px-4 py-3 text-xs font-semibold text-navy-600 uppercase w-16"></th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, idx) => (
              <tr key={idx} className="border-t border-cream-100">
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={1}
                    value={tier.minQuantity}
                    onChange={(e) => updateTier(idx, "minQuantity", parseInt(e.target.value) || 1)}
                    className="w-24 px-2 py-1.5 rounded border border-cream-300 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min={tier.minQuantity}
                    value={tier.maxQuantity ?? ""}
                    placeholder="Unlimited"
                    onChange={(e) => updateTier(idx, "maxQuantity", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-24 px-2 py-1.5 rounded border border-cream-300 text-sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-navy-400" />
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tier.pricePerUnit}
                      onChange={(e) => updateTier(idx, "pricePerUnit", parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1.5 rounded border border-cream-300 text-sm"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => removeTier(idx)} className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-cream-100">
          <button onClick={addTier} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium">
            <Plus className="h-4 w-4" /> Add Tier
          </button>
        </div>
      </div>
    </div>
  );
}
