"use client";
import { useMemo, useState, useTransition } from "react";
import { Heart, Download, Lock, Camera, MapPin } from "lucide-react";
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
  const photos = useMemo(
    () => (favOnly ? gallery.photos.filter((p) => p.isFavorited) : gallery.photos),
    [favOnly, gallery.photos]
  );

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
      <div className="min-h-screen bg-navy-900 text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-resort-pattern opacity-40" />
          <header className="relative z-10 max-w-4xl mx-auto px-6 pt-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 mb-3">
              <Camera className="h-3.5 w-3.5" /> PixelHoliday
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight">A sneak peek of your memory</h1>
            <p className="text-white/70 mt-3 inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> {gallery.location.name} · Captured by {gallery.photographer.name}
            </p>
          </header>

          <div className="relative z-10 max-w-3xl mx-auto px-6 mt-10">
            <div className="rounded-2xl overflow-hidden shadow-lift ring-1 ring-white/10">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl(hookPhoto, false)} alt="" className="w-full block" />
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex justify-center">
            <FomoTimer expiresAt={gallery.expiresAt} />
          </div>

          <div className="mt-10 card p-8 text-navy-900">
            <h2 className="heading text-2xl mb-1">Book your viewing</h2>
            <p className="text-sm text-navy-400 mb-6">
              See all your photos in stunning quality at our studio. Choose a time — your photographer will be waiting.
            </p>
            <BookingTimePicker token={gallery.magicLinkToken} />
          </div>
        </div>
      </div>
    );
  }

  const isClean = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
  const isPartial = gallery.status === "PARTIAL_PAID";

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-cream-300/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-display text-xl sm:text-2xl text-navy-900 leading-tight">Your memories</div>
            <div className="text-xs text-navy-400 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> {gallery.location.name} · {gallery.photographer.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavOnly(!favOnly)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                favOnly ? "bg-coral-500 text-white" : "bg-white border border-cream-300 text-navy-600"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${favOnly ? "fill-white" : ""}`} /> Favorites
            </button>
            {isClean && <DownloadAllButton token={gallery.magicLinkToken} />}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3">
          <FomoTimer expiresAt={gallery.expiresAt} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {photos.map((p) => {
            const clean = isClean || (isPartial && p.isPurchased);
            return (
              <div
                key={p.id}
                className="mb-3 break-inside-avoid relative group rounded-xl overflow-hidden bg-cream-200 ring-1 ring-cream-300/50 hover:ring-coral-300 hover:shadow-lift transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl(p, clean)}
                  alt=""
                  className="w-full block transition duration-500 group-hover:scale-[1.02]"
                />
                <button
                  onClick={() => handleFav(p.id)}
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                >
                  <Heart
                    className={`h-4 w-4 transition ${
                      p.isFavorited ? "fill-coral-500 text-coral-500 scale-110" : "text-navy-600"
                    }`}
                  />
                </button>
                {clean ? (
                  <a
                    href={imgUrl(p, true)}
                    download
                    className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-card flex items-center justify-center hover:bg-white transition opacity-0 group-hover:opacity-100"
                  >
                    <Download className="h-4 w-4 text-navy-700" />
                  </a>
                ) : (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-navy-900/80 backdrop-blur text-white rounded-full px-2.5 py-1 text-[10px] font-semibold">
                    <Lock className="h-3 w-3" /> LOCKED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {(gallery.status === "PREVIEW_ECOM" || isPartial) && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-navy-900 via-navy-900/95 to-navy-900/80 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="text-white">
              <div className="font-display text-xl sm:text-2xl leading-tight">Unlock your memories</div>
              <div className="text-white/60 text-xs sm:text-sm">
                Full-resolution downloads · no expiry · instant delivery
              </div>
            </div>
            <StripeCheckoutButton token={gallery.magicLinkToken} />
          </div>
        </div>
      )}
    </div>
  );
}
