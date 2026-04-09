"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Heart, Camera, MapPin, X } from "lucide-react";
import { watermarkedUrl, cleanUrl, photoRef } from "@/lib/cloudinary";
import { toggleFavorite } from "./actions";
import BookingTimePicker from "./BookingTimePicker";
import StripeCheckoutButton from "@/components/gallery/StripeCheckoutButton";
import DownloadAllButton from "@/components/gallery/DownloadAllButton";
import FomoTimer from "@/components/gallery/FomoTimer";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Lightbox from "@/components/gallery/Lightbox";
import ShareMenu from "@/components/gallery/ShareMenu";
import ReelOverlay, { type ReelInfo } from "./ReelOverlay";
import MagicShotModal from "./MagicShotModal";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isHookImage: boolean;
  isFavorited: boolean;
  isPurchased: boolean;
  isMagicShot?: boolean;
  parentPhotoId?: string | null;
};

type Gallery = {
  id: string;
  magicLinkToken: string;
  status: "HOOK_ONLY" | "PREVIEW_ECOM" | "PAID" | "PARTIAL_PAID" | "DIGITAL_PASS" | "EXPIRED";
  expiresAt: string | Date;
  coverMessage: string | null;
  photos: Photo[];
  customer: { name: string | null };
  photographer: { name: string };
  location: { name: string };
};

export default function GalleryView({ gallery, reel }: { gallery: Gallery; reel?: ReelInfo | null }) {
  const [favOnly, setFavOnly] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const [extraPhotos, setExtraPhotos] = useState<Photo[]>([]);
  const [magicForId, setMagicForId] = useState<string | null>(null);
  const allPhotos = useMemo(
    () => [...gallery.photos, ...extraPhotos],
    [gallery.photos, extraPhotos],
  );
  const photos = useMemo(
    () => (favOnly ? allPhotos.filter((p) => p.isFavorited) : allPhotos),
    [favOnly, allPhotos]
  );
  const magicSourcePhoto = magicForId ? allPhotos.find((p) => p.id === magicForId) : null;
  const favCount = gallery.photos.filter((p) => p.isFavorited).length;
  const hookPhoto = gallery.photos.find((p) => p.isHookImage) || gallery.photos[0];

  // Track view once on mount
  useEffect(() => {
    fetch(`/api/gallery/${gallery.magicLinkToken}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view" }),
    }).catch(() => {});
  }, [gallery.magicLinkToken]);

  function handleFav(id: string) {
    startTransition(() => {
      toggleFavorite(id, gallery.magicLinkToken);
    });
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={watermarkedUrl(photoRef(hookPhoto))} alt="" className="w-full block" />
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex justify-center"><FomoTimer expiresAt={gallery.expiresAt} /></div>
          <div className="mt-10 card p-8 text-navy-900">
            <h2 className="heading text-2xl mb-1">Book your viewing</h2>
            <p className="text-sm text-navy-400 mb-6">See all your photos in stunning quality at our studio.</p>
            <BookingTimePicker token={gallery.magicLinkToken} />
          </div>
        </div>
      </div>
    );
  }

  const isClean = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
  const isPartial = gallery.status === "PARTIAL_PAID";
  const galleryUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Cover hero */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cleanUrl(photoRef(hookPhoto), 2400)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/10 to-navy-900/95" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center text-white px-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 mb-2">
            <Camera className="h-3 w-3" /> PixelHoliday
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-none mb-3 text-balance">{gallery.location.name}</h1>
          <p className="text-white/80">
            Captured by {gallery.photographer.name} · {gallery.photos.length} photos
          </p>
          {gallery.coverMessage && (
            <p className="text-white/70 italic mt-3 max-w-xl text-balance">"{gallery.coverMessage}"</p>
          )}
        </div>
      </section>

      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-cream-300/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="font-display text-lg text-navy-900">{gallery.location.name}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFavDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-white border border-cream-300 text-navy-600 hover:bg-cream-100 transition"
            >
              <Heart className={`h-3.5 w-3.5 ${favCount > 0 ? "fill-coral-500 text-coral-500" : ""}`} />
              {favCount} favorite{favCount === 1 ? "" : "s"}
            </button>
            <button
              onClick={() => setFavOnly((v) => !v)}
              className={`text-xs font-semibold rounded-xl px-3 py-2 transition ${
                favOnly ? "bg-coral-500 text-white" : "bg-white border border-cream-300 text-navy-600"
              }`}
            >
              {favOnly ? "All" : "Filter favs"}
            </button>
            {reel && <ReelOverlay reel={reel} />}
            <ShareMenu url={galleryUrl} title={`PixelHoliday — ${gallery.location.name}`} />
            {isClean && <DownloadAllButton token={gallery.magicLinkToken} />}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3">
          <FomoTimer expiresAt={gallery.expiresAt} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
        <GalleryGrid
          photos={photos}
          isPaid={isClean}
          isPartial={isPartial}
          onOpen={(i) => setLbIdx(i)}
          onFavorite={handleFav}
          onMagic={(id) => setMagicForId(id)}
        />
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

      {/* Footer with legal links */}
      <footer className="border-t border-cream-300/70 bg-white/60 mt-8 mb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-navy-400">
          <div>© {new Date().getFullYear()} PixelHoliday</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-coral-600">Privacy</a>
            <a href="/terms" className="hover:text-coral-600">Terms</a>
            <a href="mailto:support@pixelholiday.com" className="hover:text-coral-600">Contact</a>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lbIdx !== null && (
        <Lightbox
          photos={photos}
          startIndex={lbIdx}
          onClose={() => setLbIdx(null)}
          onFavorite={handleFav}
          isPaid={isClean}
          isPartial={isPartial}
          token={gallery.magicLinkToken}
        />
      )}

      {/* Favorites drawer */}
      {favDrawerOpen && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setFavDrawerOpen(false)}>
          <div className="flex-1 bg-black/40" />
          <aside className="w-full max-w-sm bg-cream-100 h-full shadow-lift overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-cream-300 flex items-center justify-between">
              <h3 className="heading text-xl">Favorites</h3>
              <button onClick={() => setFavDrawerOpen(false)} className="btn-ghost"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5">
              {favCount === 0 ? (
                <p className="text-sm text-navy-400">Tap any heart to start favoriting.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.photos.filter((p) => p.isFavorited).map((p) => (
                    <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={(isClean || (isPartial && p.isPurchased) ? cleanUrl : watermarkedUrl)(photoRef(p), 600)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Magic shot modal */}
      {magicSourcePhoto && (
        <MagicShotModal
          photo={magicSourcePhoto}
          onClose={() => setMagicForId(null)}
          onSaved={(newPhoto: Photo) =>
            setExtraPhotos((prev) => [
              ...prev,
              {
                ...newPhoto,
                isFavorited: false,
                isPurchased: false,
                isHookImage: false,
                isMagicShot: true,
              },
            ])
          }
        />
      )}
    </div>
  );
}
