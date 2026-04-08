"use client";
import { useEffect, useState } from "react";
import { Play, X, Film } from "lucide-react";

export type ReelInfo = {
  id: string;
  duration: number;
  thumbnailUrl: string | null;
};

export default function ReelOverlay({ reel }: { reel: ReelInfo }) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!open || html) return;
    fetch(`/api/ai/auto-reel/${reel.id}`)
      .then((r) => r.json())
      .then((d) => setHtml(d.previewHtml || "<p style='color:white;padding:40px'>Reel unavailable.</p>"))
      .catch(() => setHtml("<p style='color:white;padding:40px'>Reel unavailable.</p>"));
  }, [open, reel.id, html]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-lift transition"
      >
        <Film className="h-4 w-4" />
        Watch your reel
        <span className="text-white/70 text-xs">({reel.duration}s)</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex flex-col">
          <header className="px-6 py-4 flex items-center justify-between text-white">
            <div className="font-display text-xl flex items-center gap-2">
              <Film className="h-5 w-5" /> Your reel
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 px-4 sm:px-6 pb-6">
            {html ? (
              <iframe
                title="Your reel"
                srcDoc={html}
                className="w-full h-full rounded-2xl bg-black border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60">
                <Play className="h-8 w-8 mr-2 animate-pulse" /> Loading your reel…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
