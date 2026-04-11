"use client";
import { useEffect, useState } from "react";
import { DollarSign, Percent, Save, RefreshCw } from "lucide-react";

type PriceSheetItem = {
  id: string;
  productKey: string;
  name: string;
  category: string;
  labCost: number;
  markup: number;
  retailPrice: number;
  isActive: boolean;
};

export default function PriceSheetsPage() {
  const [items, setItems] = useState<PriceSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkMarkup, setBulkMarkup] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/store/price-sheet")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const applyBulkMarkup = () => {
    const pct = parseFloat(bulkMarkup);
    if (isNaN(pct) || pct <= 0) return;
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        markup: pct,
        retailPrice: Math.round(item.labCost * (1 + pct / 100) * 100) / 100,
      }))
    );
  };

  const updateItemMarkup = (id: string, markup: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              markup,
              retailPrice:
                Math.round(item.labCost * (1 + markup / 100) * 100) / 100,
            }
          : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/dashboard/store/price-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
    } catch {
      // handled silently
    }
    setSaving(false);
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-teal-600" />
            Price Sheets
          </h1>
          <p className="text-gray-500 mt-1">
            Set your markup on each product. Lab cost + your markup = client
            price.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Prices
        </button>
      </div>

      {/* Bulk markup tool */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center gap-4">
        <Percent className="w-5 h-5 text-teal-600" />
        <span className="text-sm font-medium text-teal-800">Bulk Markup:</span>
        <input
          type="number"
          value={bulkMarkup}
          onChange={(e) => setBulkMarkup(e.target.value)}
          placeholder="e.g. 150"
          className="w-24 px-3 py-1.5 border border-teal-300 rounded-lg text-sm"
        />
        <span className="text-sm text-teal-700">%</span>
        <button
          onClick={applyBulkMarkup}
          className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700"
        >
          Apply to All
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          Loading price sheet...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No products configured yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Products will appear here once your store is set up.
          </p>
        </div>
      ) : (
        categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
              {cat.replace(/_/g, " ")}
            </h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-right px-4 py-3">Lab Cost</th>
                    <th className="text-right px-4 py-3">Markup %</th>
                    <th className="text-right px-4 py-3">Client Price</th>
                    <th className="text-right px-4 py-3">Your Profit</th>
                    <th className="text-center px-4 py-3">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items
                    .filter((i) => i.category === cat)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          &euro;{item.labCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={item.markup}
                            onChange={(e) =>
                              updateItemMarkup(
                                item.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-right text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          &euro;{item.retailPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-teal-600 font-medium">
                          &euro;
                          {(item.retailPrice - item.labCost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${item.isActive ? "bg-green-500" : "bg-gray-300"}`}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
