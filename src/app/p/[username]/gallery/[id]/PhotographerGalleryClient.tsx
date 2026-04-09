"use client";

import { useState } from "react";
import { photoRef } from "@/lib/cloudinary";

type Photo = { id: string; s3Key_highRes: string; cloudinaryId: string | null; isFavorited: boolean; isPurchased: boolean };
type Gallery = { id: string; magicLinkToken: string; status: string; photos: Photo[]; expiresAt: string; totalCount: number };
type Profile = { businessName: string | null; primaryColor: string; websiteTheme: string; username: string; logoUrl: string | null };

export default function PhotographerGalleryClient({ profile, gallery }: { profile: Profile; gallery: Gallery }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(gallery.photos.filter(p => p.isFavorited).map(p => p.id)));
  const color = profile.primaryColor || "#0EA5A5";
  const isDark = profile.websiteTheme === "dark" || profile.websiteTheme === "bold";
  const photos = showFavsOnly ? gallery.photos.filter(p => favorites.has(p.id)) : gallery.photos;

  function toggleFav(photoId: string) {
    const next = new Set(favorites);
    if (next.has(photoId)) next.delete(photoId); else next.add(photoId);
    setFavorites(next);
    fetch(`/api/gallery/${gallery.magicLinkToken}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    }).catch(() => {});
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href={`/p/${profile.username}`} className="flex items-center gap-2">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-6 w-auto" />}
            <span className="font-bold">{profile.businessName || profile.username}</span>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFavsOnly(!showFavsOnly)} className={`px-3 py-1.5 rounded-lg text-sm border ${showFavsOnly ? "border-red-400 text-red-400" : isDark ? "border-zinc-700 text-zinc-400" : "border-gray-200 text-gray-500"}`}>
              {showFavsOnly ? "♥ Favorites" : "♡ Show Favorites"}
            </button>
            <span className={`text-sm ${isDark ? "text-zinc-500" : "text-gray-400"}`}>{gallery.photos.length} photos</span>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="break-inside-avoid relative group">
              <img
                src={photoRef(photo)}
                alt=""
                className="w-full h-auto rounded-lg cursor-pointer"
                loading="lazy"
                onClick={() => setLightbox(i)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition pointer-events-none" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleFav(photo.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition"
              >
                {favorites.has(photo.id) ? "♥" : "♡"}
              </button>
              {photo.isPurchased && (
                <a href={photoRef(photo)} download className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition text-xs">
                  ↓
                </a>
              )}
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div className={`text-center py-20 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>
            {showFavsOnly ? "No favorites yet. Click the heart on photos you love." : "No photos in this gallery."}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && photos[lightbox] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl" onClick={() => setLightbox(null)}>&times;</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl" onClick={(e) => { e.stopPropagation(); setLightbox(Math.max(0, lightbox - 1)); }}>&lsaquo;</button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-3xl" onClick={(e) => { e.stopPropagation(); setLightbox(Math.min(photos.length - 1, lightbox + 1)); }}>&rsaquo;</button>
          <img src={photos[lightbox].s3Key_highRes} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" onClick={e => e.stopPropagation()} />
          <div className="absolute bottom-4 text-white/50 text-sm">{lightbox + 1} / {photos.length}</div>
        </div>
      )}
    </div>
  );
}
