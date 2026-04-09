"use client";
import { useState, useEffect, useMemo } from "react";
import { Heart, Lock, Download, ShoppingCart, LayoutGrid, Columns3, Play, Pause, Sparkles } from "lucide-react";
import { cleanUrl, watermarkedUrl, photoRef } from "@/lib/cloudinary";

export type Photo = {
  id: string;
  cloudinaryId: string | null;
  s3Key_highRes: string;
  isFavorited: boolean;
  isPurchased: boolean;
  isMagicShot?: boolean;
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

  function imgSrc(p: Photo, w: number) {
    const clean = isPaid || (isPartial && p.isPurchased);
    const src = photoRef(p);
    return clean ? cleanUrl(src, w) : watermarkedUrl(src, w);
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
            <Card key={p.id} p={p} i={i} clean={isClean(p)} src={imgSrc(p, 1200)} onOpen={onOpen} onFavorite={onFavorite} onAddToCart={onAddToCart} onMagic={onMagic} masonry />
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
              <img src={imgSrc(p, 800)} alt="" className="w-full h-full object-cover transition group-hover:scale-105 duration-500" />
              {!isClean(p) && (
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-navy-900/80 text-white rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  <Lock className="h-3 w-3" /> LOCKED
                </div>
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
            src={imgSrc(photos[slideIdx], 2000)}
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
        {/* CSS watermark overlay for unpaid photos (fallback when Cloudinary watermark is unavailable) */}
        {!clean && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
            <span className="text-white/25 font-display text-4xl sm:text-5xl font-bold tracking-widest rotate-[-25deg]">
              FOTIQO
            </span>
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
