"use client";
import { useState } from "react";
import { Play, Wand2, X, ExternalLink } from "lucide-react";

type Reel = {
  id: string;
  galleryId: string;
  galleryName: string;
  customerName: string;
  photographerName: string;
  magicLinkToken: string;
  photoCount: number;
  duration: number;
  musicTrack: string;
  status: string;
  thumbnailUrl: string | null;
  createdAt: string;
};

type Eligible = { id: string; label: string };

export default function ReelsClient({
  reels,
  eligibleGalleries,
}: {
  reels: Reel[];
  eligibleGalleries: Eligible[];
}) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [pickedGallery, setPickedGallery] = useState<string>(eligibleGalleries[0]?.id || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function openPreview(id: string) {
    setPreviewId(id);
    setPreviewHtml(null);
    const r = await fetch(`/api/ai/auto-reel/${id}`);
    const data = await r.json().catch(() => null);
    if (data?.previewHtml) setPreviewHtml(data.previewHtml);
    else setPreviewHtml("<p style='color:white;padding:40px'>Preview unavailable.</p>");
  }

  async function generate() {
    if (!pickedGallery) return;
    setGenerating(true);
    setErrorMsg(null);
    try {
      const r = await fetch("/api/ai/auto-reel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ galleryId: pickedGallery }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErrorMsg(data.error || "Failed to generate");
      } else {
        // Reload to show the new reel
        window.location.reload();
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate panel */}
      {eligibleGalleries.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-cream-300 shadow-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="h-5 w-5 text-brand-700" />
            <h2 className="font-display text-xl text-navy-900">Generate a new reel</h2>
          </div>
          <p className="text-navy-500 text-sm mb-4">
            Pick a gallery with 5+ photos and the AI will detect bursts and stitch them into a
            highlight clip.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={pickedGallery}
              onChange={(e) => setPickedGallery(e.target.value)}
              className="flex-1 min-w-[260px] bg-cream-100 border border-cream-300 rounded-xl px-4 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {eligibleGalleries.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={generating || !pickedGallery}
              className="bg-brand-700 hover:bg-brand-800 disabled:bg-cream-300 disabled:text-navy-400 text-white px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              {generating ? "Generating…" : "Generate Reel"}
            </button>
          </div>
          {errorMsg && (
            <div className="mt-3 bg-coral-50 border border-coral-200 text-coral-700 text-sm rounded-lg p-3">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Reel grid */}
      {reels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reels.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl ring-1 ring-cream-300 shadow-card overflow-hidden hover:shadow-lift transition"
            >
              <button
                onClick={() => openPreview(r.id)}
                className="relative block w-full aspect-video bg-navy-900 group"
              >
                {r.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.thumbnailUrl}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-700 to-brand-300" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lift">
                    <Play className="h-6 w-6 text-brand-700 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-navy-900/80 text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                  {r.duration}s · {r.photoCount} photos
                </div>
              </button>
              <div className="p-4">
                <div className="font-display text-lg text-navy-900">{r.galleryName}</div>
                <div className="text-navy-500 text-xs mt-1">
                  {r.customerName} · shot by {r.photographerName}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-navy-400">
                  <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    {r.musicTrack}
                  </span>
                  <a
                    href={`/gallery/${r.magicLinkToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 hover:text-brand-500 inline-flex items-center gap-1"
                  >
                    Gallery <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview overlay */}
      {previewId && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex flex-col">
          <header className="px-6 py-4 flex items-center justify-between text-white">
            <div className="font-display text-xl">Reel preview</div>
            <button
              onClick={() => {
                setPreviewId(null);
                setPreviewHtml(null);
              }}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 px-6 pb-6">
            {previewHtml ? (
              <iframe
                title="Reel preview"
                srcDoc={previewHtml}
                className="w-full h-full rounded-2xl bg-black border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                Loading preview…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
