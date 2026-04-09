"use client";
import { useState } from "react";
import { Plus, Power, X } from "lucide-react";

export type AdminMagicElement = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  type: string;
  category: string | null;
  position: string | null;
  assetUrl: string;
  isActive: boolean;
  usageCount: number;
};

const TYPE_OPTIONS = [
  "AR_OVERLAY",
  "GRAPHIC_OVERLAY",
  "THREE_D_CHARACTER",
  "BACKGROUND_REPLACE",
];
const CATEGORY_OPTIONS = ["FACE_OVERLAY", "BACKGROUND", "FRAME", "EFFECT"];
const POSITION_OPTIONS = ["TOP", "CENTER", "FACE", "BORDER", "SCATTER"];

export default function MagicElementsClient({
  elements: initial,
}: {
  elements: AdminMagicElement[];
}) {
  const [elements, setElements] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function toggleActive(id: string, current: boolean) {
    setBusy(id);
    try {
      const r = await fetch(`/api/admin/magic-elements/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      const data = await r.json();
      if (r.ok) {
        setElements((prev) => prev.map((e) => (e.id === id ? { ...e, isActive: !current } : e)));
      } else {
        alert(data.error || "Failed to update");
      }
    } finally {
      setBusy(null);
    }
  }

  async function addElement(form: FormData) {
    const payload = {
      name: form.get("name"),
      type: form.get("type"),
      category: form.get("category"),
      position: form.get("position"),
      assetUrl: form.get("assetUrl"),
      description: form.get("description"),
    };
    const r = await fetch("/api/admin/magic-elements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (r.ok && data.element) {
      setElements((prev) => [{ ...data.element, usageCount: 0 }, ...prev]);
      setShowAdd(false);
    } else {
      alert(data.error || "Failed to create");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdd(true)}
          className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 transition"
        >
          <Plus className="h-4 w-4" /> Add element
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {elements.map((e) => (
          <div
            key={e.id}
            className={`bg-white rounded-2xl ring-1 ring-cream-300 shadow-card overflow-hidden transition ${
              e.isActive ? "" : "opacity-60"
            }`}
          >
            <div className="aspect-square bg-gradient-to-br from-brand-100 via-cream-100 to-coral-100 flex items-center justify-center p-6 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.assetUrl} alt={e.name} className="max-w-full max-h-full" />
              {!e.isActive && (
                <span className="absolute top-2 left-2 bg-navy-900 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full">
                  Disabled
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg text-navy-900 leading-tight">{e.name}</div>
                  <div className="text-xs text-navy-400 mt-0.5">
                    {e.category || "—"} · {e.position || "—"}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(e.id, e.isActive)}
                  disabled={busy === e.id}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition shrink-0 ${
                    e.isActive
                      ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      : "bg-cream-200 text-navy-400 hover:bg-cream-300"
                  }`}
                  title={e.isActive ? "Disable" : "Enable"}
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>
              {e.description && (
                <p className="text-navy-500 text-xs mt-2 leading-snug">{e.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-300 text-xs">
                <span className="text-navy-400">{e.type}</span>
                <span className="text-brand-700 font-semibold">{e.usageCount} uses</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-navy-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addElement(new FormData(e.currentTarget));
            }}
            className="bg-white rounded-2xl shadow-lift max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl text-navy-900">Add magic element</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="h-9 w-9 rounded-full hover:bg-cream-200 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              name="name"
              required
              placeholder="Name (e.g. Pirate Hat)"
              className="w-full bg-cream-100 border border-cream-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <textarea
              name="description"
              placeholder="Short description"
              rows={2}
              className="w-full bg-cream-100 border border-cream-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                name="type"
                required
                className="bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                name="category"
                className="bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select
                name="position"
                className="bg-cream-100 border border-cream-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {POSITION_OPTIONS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <input
              name="assetUrl"
              required
              placeholder="Asset URL (https:// or data:image/svg+xml;base64,…)"
              className="w-full bg-cream-100 border border-cream-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-xl py-3 transition"
            >
              Save element
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
