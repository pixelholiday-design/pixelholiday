"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, X, Star, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";

type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string | null;
  costPrice: number;
  retailPrice: number;
  fulfillmentType: string;
  labProductId?: string | null;
  labName?: string | null;
  turnaround?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type SortKey = "name" | "category" | "retailPrice" | "costPrice" | "margin";
type SortDir = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ShopProduct>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  async function syncProducts() {
    setSyncing(true);
    setSaveMsg(null);
    try {
      const r = await fetch("/api/admin/store/sync-products", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setSaveMsg(`Synced! Prodigi: ${d.synced.prodigi} products, Printful: ${d.synced.printful} products. Total catalog: ${d.totalProducts}`);
        load();
      } else {
        setSaveMsg(d.error || "Sync failed");
      }
    } catch (e: any) {
      setSaveMsg(e.message || "Sync error");
    } finally {
      setSyncing(false);
    }
  }

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  function getMargin(p: ShopProduct) {
    if (p.retailPrice <= 0) return 0;
    return Math.round(((p.retailPrice - p.costPrice) / p.retailPrice) * 100);
  }

  const sorted = [...products].sort((a, b) => {
    let av: number | string = "";
    let bv: number | string = "";
    if (sortKey === "name") { av = a.name; bv = b.name; }
    else if (sortKey === "category") { av = a.category; bv = b.category; }
    else if (sortKey === "retailPrice") { av = a.retailPrice; bv = b.retailPrice; }
    else if (sortKey === "costPrice") { av = a.costPrice; bv = b.costPrice; }
    else if (sortKey === "margin") { av = getMargin(a); bv = getMargin(b); }
    if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
    return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function startEdit(p: ShopProduct) {
    setEditingId(p.id);
    setEditValues({ retailPrice: p.retailPrice, costPrice: p.costPrice, turnaround: p.turnaround });
  }
  function cancelEdit() { setEditingId(null); setEditValues({}); }

  async function saveEdit(p: ShopProduct) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shop-products/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(editValues),
      });
      if (res.ok) {
        setSaveMsg("Saved!");
        setTimeout(() => setSaveMsg(null), 2000);
        setEditingId(null);
        load();
      } else {
        const d = await res.json().catch(() => ({}));
        setSaveMsg(d.error || "Save failed");
      }
    } catch (e: any) {
      setSaveMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleField(p: ShopProduct, field: "isActive" | "isFeatured") {
    try {
      await fetch(`/api/admin/shop-products/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: !p[field] }),
      });
      load();
    } catch {}
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? <span> ↑</span> : <span> ↓</span>) : null;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="label-xs">Store</div>
          <h1 className="heading text-4xl mt-1">Products</h1>
          <p className="text-navy-400 mt-1">Manage your product catalog — prices, availability, featured status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={syncProducts}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Prodigi & Printful"}
          </button>
          <Link href="/admin/store" className="inline-flex items-center gap-1 text-sm text-navy-500 hover:text-navy-900 transition">
            <ArrowLeft className="h-4 w-4" /> Store overview
          </Link>
        </div>
      </header>

      {saveMsg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${saveMsg === "Saved!" ? "bg-green-50 text-green-700 border border-green-200" : "bg-coral-50 text-coral-700 border border-coral-200"}`}>
          {saveMsg}
        </div>
      )}

      {error && (
        <div className="bg-coral-50 border border-coral-200 text-coral-700 rounded-xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-navy-400">
          <Loader2 className="h-6 w-6 animate-spin mr-3" /> Loading products…
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-cream-100 text-navy-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">
                  <button onClick={() => toggleSort("name")} className="hover:text-navy-900 font-semibold">
                    Name <SortIcon k="name" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">
                  <button onClick={() => toggleSort("category")} className="hover:text-navy-900 font-semibold">
                    Category <SortIcon k="category" />
                  </button>
                </th>
                <th className="text-left px-5 py-3">Fulfillment</th>
                <th className="text-left px-5 py-3">Lab</th>
                <th className="text-right px-5 py-3">
                  <button onClick={() => toggleSort("costPrice")} className="hover:text-navy-900 font-semibold">
                    Cost <SortIcon k="costPrice" />
                  </button>
                </th>
                <th className="text-right px-5 py-3">
                  <button onClick={() => toggleSort("retailPrice")} className="hover:text-navy-900 font-semibold">
                    Retail <SortIcon k="retailPrice" />
                  </button>
                </th>
                <th className="text-right px-5 py-3">
                  <button onClick={() => toggleSort("margin")} className="hover:text-navy-900 font-semibold">
                    Margin <SortIcon k="margin" />
                  </button>
                </th>
                <th className="text-center px-5 py-3">Active</th>
                <th className="text-center px-5 py-3">Featured</th>
                <th className="text-center px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-300">
              {sorted.map((p) => {
                const margin = getMargin(p);
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className={`hover:bg-cream-50 ${!p.isActive ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3 text-navy-900 font-medium">
                      <div>{p.name}</div>
                      <div className="text-xs text-navy-400">{p.productKey}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy-500 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${
                        p.fulfillmentType === "DIGITAL" ? "bg-blue-50 text-blue-700" :
                        p.fulfillmentType === "AUTO" ? "bg-green-50 text-green-700" :
                        "bg-gold-50 text-gold-700"
                      }`}>
                        {p.fulfillmentType}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {p.labName ? (
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          p.labName === "PRODIGI" ? "bg-purple-50 text-purple-700" :
                          p.labName === "PRINTFUL" ? "bg-pink-50 text-pink-700" :
                          "bg-cream-200 text-navy-500"
                        }`}>
                          {p.labName}
                        </span>
                      ) : (
                        <span className="text-navy-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-navy-600">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editValues.costPrice ?? p.costPrice}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-20 rounded border border-cream-400 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      ) : (
                        `€${p.costPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-navy-900">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editValues.retailPrice ?? p.retailPrice}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, retailPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-20 rounded border border-brand-400 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      ) : (
                        `€${p.retailPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${margin >= 50 ? "text-green-700" : margin >= 30 ? "text-gold-600" : "text-coral-600"}`}>
                        {margin}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleField(p, "isActive")} className="text-navy-400 hover:text-brand-700 transition">
                        {p.isActive ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleField(p, "isFeatured")} className="transition">
                        <Star className={`h-4 w-4 ${p.isFeatured ? "fill-gold-500 text-gold-500" : "text-navy-300 hover:text-gold-400"}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {isEditing ? (
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => saveEdit(p)}
                            disabled={saving}
                            className="h-7 w-7 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition"
                          >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="h-7 w-7 rounded-full bg-cream-200 hover:bg-cream-300 text-navy-600 flex items-center justify-center transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(p)}
                          className="text-xs font-semibold text-brand-700 hover:text-brand-900 transition"
                        >
                          Edit price
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-navy-400">
                    No products found. Add products via the Prisma seed or database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
