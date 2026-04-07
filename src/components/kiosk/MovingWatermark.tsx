"use client";
import { useEffect, useRef } from "react";

export interface MovingWatermarkProps {
  text?: string;
  speed?: number; // seconds per loop
  opacity?: number; // 0-1
  size?: number; // px
  enabled?: boolean; // only render in kiosk mode
}

/**
 * Moving + brightness-pulsing watermark for KIOSK presentation mode.
 * Defeats phone-camera capture by:
 *   1. Continuously translating across the screen.
 *   2. Pulsing brightness to interfere with auto-exposure.
 * NEVER use on the public web gallery — only inside /kiosk/* pages.
 */
export default function MovingWatermark({
  text = "PIXELHOLIDAY • PROOF • DO NOT COPY",
  speed = 12,
  opacity = 0.35,
  size = 48,
  enabled = true,
}: MovingWatermarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled || !ref.current) return;
    ref.current.style.setProperty("--wm-speed", `${speed}s`);
    ref.current.style.setProperty("--wm-opacity", String(opacity));
    ref.current.style.setProperty("--wm-size", `${size}px`);
  }, [enabled, speed, opacity, size]);

  if (!enabled) return null;

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      <div className="kiosk-wm-track">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="kiosk-wm-text">{text}</span>
        ))}
      </div>
      <style jsx>{`
        .kiosk-wm-track {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          animation: wm-move var(--wm-speed) linear infinite, wm-pulse 1.7s ease-in-out infinite;
          opacity: var(--wm-opacity);
        }
        .kiosk-wm-text {
          font-size: var(--wm-size);
          font-weight: 900;
          color: white;
          text-shadow: 0 0 8px rgba(0,0,0,0.6);
          letter-spacing: 4px;
          transform: rotate(-22deg);
          white-space: nowrap;
          text-align: center;
        }
        @keyframes wm-move {
          0%   { transform: translate(-15%, -10%); }
          50%  { transform: translate(15%, 10%); }
          100% { transform: translate(-15%, -10%); }
        }
        @keyframes wm-pulse {
          0%, 100% { filter: brightness(0.7); }
          50%      { filter: brightness(1.6); }
        }
      `}</style>
    </div>
  );
}
