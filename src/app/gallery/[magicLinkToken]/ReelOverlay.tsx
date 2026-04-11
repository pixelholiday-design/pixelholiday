"use client";
import { useEffect, useState } from "react";
import { Play, X, Film, Share2, Download, Check, Video, ShoppingBag } from "lucide-react";

export type ReelInfo = {
  id: string;
  duration: number;
  thumbnailUrl: string | null;
};

const REEL_PRICE = 10;

export default function ReelOverlay({ reel, onBuyReel }: { reel: ReelInfo; onBuyReel?: () => void }) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    const shareUrl = videoUrl || window.location.href;
    const shareData = { title: "My Fotiqo Reel", text: "Check out my holiday reel!", url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `fotiqo-reel-${reel.id.slice(0, 8)}.mp4`;
      a.click();
    } else {
      window.open(`/api/ai/auto-reel/${reel.id}?download=1`, "_blank");
    }
  }

  useEffect(() => {
    if (!open) return;
    if (html || videoUrl) return;
    setLoading(true);
    fetch(`/api/ai/auto-reel/${reel.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.videoUrl) {
          setVideoUrl(d.videoUrl);
        }
        setHtml(d.previewHtml || "<p style='color:white;padding:40px'>Reel unavailable.</p>");
      })
      .catch(() => setHtml("<p style='color:white;padding:40px'>Reel unavailable.</p>"))
      .finally(() => setLoading(false));
  }, [open, reel.id, html, videoUrl]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      <button
        data-reel-trigger
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-coral-500 hover:bg-coral-600 text-white rounded-full px-5 py-2.5 text-sm font-semibold shadow-lift transition"
      >
        <Film className="h-4 w-4" />
        Watch your reel
        <span className="text-white/70 text-xs">({reel.duration}s)</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-navy-900/95 flex flex-col">
          {/* Close button — always visible top-right */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <header className="px-4 sm:px-6 py-4 flex items-center gap-3 text-white flex-wrap">
            <div className="font-display text-lg sm:text-xl flex items-center gap-2 mr-auto">
              {videoUrl ? <Video className="h-5 w-5 text-brand-400" /> : <Film className="h-5 w-5" />}
              Your reel
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {onBuyReel && (
                <button
                  onClick={() => { onBuyReel(); setOpen(false); }}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-coral-500 hover:bg-coral-600 text-sm font-semibold transition shadow-lg"
                >
                  <ShoppingBag className="h-4 w-4" /> Buy — €{REEL_PRICE}
                </button>
              )}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition"
                title={copied ? "Link copied!" : "Share reel"}
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 h-10 px-3 sm:px-4 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition"
                title="Download reel"
              >
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 pb-6 flex items-center justify-center">
            {loading ? (
              <div className="text-white/60 flex items-center gap-3">
                <Play className="h-8 w-8 animate-pulse" /> Loading your reel…
              </div>
            ) : videoUrl ? (
              /* Real Cloudinary MP4 video */
              <div className="w-full max-w-[540px] mx-auto">
                <video
                  src={videoUrl}
                  poster={reel.thumbnailUrl || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full rounded-2xl shadow-2xl bg-black"
                  style={{ maxHeight: "80vh" }}
                />
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-white/50">
                  <span className="inline-flex items-center gap-1"><Video className="h-3 w-3" /> MP4 Video</span>
                  <span>{reel.duration}s</span>
                  <span className="text-brand-400">Powered by Fotiqo</span>
                </div>
              </div>
            ) : html ? (
              /* HTML slideshow fallback */
              <iframe
                title="Your reel"
                srcDoc={html}
                className="w-full h-full max-w-[540px] mx-auto rounded-2xl bg-black border-0"
              />
            ) : (
              <div className="text-white/60">Reel unavailable.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
