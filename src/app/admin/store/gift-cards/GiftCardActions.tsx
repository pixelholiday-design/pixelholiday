"use client";

import { useState } from "react";
import { Gift, Search, XCircle } from "lucide-react";

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  currency: string;
  type: string;
  purchasedBy: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

interface Props {
  cards: GiftCard[];
  typeColors: Record<string, string>;
}

export default function GiftCardActions({ cards: initialCards, typeColors }: Props) {
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const filtered = search.trim()
    ? cards.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : cards;

  async function handleDeactivate(code: string) {
    if (!confirm(`Deactivate gift card ${code}? This cannot be undone.`)) return;
    setDeactivating(code);
    try {
      const res = await fetch("/api/gift-cards/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) => (c.code === code ? { ...c, isActive: false } : c)),
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to deactivate");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value.toUpperCase())}
            placeholder="Search by code..."
            className="w-full pl-10 pr-4 py-2.5 border border-cream-300 rounded-xl text-navy-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/40 uppercase"
          />
        </div>
        <div className="text-sm text-navy-500">
          {filtered.length} card{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg">All gift cards</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Gift className="h-8 w-8 text-coral-500 mx-auto mb-3" />
            <div className="font-display text-xl text-navy-900">No gift cards found</div>
            <div className="text-sm text-navy-400 mt-1">
              {search ? "Try a different search term." : "Create your first gift card via the API or shop page."}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Balance</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Purchased by</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Expires</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/70">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-100/60">
                    <td className="px-6 py-3 font-mono font-semibold text-navy-900">{c.code}</td>
                    <td className="px-6 py-3 text-navy-700">
                      {c.currency} {c.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 font-semibold text-navy-900">
                      {c.currency} {c.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          typeColors[c.type] ?? "bg-cream-200 text-navy-500"
                        }`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full text-xs font-semibold px-2.5 py-1 ${
                          c.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-cream-200 text-navy-500"
                        }`}
                      >
                        {c.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-navy-600 text-xs">
                      {c.purchasedBy || "—"}
                    </td>
                    <td className="px-6 py-3 text-xs text-navy-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-xs text-navy-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-3">
                      {c.isActive && (
                        <button
                          onClick={() => handleDeactivate(c.code)}
                          disabled={deactivating === c.code}
                          className="text-coral-600 hover:text-coral-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                          title="Deactivate"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {deactivating === c.code ? "..." : "Deactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
