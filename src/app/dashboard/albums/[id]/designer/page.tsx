"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Save, Layout, Image as ImageIcon, GripVertical } from "lucide-react";
import Link from "next/link";

type Spread = {
  id?: string;
  layout: string;
  photoIds: string[];
  order: number;
};

type Album = {
  id: string;
  name: string;
  template: string;
  status: string;
  spreads: Spread[];
};

const LAYOUTS = [
  { id: "single", label: "Single Photo", slots: 1 },
  { id: "two-col", label: "Two Column", slots: 2 },
  { id: "three-col", label: "Three Column", slots: 3 },
  { id: "hero-left", label: "Hero Left", slots: 2 },
  { id: "hero-right", label: "Hero Right", slots: 2 },
  { id: "grid-4", label: "Grid (4)", slots: 4 },
  { id: "full-bleed", label: "Full Bleed", slots: 1 },
];

export default function AlbumDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const [album, setAlbum] = useState<Album | null>(null);
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/dashboard/albums/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.album) {
          setAlbum(d.album);
          setSpreads(d.album.spreads || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  function addSpread(layout: string) {
    setSpreads([...spreads, { layout, photoIds: [], order: spreads.length }]);
  }

  function removeSpread(idx: number) {
    setSpreads(spreads.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i })));
  }

  function moveSpread(idx: number, dir: -1 | 1) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= spreads.length) return;
    const arr = [...spreads];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setSpreads(arr.map((s, i) => ({ ...s, order: i })));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/dashboard/albums/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreads }),
      });
      if (res.ok) setMessage("Saved!");
      else setMessage("Save failed");
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded w-1/3" />
          <div className="h-96 bg-cream-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 text-center">
        <p className="text-navy-500">Album not found</p>
        <Link href="/dashboard/albums" className="text-brand-600 text-sm mt-2 inline-block">Back to albums</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/albums" className="p-2 text-navy-400 hover:text-navy-600 rounded-lg hover:bg-cream-50">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">{album.name}</h1>
            <p className="text-navy-500 text-sm">{album.template} template — {spreads.length} spreads</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-green-600">{message}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Spread list */}
      <div className="space-y-4 mb-8">
        {spreads.map((spread, idx) => {
          const layoutInfo = LAYOUTS.find((l) => l.id === spread.layout) || LAYOUTS[0];
          return (
            <div key={idx} className="bg-white rounded-xl border border-cream-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveSpread(idx, -1)} className="p-0.5 text-navy-300 hover:text-navy-600" disabled={idx === 0}>
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm font-medium text-navy-600">
                    Spread {idx + 1} — <span className="text-navy-400">{layoutInfo.label}</span>
                  </span>
                </div>
                <button onClick={() => removeSpread(idx)} className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {/* Photo slots */}
              <div className={`grid gap-3 ${
                layoutInfo.slots === 1 ? "grid-cols-1" :
                layoutInfo.slots === 2 ? "grid-cols-2" :
                layoutInfo.slots === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
              }`}>
                {Array.from({ length: layoutInfo.slots }).map((_, slotIdx) => (
                  <div
                    key={slotIdx}
                    className="aspect-[4/3] bg-cream-100 rounded-lg border-2 border-dashed border-cream-300 flex items-center justify-center"
                  >
                    {spread.photoIds[slotIdx] ? (
                      <span className="text-xs text-navy-500 truncate px-2">{spread.photoIds[slotIdx]}</span>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 text-navy-300 mx-auto mb-1" />
                        <span className="text-xs text-navy-400">Drop photo</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add spread */}
      <div className="bg-cream-50 rounded-xl border border-cream-200 p-6">
        <h3 className="font-medium text-navy-700 mb-3 flex items-center gap-2">
          <Layout className="h-4 w-4" /> Add Spread
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              onClick={() => addSpread(layout.id)}
              className="p-3 bg-white rounded-lg border border-cream-200 hover:border-brand-400 hover:shadow-sm transition-all text-center"
            >
              <div className="text-sm font-medium text-navy-700">{layout.label}</div>
              <div className="text-xs text-navy-400">{layout.slots} photo{layout.slots > 1 ? "s" : ""}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
