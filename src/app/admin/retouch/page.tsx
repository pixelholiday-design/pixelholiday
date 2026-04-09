"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Wand2, Sun, Contrast, Droplets, Palette, Eye, Sparkles, ChevronLeft,
  ChevronRight, Check, Loader2, Image as ImageIcon, Layers, SlidersHorizontal, Download,
} from "lucide-react";
import { cleanUrl, watermarkedUrl, photoRef } from "@/lib/cloudinary";

type Gallery = { id: string; magicLinkToken: string; totalCount: number; customer: { name: string | null } };
type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isRetouched: boolean;
  isHookImage: boolean;
};

const PRESETS = [
  { id: "auto", label: "Auto Enhance", icon: Wand2, color: "text-coral-500" },
  { id: "warm", label: "Warm", icon: Sun, color: "text-amber-500" },
  { id: "cool", label: "Cool", icon: Droplets, color: "text-brand-400" },
  { id: "vibrant", label: "Vibrant", icon: Palette, color: "text-purple-500" },
  { id: "bw", label: "B&W", icon: Contrast, color: "text-navy-500" },
];

export default function RetouchPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleryId, setGalleryId] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Retouch state
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [skinSmooth, setSkinSmooth] = useState(false);
  const [bgBlur, setBgBlur] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [beforeAfter, setBeforeAfter] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState<Set<string>>(new Set());

  // Load galleries list
  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.galleries) setGalleries(d.galleries);
        else if (d.recentGalleries) setGalleries(d.recentGalleries);
      })
      .catch(() => {});
  }, []);

  // Load photos when gallery selected
  const loadPhotos = useCallback(async (gid: string) => {
    setLoading(true);
    setPhotos([]);
    setSelectedIdx(-1);
    try {
      const r = await fetch(`/api/gallery/${gid}/photos`).then((res) => res.json());
      setPhotos(r.photos || []);
    } catch {
      // Try alternate endpoint
      try {
        const r = await fetch(`/api/admin/gallery/${gid}`).then((res) => res.json());
        setPhotos(r.photos || []);
      } catch {}
    }
    setLoading(false);
  }, []);

  function resetAdjustments() {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setSkinSmooth(false);
    setBgBlur(false);
    setActivePreset(null);
    setBeforeAfter(false);
    setSaved(false);
  }

  function applyPreset(presetId: string) {
    setActivePreset(presetId);
    setSaved(false);
    switch (presetId) {
      case "auto": setBrightness(10); setContrast(15); setSaturation(10); break;
      case "warm": setBrightness(15); setContrast(5); setSaturation(20); break;
      case "cool": setBrightness(-5); setContrast(10); setSaturation(-10); break;
      case "vibrant": setBrightness(5); setContrast(20); setSaturation(40); break;
      case "bw": setBrightness(10); setContrast(30); setSaturation(-100); break;
    }
  }

  async function save(andNext = false) {
    setSaving(true);
    const ids = batchMode ? Array.from(batchSelected) : selectedIdx >= 0 ? [photos[selectedIdx].id] : [];
    if (!ids.length) { setSaving(false); return; }

    await fetch("/api/admin/retouch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        photoIds: ids,
        preset: activePreset || "custom",
        adjustments: { brightness, contrast, saturation, skinSmooth, bgBlur },
      }),
    });

    // Mark as retouched locally
    setPhotos((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, isRetouched: true } : p));
    setSaving(false);
    setSaved(true);

    if (andNext && selectedIdx < photos.length - 1) {
      setSelectedIdx(selectedIdx + 1);
      resetAdjustments();
    }
  }

  const selected = selectedIdx >= 0 ? photos[selectedIdx] : null;

  // CSS filter string for preview
  const filterStr = `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100}) saturate(${1 + saturation / 100})${bgBlur ? " blur(0px)" : ""}`;

  return (
    <div className="space-y-6">
      <header>
        <div className="label-xs">Module 13</div>
        <h1 className="heading text-4xl mt-1">Pro Retouch Studio</h1>
        <p className="text-navy-400 mt-1">AI-assisted photo retouching with batch processing.</p>
      </header>

      {/* Gallery picker */}
      <div className="flex items-center gap-4">
        <label className="flex-1">
          <div className="label-xs mb-1.5">Gallery</div>
          <select
            className="input"
            value={galleryId}
            onChange={(e) => {
              setGalleryId(e.target.value);
              if (e.target.value) loadPhotos(e.target.value);
            }}
          >
            <option value="">Select a gallery...</option>
            {galleries.map((g) => (
              <option key={g.id} value={g.id}>
                {g.customer?.name || "Guest"} — {g.totalCount || "?"} photos
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 mt-6">
          <input type="checkbox" checked={batchMode} onChange={(e) => setBatchMode(e.target.checked)} className="accent-coral-500" />
          <span className="text-sm text-navy-600"><Layers className="h-4 w-4 inline" /> Batch</span>
        </label>
      </div>

      {loading && (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-coral-500" /></div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && !selected && (
        <div className="card p-4">
          <div className="label-xs mb-3">Photos ({photos.length})</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  if (batchMode) {
                    setBatchSelected((prev) => {
                      const next = new Set(prev);
                      next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                      return next;
                    });
                  } else {
                    setSelectedIdx(i);
                    resetAdjustments();
                  }
                }}
                className={`relative aspect-square rounded-xl overflow-hidden bg-cream-200 ring-2 transition ${
                  batchMode && batchSelected.has(p.id) ? "ring-coral-500" : selectedIdx === i ? "ring-coral-500" : "ring-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {photoRef(p) ? (
                  <img
                    src={watermarkedUrl(photoRef(p), 300)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cream-200 to-cream-300 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-navy-300" />
                  </div>
                )}
                {p.isRetouched && (
                  <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                {p.isHookImage && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gold-500 rounded text-[8px] font-bold text-white">HOOK</div>
                )}
              </button>
            ))}
          </div>
          {batchMode && batchSelected.size > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-navy-600">{batchSelected.size} selected</span>
              <div className="flex gap-2">
                {PRESETS.map((p) => (
                  <button key={p.id} onClick={() => applyPreset(p.id)} className="btn-ghost text-xs !px-2 !py-1">
                    <p.icon className={`h-3 w-3 ${p.color}`} /> {p.label}
                  </button>
                ))}
              </div>
              <button onClick={() => save()} disabled={saving} className="btn-primary ml-auto text-xs">
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                Apply to {batchSelected.size}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Retouch editor */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Preview */}
          <div className="card overflow-hidden">
            <div className="relative bg-navy-900" style={{ minHeight: 400 }}>
              {beforeAfter ? (
                <div className="flex h-full min-h-[400px]">
                  <div className="flex-1 relative overflow-hidden border-r-2 border-white">
                    {photoRef(selected) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cleanUrl(photoRef(selected), 1200)} alt="Before" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cream-200">
                        <ImageIcon className="h-12 w-12 text-navy-300 mx-auto" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-navy-900/70 text-white text-xs font-semibold px-2 py-0.5 rounded">Before</div>
                  </div>
                  <div className="flex-1 relative overflow-hidden" style={{ filter: filterStr }}>
                    {photoRef(selected) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cleanUrl(photoRef(selected), 1200)} alt="After" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cream-200">
                        <ImageIcon className="h-12 w-12 text-navy-300 mx-auto" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-navy-900/70 text-white text-xs font-semibold px-2 py-0.5 rounded">After</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] bg-navy-900" style={{ filter: filterStr }}>
                  {photoRef(selected) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cleanUrl(photoRef(selected), 1600)} alt="" className="max-w-full max-h-[600px] object-contain" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-navy-300 mx-auto" />
                      <div className="text-xs text-navy-400 mt-2 font-mono">{selected.id.slice(0, 12)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Navigation */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-cream-300/70">
              <button
                onClick={() => { setSelectedIdx(Math.max(0, selectedIdx - 1)); resetAdjustments(); }}
                disabled={selectedIdx === 0}
                className="btn-ghost"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-sm text-navy-400">{selectedIdx + 1} / {photos.length}</span>
              <button
                onClick={() => { setSelectedIdx(Math.min(photos.length - 1, selectedIdx + 1)); resetAdjustments(); }}
                disabled={selectedIdx === photos.length - 1}
                className="btn-ghost"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tool panel */}
          <div className="space-y-4">
            {/* Presets */}
            <div className="card p-4 space-y-3">
              <div className="label-xs">Presets</div>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition border ${
                      activePreset === p.id ? "bg-coral-50 border-coral-200 text-coral-700" : "bg-white border-cream-300 text-navy-700 hover:bg-cream-100"
                    }`}
                  >
                    <p.icon className={`h-4 w-4 ${p.color}`} /> {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="card p-4 space-y-4">
              <div className="label-xs flex items-center gap-1"><SlidersHorizontal className="h-3 w-3" /> Adjustments</div>
              <Slider label="Brightness" value={brightness} onChange={(v) => { setBrightness(v); setSaved(false); }} icon={Sun} />
              <Slider label="Contrast" value={contrast} onChange={(v) => { setContrast(v); setSaved(false); }} icon={Contrast} />
              <Slider label="Saturation" value={saturation} onChange={(v) => { setSaturation(v); setSaved(false); }} icon={Droplets} />
            </div>

            {/* Toggles */}
            <div className="card p-4 space-y-3">
              <Toggle label="Skin Smooth" checked={skinSmooth} onChange={(v) => { setSkinSmooth(v); setSaved(false); }} icon={Eye} />
              <Toggle label="Background Blur" checked={bgBlur} onChange={(v) => { setBgBlur(v); setSaved(false); }} icon={Sparkles} />
              <Toggle label="Before / After" checked={beforeAfter} onChange={setBeforeAfter} icon={Layers} />
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button onClick={() => save(false)} disabled={saving} className="btn-primary w-full !py-3">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                {saved ? "Saved!" : "Save"}
              </button>
              <button onClick={() => save(true)} disabled={saving || selectedIdx >= photos.length - 1} className="btn-secondary w-full !py-3">
                Save & Next
              </button>
              {selected && photoRef(selected) && (
                <a
                  href={cleanUrl(photoRef(selected), 3000)}
                  download={`retouched-${selected.id.slice(0, 8)}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full !py-3 inline-flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download photo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, onChange, icon: Icon }: { label: string; value: number; onChange: (v: number) => void; icon: any }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-sm text-navy-700">
          <Icon className="h-3.5 w-3.5 text-navy-400" /> {label}
        </div>
        <span className="text-xs font-mono text-navy-500">{value > 0 ? "+" : ""}{value}</span>
      </div>
      <input
        type="range" min="-100" max="100" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-coral-500"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange, icon: Icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon: any }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <div className="flex items-center gap-2 text-sm text-navy-700">
        <Icon className="h-4 w-4 text-navy-400" /> {label}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-coral-500" : "bg-cream-300"}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
