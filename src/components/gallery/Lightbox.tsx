"use client";
import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Download, ShoppingCart, Share2, Lock } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";

type Photo = {
  id: string;
  cloudinaryId: string | null;
  s3Key_highRes: string;
  isFavorited: boolean;
  isPurchased: boolean;
  /** Pre-signed watermarked URL */
  _signedWm?: string;
  /** Pre-signed clean URL */
  _signedClean?: string;
};

export default function Lightbox({
  photos,
  startIndex,
  onClose,
  onFavorite,
  onAddToCart,
  isPaid,
  isPartial,
  token,
}: {
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
  onFavorite: (id: string) => void;
  onAddToCart?: (id: string) => void;
  isPaid: boolean;
  isPartial: boolean;
  token: string;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [showSizes, setShowSizes] = useState(false);

  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);
  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  // Preload neighbours
  useEffect(() => {
    [(idx + 1) % photos.length, (idx + 2) % photos.length, (idx - 1 + photos.length) % photos.length].forEach((i) => {
      const p = photos[i];
      if (p) {
        const im = new Image();
        im.src = getPhotoSrc(p, true);
      }
    });
  }, [idx, photos]);

  const p = photos[idx];
  if (!p) return null;
  const clean = isPaid || (isPartial && p.isPurchased);
  const src = getPhotoSrc(p, clean);

  function logDownload(type: string) {
    fetch(`/api/gallery/${token}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, photoId: p.id }),
    }).catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in">
      {/* Top bar */}
      <header className="flex items-center justify-between p-4 sm:p-6 text-white">
        <div className="font-mono text-sm text-white/80">{idx + 1} / {photos.length}</div>
        <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 relative">
        <button
          onClick={prev}
          className="absolute left-2 sm:left-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={p.id}
          src={src}
          alt=""
          className="max-h-[80vh] max-w-full object-contain animate-fade-in"
        />
        <button
          onClick={next}
          className="absolute right-2 sm:right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom bar */}
      <footer className="p-4 sm:p-6 flex items-center justify-center gap-3 text-white">
        <button
          onClick={() => onFavorite(p.id)}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
            p.isFavorited ? "bg-coral-500" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <Heart className={`h-5 w-5 ${p.isFavorited ? "fill-white" : ""}`} />
        </button>

        {clean ? (
          <div className="relative">
            <button
              onClick={() => setShowSizes((v) => !v)}
              className="h-12 px-5 rounded-full bg-white text-navy-900 flex items-center gap-2 font-semibold"
            >
              <Download className="h-5 w-5" /> Download
            </button>
            {showSizes && (
              <div className="absolute bottom-14 right-0 bg-white text-navy-900 rounded-xl shadow-lift p-2 min-w-[180px]">
                {[
                  { label: "Original", w: 4096 },
                  { label: "High-Res 4K", w: 4000 },
                  { label: "Web 1080p", w: 1080 },
                ].map((sz) => (
                  <a
                    key={sz.label}
                    href={getPhotoSrc(p, true)}
                    download={`fotiqo-${p.id.slice(0, 8)}-${sz.w}.jpg`}
                    onClick={() => logDownload(`individual_${sz.w}`)}
                    className="block px-3 py-2 rounded-lg hover:bg-cream-100 text-sm"
                  >
                    {sz.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-white/10 text-white/70">
            <Lock className="h-4 w-4" /> Unlock to download
          </div>
        )}

        {onAddToCart && (
          <button
            onClick={() => onAddToCart(p.id)}
            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={() => {
            if (navigator.share) navigator.share({ title: "Fotiqo", url: `${window.location.origin}/gallery/${token}` });
            else navigator.clipboard.writeText(`${window.location.origin}/gallery/${token}`);
          }}
          className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </footer>
    </div>
  );
}
