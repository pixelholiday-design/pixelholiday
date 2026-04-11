"use client";
import { useState } from "react";

type Room = "living" | "bedroom" | "office";

const ROOMS: { key: Room; label: string; wallColor: string; floorColor: string; accent: string }[] = [
  { key: "living", label: "Living Room", wallColor: "#f5f0ea", floorColor: "#c8b99a", accent: "#d4c8b8" },
  { key: "bedroom", label: "Bedroom", wallColor: "#eae6e0", floorColor: "#b8a88c", accent: "#d8cec0" },
  { key: "office", label: "Office", wallColor: "#e8e8e8", floorColor: "#a0998e", accent: "#d0d0d0" },
];

export default function RoomPreview({
  photoUrl,
  productName,
  selectedSize,
  frameType,
}: {
  photoUrl: string;
  productName: string;
  selectedSize?: string;
  frameType?: string;
}) {
  const [room, setRoom] = useState<Room>("living");
  const r = ROOMS.find((rm) => rm.key === room) || ROOMS[0];

  // Parse size for aspect ratio
  const sizeMatch = selectedSize?.match(/(\d+)\s*[×x]\s*(\d+)/);
  const w = sizeMatch ? parseInt(sizeMatch[1]) : 16;
  const h = sizeMatch ? parseInt(sizeMatch[2]) : 20;
  const isLandscape = w > h;

  // Scale product on wall (percentage of wall width)
  const maxWallPct = Math.min(55, Math.max(25, (w / 36) * 55));
  const aspectRatio = isLandscape ? `${w}/${h}` : `${h}/${w}`;

  // Frame styles
  const frameColor =
    frameType?.toLowerCase().includes("white") ? "#ffffff" :
    frameType?.toLowerCase().includes("walnut") ? "#5c3a1e" :
    frameType?.toLowerCase().includes("oak") || frameType?.toLowerCase().includes("natural") || frameType?.toLowerCase().includes("wood") ? "#b08450" :
    frameType?.toLowerCase().includes("gold") || frameType?.toLowerCase().includes("satin gold") ? "#c4a94d" :
    frameType?.toLowerCase().includes("silver") ? "#c0c0c0" :
    "#1a1a1a"; // default black

  const hasFrame = !!frameType && !frameType.toLowerCase().includes("no ");
  const framePx = hasFrame ? 6 : 0;

  return (
    <div className="space-y-3">
      {/* Room scene */}
      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          height: 280,
          background: `linear-gradient(180deg, ${r.wallColor} 0%, ${r.wallColor} 68%, ${r.accent} 68%, ${r.accent} 70%, ${r.floorColor} 70%, ${r.floorColor} 100%)`,
        }}
      >
        {/* Wall texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)",
          backgroundSize: "8px 8px",
        }} />

        {/* Shadow on wall behind product */}
        <div
          className="absolute"
          style={{
            width: `${maxWallPct + 3}%`,
            height: isLandscape ? "38%" : "50%",
            left: "50%",
            top: isLandscape ? "18%" : "10%",
            transform: "translateX(-50%)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            borderRadius: 4,
          }}
        />

        {/* Product on wall */}
        <div
          className="absolute"
          style={{
            width: `${maxWallPct}%`,
            left: "50%",
            top: isLandscape ? "16%" : "8%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Frame */}
          <div
            style={{
              padding: framePx,
              backgroundColor: hasFrame ? frameColor : "transparent",
              boxShadow: hasFrame
                ? `0 4px 20px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.1)`
                : `0 4px 20px rgba(0,0,0,0.2)`,
              borderRadius: hasFrame ? 2 : 0,
            }}
          >
            {/* Mat (for framed prints) */}
            {hasFrame && (
              <div style={{ padding: 4, backgroundColor: "#ffffff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={productName}
                  className="w-full object-cover"
                  style={{ aspectRatio }}
                />
              </div>
            )}
            {!hasFrame && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover"
                style={{ aspectRatio }}
              />
            )}
          </div>
        </div>

        {/* Furniture hint */}
        {room === "living" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "50%", height: "22%" }}>
            <div className="w-full h-full bg-[#8b7355] rounded-t-lg opacity-20" />
          </div>
        )}
        {room === "bedroom" && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ width: "40%", height: "25%" }}>
            <div className="w-full h-full bg-[#d4c8b8] rounded-t-md opacity-25" />
          </div>
        )}

        {/* Size label */}
        {selectedSize && (
          <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur text-navy-700 text-[10px] font-semibold px-2 py-1 rounded-full shadow-sm">
            {selectedSize}
          </div>
        )}
      </div>

      {/* Room selector */}
      <div className="flex gap-2 justify-center">
        {ROOMS.map((rm) => (
          <button
            key={rm.key}
            onClick={() => setRoom(rm.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              room === rm.key
                ? "bg-navy-900 text-white"
                : "bg-cream-200 text-navy-600 hover:bg-cream-300"
            }`}
          >
            {rm.label}
          </button>
        ))}
      </div>
    </div>
  );
}
