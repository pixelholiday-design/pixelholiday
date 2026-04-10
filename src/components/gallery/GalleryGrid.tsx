"use client";
import { useState, useEffect, useMemo } from "react";
import { Heart, Lock, Download, ShoppingCart, LayoutGrid, Columns3, Play, Pause, Sparkles } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";

export type Photo = {
  id: string;
  cloudinaryId: string | null;
  s3Key_highRes: string;
  isFavorited: boolean;
  isPurchased: boolean;
  isMagicShot?: boolean;
  /** Pre-signed watermarked URL (from server) */
  _signedWm?: string;
  /** Pre-signed clean URL (from server) */
  _signedClean?: string;
};

type Layout = "masonry" | "grid" | "slideshow";

export default function GalleryGrid({
  photos,
  isPaid,
  isPartial,
  onOpen,
  onFavorite,
  onAddToCart,
  onMagic,
}: {
  photos: Photo[];
  isPaid: boolean;
  isPartial: boolean;
  onOpen: (idx: number) => void;
  onFavorite: (id: string) => void;
  onAddToCart?: (id: string) => void;
  onMagic?: (id: string) => void;
}) {
  const [layout, setLayout] = useState<Layout>("masonry");
  const [slideIdx, setSlideIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || layout !== "slideshow") return;
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % photos.length), 5000);
    return () => clearInterval(t);
  }, [playing, layout, photos.length]);

  function imgSrc(p: Photo) {
    const clean = isPaid || (isPartial && p.isPurchased);
    return getPhotoSrc(p, clean);
  }

  function isClean(p: Photo) {
    return isPaid || (isPartial && p.isPurchased);
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-xs text-navy-400 mr-2">{photos.length} photos</span>
        <button
          onClick={() => setLayout("masonry")}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition ${
            layout === "masonry" ? "bg-navy-800 text-white" : "bg-white border border-cream-300 text-navy-500"
          }`}
          title="Masonry"
        >
          <Columns3 className="h-4 w-4" />
        </button>
        <button
          onClick={() => setLayout("grid")}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition ${
            layout === "grid" ? "bg-navy-800 text-white" : "bg-white border border-cream-300 text-navy-500"
          }`}
          title="Grid"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setLayout("slideshow"); setPlaying(true); }}
          className={`h-9 w-9 rounded-lg flex items-center justify-center transition ${
            layout === "slideshow" ? "bg-navy-800 text-white" : "bg-white border border-cream-300 text-navy-500"
          }`}
          title="Slideshow"
        >
          <Play className="h-4 w-4" />
        </button>
      </div>

      {layout === "masonry" && (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {photos.map((p, i) => (
            <Card key={p.id} p={p} i={i} clean={isClean(p)} src={imgSrc(p)} onOpen={onOpen} onFavorite={onFavorite} onAddToCart={onAddToCart} onMagic={onMagic} masonry />
          ))}
        </div>
      )}

      {layout === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onOpen(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-cream-200 ring-1 ring-cream-300 hover:shadow-lift transition group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc(p)} alt="" className="w-full h-full object-cover transition group-hover:scale-105 duration-500" />
              {!isClean(p) && (
                <>
                  <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-navy-900/80 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    <Lock className="h-3 w-3" /> LOCKED
                  </div>
                  <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                    <div className="absolute inset-[-50%] flex flex-col items-center justify-center gap-12 rotate-[-30deg]">
                      {[0,1,2,3].map((row) => (
                        <div key={row} className="flex items-center gap-10 whitespace-nowrap">
                          {[0,1,2].map((col) => (
                            <span
                              key={col}
                              className="font-display text-2xl font-bold tracking-[0.2em]"
                              style={{
                                color: "rgba(255,255,255,0.45)",
                                textShadow: "0 0 8px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.8)",
                                WebkitTextStroke: "1px rgba(0,0,0,0.15)",
                              }}
                            >
                              FOTIQO
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {layout === "slideshow" && photos[slideIdx] && (
        <div className="relative bg-navy-900 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photos[slideIdx].id}
            src={imgSrc(photos[slideIdx])}
            alt=""
            className="w-full max-h-[75vh] object-contain animate-fade-in"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between bg-gradient-to-t from-navy-900 to-transparent">
            <div className="text-white text-sm">{slideIdx + 1} / {photos.length}</div>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="h-10 px-4 rounded-full bg-white text-navy-900 inline-flex items-center gap-2 font-semibold"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
            <div
              key={slideIdx + (playing ? "play" : "pause")}
              className={`h-full bg-coral-500 ${playing ? "transition-all ease-linear" : ""}`}
              style={{ width: playing ? "100%" : "0%", transitionDuration: playing ? "5000ms" : "0ms" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ p, i, clean, src, onOpen, onFavorite, onAddToCart, onMagic, masonry }: any) {
  return (
    <div
      className={`${masonry ? "mb-3 break-inside-avoid" : ""} relative group rounded-xl overflow-hidden bg-cream-200 ring-1 ring-cream-300/50 hover:ring-coral-300 hover:shadow-lift transition`}
    >
      <button onClick={() => onOpen(i)} className="block w-full relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full block transition duration-500 group-hover:scale-[1.02]" />
        {/* CSS watermark overlay for unpaid photos — large repeating pattern */}
        {!clean && (
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
            <div className="absolute inset-[-50%] flex flex-col items-center justify-center gap-16 rotate-[-30deg]">
              {[0,1,2,3,4,5].map((row) => (
                <div key={row} className="flex items-center gap-12 whitespace-nowrap">
                  {[0,1,2,3].map((col) => (
                    <span
                      key={col}
                      className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.2em]"
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        textShadow: "0 0 8px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.8)",
                        WebkitTextStroke: "1px rgba(0,0,0,0.15)",
                      }}
                    >
                      FOTIQO
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </button>
      <button
        onClick={() => onFavorite(p.id)}
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
      >
        <Heart className={`h-4 w-4 transition ${p.isFavorited ? "fill-coral-500 text-coral-500 scale-110" : "text-navy-600"}`} />
      </button>
      {!clean && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-navy-900/80 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <Lock className="h-3 w-3" /> LOCKED
        </div>
      )}
      {p.isMagicShot && (
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-gold-500 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-card">
          <Sparkles className="h-3 w-3" /> MAGIC
        </div>
      )}
      {onMagic && !p.isMagicShot && (
        <button
          onClick={() => onMagic(p.id)}
          title="Add magic"
          className="absolute bottom-3 left-3 h-9 w-9 rounded-full bg-gradient-to-br from-gold-500 to-coral-500 text-white shadow-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      )}
      {onAddToCart && (
        <button
          onClick={() => onAddToCart(p.id)}
          className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
        >
          <ShoppingCart className="h-4 w-4 text-navy-700" />
        </button>
      )}
    </div>
  );
}
