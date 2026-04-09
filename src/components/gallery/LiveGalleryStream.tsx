"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Radio, X, Volume2, VolumeX } from "lucide-react";

type LivePhoto = {
  id: string;
  thumbnailUrl: string;
  fullUrl: string;
  isHookImage: boolean;
  createdAt: string;
};

type SSEEvent =
  | { type: "connected"; galleryToken: string }
  | { type: "new_photos"; photos: LivePhoto[]; totalCount: number; photographerName?: string }
  | { type: "heartbeat" };

/**
 * LiveGalleryStream — connects to the gallery SSE endpoint and notifies
 * the parent when new photos arrive. Also renders the pulsing "LIVE"
 * indicator and toast notifications.
 */
export default function LiveGalleryStream({
  galleryToken,
  onNewPhotos,
}: {
  galleryToken: string;
  onNewPhotos: (photos: LivePhoto[]) => void;
}) {
  const [isLive, setIsLive] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [toast, setToast] = useState<{ count: number; photographer?: string } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const esRef = useRef<EventSource | null>(null);

  const playShutter = useCallback(() => {
    if (!soundOn) return;
    try {
      const audio = new Audio("/sounds/shutter-click.wav");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  }, [soundOn]);

  useEffect(() => {
    const es = new EventSource(`/api/gallery/${galleryToken}/stream`);
    esRef.current = es;

    es.onopen = () => setIsLive(true);

    es.onmessage = (e) => {
      try {
        const data: SSEEvent = JSON.parse(e.data);

        if (data.type === "new_photos") {
          onNewPhotos(data.photos);
          setNewCount((n) => n + data.photos.length);
          playShutter();

          // Show toast
          setToast({ count: data.photos.length, photographer: data.photographerName });
          clearTimeout(toastTimer.current);
          toastTimer.current = setTimeout(() => setToast(null), 4000);

          // Browser notification (if permission granted)
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("Fotiqo", {
              body: `${data.photos.length} new photo${data.photos.length > 1 ? "s" : ""} just taken!`,
              icon: "/icons/fotiqo-icon-192.png",
              tag: "fotiqo-live",
            });
          }
        }
      } catch {}
    };

    es.onerror = () => {
      setIsLive(false);
      // SSE auto-reconnects
    };

    // Request notification permission
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      es.close();
      clearTimeout(toastTimer.current);
    };
  }, [galleryToken, onNewPhotos, playShutter]);

  return (
    <>
      {/* Live indicator pill */}
      <div className="inline-flex items-center gap-2 bg-navy-900 text-white rounded-full px-3 py-1.5 text-xs font-semibold shadow-card">
        <span
          className={`w-2 h-2 rounded-full ${
            isLive ? "bg-green-400 animate-pulse" : "bg-navy-500"
          }`}
        />
        <Radio className="h-3 w-3" />
        {isLive ? "LIVE" : "Connecting..."}
        {newCount > 0 && (
          <span className="bg-coral-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ml-1">
            +{newCount}
          </span>
        )}
        <button
          onClick={() => setSoundOn((v) => !v)}
          className="ml-1 opacity-60 hover:opacity-100 transition"
          title={soundOn ? "Mute" : "Unmute"}
        >
          {soundOn ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
        </button>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-navy-900 text-white rounded-2xl shadow-lift px-5 py-3 flex items-center gap-3 min-w-[240px]">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {toast.count} new photo{toast.count > 1 ? "s" : ""}!
              </div>
              {toast.photographer && (
                <div className="text-xs text-white/60">
                  Captured by {toast.photographer}
                </div>
              )}
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-white/40 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
