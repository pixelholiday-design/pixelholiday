'use client';

import { useState } from 'react';
import { Heart, Check } from 'lucide-react';

export interface KioskPhoto {
  id: string;
  url: string;
  favorite?: boolean;
  selected?: boolean;
}

interface Props {
  photos: KioskPhoto[];
  onPhotoTap?: (p: KioskPhoto) => void;
  onPhotoSelect?: (p: KioskPhoto) => void;
  onFavorite?: (p: KioskPhoto) => void;
  showWatermark?: boolean;
  loading?: boolean;
}

export default function PhotoGrid({
  photos,
  onPhotoTap,
  onPhotoSelect,
  onFavorite,
  showWatermark = true,
  loading = false,
}: Props) {
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div
        className="grid gap-3 p-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  const handleStart = (p: KioskPhoto) => {
    pressTimer = setTimeout(() => {
      onPhotoSelect?.(p);
      pressTimer = null;
    }, 500);
  };
  const handleEnd = (p: KioskPhoto) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
      onPhotoTap?.(p);
    }
  };

  return (
    <div
      className="grid gap-3 p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
    >
      {photos.map((p) => (
        <div
          key={p.id}
          className="relative aspect-square rounded-xl overflow-hidden bg-[#1A1F2E] border border-[#2A3042] press cursor-pointer group"
          onTouchStart={() => handleStart(p)}
          onTouchEnd={() => handleEnd(p)}
          onMouseDown={() => handleStart(p)}
          onMouseUp={() => handleEnd(p)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt="" className="w-full h-full object-cover" />

          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/30 font-display text-3xl rotate-[-20deg] tracking-widest">
                PIXEL
              </span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setBouncingId(p.id);
              setTimeout(() => setBouncingId(null), 400);
              onFavorite?.(p);
            }}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 ${p.favorite ? 'fill-coral-500 text-coral-500' : 'text-white'} ${
                bouncingId === p.id ? 'anim-bounce-heart' : ''
              }`}
            />
          </button>

          {p.selected && (
            <div className="absolute inset-0 bg-coral-500/30 border-4 border-coral-500 rounded-xl flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-coral-500 flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
