"use client";
import { useMemo, useState, useTransition } from "react";
import { Heart, Download, Lock, Clock } from "lucide-react";
import { watermarkedUrl, cleanUrl } from "@/lib/cloudinary";
import { toggleFavorite } from "./actions";
import BookingTimePicker from "./BookingTimePicker";
import StripeCheckoutButton from "@/components/gallery/StripeCheckoutButton";
import DownloadAllButton from "@/components/gallery/DownloadAllButton";
import FomoTimer from "@/components/gallery/FomoTimer";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isHookImage: boolean;
  isFavorited: boolean;
  isPurchased: boolean;
};

type Gallery = {
  id: string;
  magicLinkToken: string;
  status: "HOOK_ONLY" | "PREVIEW_ECOM" | "PAID" | "PARTIAL_PAID" | "DIGITAL_PASS" | "EXPIRED";
  expiresAt: string | Date;
  photos: Photo[];
  customer: { name: string | null };
  photographer: { name: string };
  location: { name: string };
};

export default function GalleryView({ gallery }: { gallery: Gallery }) {
  const [favOnly, setFavOnly] = useState(false);
  const [, startTransition] = useTransition();
  const photos = useMemo(() => (favOnly ? gallery.photos.filter((p) => p.isFavorited) : gallery.photos), [favOnly, gallery.photos]);

  const hookPhoto = gallery.photos.find((p) => p.isHookImage) || gallery.photos[0];

  function handleFav(id: string) {
    startTransition(() => {
      toggleFavorite(id, gallery.magicLinkToken);
    });
  }

  function imgUrl(p: Photo, clean: boolean) {
    const src = p.cloudinaryId || p.s3Key_highRes;
    return clean ? cleanUrl(src) : watermarkedUrl(src);
  }

  // ── HOOK_ONLY ──
  if (gallery.status === "HOOK_ONLY") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-100">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <header className="text-center mb-8">
            <p className="text-stone-600 text-sm">{gallery.location.name}</p>
            <h1 className="text-4xl font-bold text-stone-900">A sneak peek of your memory ✨</h1>
            <p className="text-stone-600 mt-2">Captured by {gallery.photographer.name}</p>
          </header>
          <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl(hookPhoto, false)} alt="" className="w-full" />
          </div>
          <div className="mt-6">
            <FomoTimer expiresAt={gallery.expiresAt} />
          </div>
          <div className="mt-8 bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-stone-900 mb-2">Book a viewing at our studio</h2>
            <p className="text-sm text-stone-600 mb-4">See all your photos in stunning quality. Pick a time that works for you.</p>
            <BookingTimePicker token={gallery.magicLinkToken} />
          </div>
        </div>
      </div>
    );
  }

  // ── DIGITAL_PASS or PAID — clean ──
  const isClean = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
  const isPartial = gallery.status === "PARTIAL_PAID";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Your PixelHoliday memories</h1>
            <p className="text-xs text-stone-500">{gallery.location.name} · {gallery.photographer.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setFavOnly(!favOnly)} className={`text-sm px-3 py-1.5 rounded-full ${favOnly ? "bg-rose-500 text-white" : "bg-stone-100"}`}>
              <Heart size={14} className="inline mr-1" /> Favorites
            </button>
            {isClean && <DownloadAllButton token={gallery.magicLinkToken} />}
            {(gallery.status === "PREVIEW_ECOM" || isPartial) && <StripeCheckoutButton token={gallery.magicLinkToken} />}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <FomoTimer expiresAt={gallery.expiresAt} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="columns-1 sm:columns-2 md:columns-3 gap-3 [column-fill:_balance]">
          {photos.map((p) => {
            const clean = isClean || (isPartial && p.isPurchased);
            return (
              <div key={p.id} className="mb-3 break-inside-avoid relative group rounded-xl overflow-hidden bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl(p, clean)} alt="" className="w-full block" />
                <button onClick={() => handleFav(p.id)} className="absolute top-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
                  <Heart size={16} className={p.isFavorited ? "fill-rose-500 text-rose-500" : "text-stone-600"} />
                </button>
                {clean ? (
                  <a href={imgUrl(p, true)} download className="absolute bottom-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
                    <Download size={16} className="text-stone-700" />
                  </a>
                ) : (
                  <div className="absolute bottom-2 left-2 bg-stone-900/70 text-white rounded-full px-2 py-1 text-xs flex items-center gap-1">
                    <Lock size={12} /> locked
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
