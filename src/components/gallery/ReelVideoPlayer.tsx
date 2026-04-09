"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Download, Share2, Play } from "lucide-react";

interface ReelVideoPlayerProps {
  videoUrl?: string | null;
  previewHtml?: string | null;
  thumbnailUrl?: string | null;
  duration: number;
  reelId: string;
  onClose: () => void;
}

export default function ReelVideoPlayer({
  videoUrl,
  previewHtml,
  thumbnailUrl,
  duration,
  reelId,
  onClose,
}: ReelVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleShare = useCallback(async () => {
    const url = videoUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — some browsers block clipboard in non-secure contexts
    }
  }, [videoUrl]);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(12, 46, 61, 0.95)" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close reel player"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main content area */}
      <div className="flex w-full max-w-[540px] flex-col items-center px-4">
        {/* Video / HTML preview container */}
        <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-2xl"
          style={{ aspectRatio: "9/16" }}
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnailUrl || undefined}
                className="h-full w-full object-cover"
                playsInline
                loop
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                    } else {
                      videoRef.current.pause();
                    }
                  }
                }}
              />
              {/* Play button overlay (shown when not playing) */}
              {!playing && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
                  aria-label="Play reel"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316] shadow-lg">
                    <Play className="ml-1 h-8 w-8 text-white" fill="white" />
                  </div>
                </button>
              )}
            </>
          ) : previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="h-full w-full border-0"
              sandbox="allow-same-origin"
              title="Reel preview"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/50">
              No preview available
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="mt-4 flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          {/* Download */}
          {videoUrl ? (
            <a
              href={videoUrl}
              download={`fotiqo-reel-${reelId}.mp4`}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          ) : (
            <div className="w-20" />
          )}

          {/* Duration badge */}
          <span className="rounded-full bg-[#0EA5A5]/20 px-3 py-1 text-sm font-medium text-[#0EA5A5]">
            {formatDuration(duration)}
          </span>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Share"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
