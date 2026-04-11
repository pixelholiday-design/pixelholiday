"use client";
import { useState, useMemo } from "react";

/* ─── Types ──────────────────────────────────────────────── */
type Room = "living" | "bedroom" | "office" | "dining";

type RoomDef = {
  key: Room;
  label: string;
  wall: string;        // wall gradient top
  wallBot: string;     // wall gradient bottom (subtle warmth shift)
  baseboard: string;
  floor: string;
  floorAccent: string;
  furnitureColor: string;
  furnitureAccent: string;
  shadowOpacity: number;
};

const ROOMS: RoomDef[] = [
  {
    key: "living",
    label: "Living Room",
    wall: "#f7f3ee",
    wallBot: "#f0ece5",
    baseboard: "#e8e0d4",
    floor: "#c4a882",
    floorAccent: "#b89970",
    furnitureColor: "#8d7656",
    furnitureAccent: "#6b5a42",
    shadowOpacity: 0.18,
  },
  {
    key: "bedroom",
    label: "Bedroom",
    wall: "#eeeae4",
    wallBot: "#e8e3dc",
    baseboard: "#ddd5c8",
    floor: "#bba888",
    floorAccent: "#a8956f",
    furnitureColor: "#d8cfc2",
    furnitureAccent: "#c4b8a8",
    shadowOpacity: 0.14,
  },
  {
    key: "office",
    label: "Office",
    wall: "#ececec",
    wallBot: "#e4e4e4",
    baseboard: "#d4d4d4",
    floor: "#a09890",
    floorAccent: "#8e8680",
    furnitureColor: "#3c3c3c",
    furnitureAccent: "#2a2a2a",
    shadowOpacity: 0.16,
  },
  {
    key: "dining",
    label: "Dining Room",
    wall: "#f2ede6",
    wallBot: "#ece6dd",
    baseboard: "#dcd4c6",
    floor: "#9e8e78",
    floorAccent: "#8a7c68",
    furnitureColor: "#6e5c48",
    furnitureAccent: "#5a4a38",
    shadowOpacity: 0.17,
  },
];

/* ─── Frame color map ─────────────────────────────────────── */
function resolveFrameColor(frame?: string): string {
  if (!frame) return "#1a1a1a";
  const f = frame.toLowerCase();
  if (f.includes("white")) return "#f5f5f5";
  if (f.includes("walnut")) return "#5c3a1e";
  if (f.includes("oak") || f.includes("natural") || f.includes("wood")) return "#b08450";
  if (f.includes("gold") || f.includes("satin")) return "#c4a94d";
  if (f.includes("silver") || f.includes("pewter")) return "#b8b8b8";
  if (f.includes("espresso") || f.includes("dark")) return "#2c1a0e";
  if (f.includes("cherry")) return "#6b2020";
  if (f.includes("maple")) return "#c8a060";
  return "#1a1a1a"; // black
}

function resolveFrameHighlight(frame?: string): string {
  if (!frame) return "rgba(255,255,255,0.08)";
  const f = frame.toLowerCase();
  if (f.includes("gold") || f.includes("satin")) return "rgba(255,235,180,0.25)";
  if (f.includes("silver") || f.includes("pewter")) return "rgba(255,255,255,0.3)";
  return "rgba(255,255,255,0.12)";
}

/* ─── Component ───────────────────────────────────────────── */
export default function RoomPreview({
  photoUrl,
  productName,
  selectedSize,
  frameType,
  productType,
}: {
  photoUrl: string;
  productName: string;
  selectedSize?: string;
  frameType?: string;
  productType?: "canvas" | "frame" | "metal" | "acrylic" | "wood" | "bamboo" | "standout" | "float" | "print";
}) {
  const [room, setRoom] = useState<Room>("living");
  const r = ROOMS.find((rm) => rm.key === room) || ROOMS[0];

  /* Parse size for scaling */
  const dims = useMemo(() => {
    const m = selectedSize?.match(/(\d+)\s*[×x]\s*(\d+)/);
    const w = m ? parseInt(m[1]) : 16;
    const h = m ? parseInt(m[2]) : 20;
    return { w, h, isLandscape: w > h };
  }, [selectedSize]);

  /* Scale: map real-world inches to % of wall width.
     A 36" piece ≈ 52% of wall. An 8" piece ≈ 16%. */
  const wallPct = Math.min(58, Math.max(14, (Math.max(dims.w, dims.h) / 40) * 55));
  const aspectRatio = `${dims.w} / ${dims.h}`;

  /* Frame rendering */
  const hasFrame = !!frameType && !frameType.toLowerCase().includes("no ");
  const pn = productName.toLowerCase();
  const isCanvas = productType === "canvas" || pn.includes("canvas");
  const isMetal = productType === "metal" || pn.includes("metal") || productType === "float";
  const isAcrylic = productType === "acrylic" || pn.includes("acrylic");
  const isWood = productType === "wood" || pn.includes("wood");
  const isBamboo = productType === "bamboo" || pn.includes("bamboo");
  const isStandout = productType === "standout" || pn.includes("standout");

  const frameColor = resolveFrameColor(frameType);
  const frameHighlight = resolveFrameHighlight(frameType);
  const frameWidth = hasFrame ? 8 : 0;
  const matWidth = hasFrame ? 6 : 0;

  /* Real-world size label */
  const sizeLabel = selectedSize
    ? `${dims.w}″ × ${dims.h}″`
    : undefined;

  return (
    <div className="space-y-2.5">
      {/* ─── Room Scene ─────────────────────────────── */}
      <div
        className="relative w-full rounded-2xl overflow-hidden select-none"
        style={{ height: 340 }}
      >
        {/* Wall */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${r.wall} 0%, ${r.wallBot} 65%, ${r.baseboard} 66%, ${r.baseboard} 68%, ${r.floor} 68%, ${r.floorAccent} 100%)`,
          }}
        />

        {/* Wall texture (subtle linen) */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)",
          }}
        />

        {/* Ambient light from top-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 70% 10%, rgba(255,252,245,0.25), transparent)",
          }}
        />

        {/* Floor wood grain */}
        <div
          className="absolute left-0 right-0 bottom-0 opacity-[0.06]"
          style={{
            top: "68%",
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(0,0,0,0.08) 60px, rgba(0,0,0,0.08) 61px)`,
          }}
        />

        {/* ─── Shadow behind artwork ───────────────── */}
        <div
          className="absolute"
          style={{
            width: `${wallPct + 2}%`,
            aspectRatio,
            left: "50%",
            top: dims.isLandscape ? "14%" : "6%",
            transform: "translateX(-50%) translateY(4px)",
            boxShadow: `0 12px 50px rgba(0,0,0,${r.shadowOpacity}), 0 4px 16px rgba(0,0,0,0.08)`,
            borderRadius: isCanvas ? 0 : 2,
          }}
        />

        {/* ─── Artwork on wall ─────────────────────── */}
        <div
          className="absolute"
          style={{
            width: `${wallPct}%`,
            left: "50%",
            top: dims.isLandscape ? "12%" : "4%",
            transform: "translateX(-50%)",
          }}
        >
          {/* Canvas wrap */}
          {isCanvas && (
            <div
              className="relative"
              style={{
                boxShadow: "4px 6px 24px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover block"
                style={{ aspectRatio }}
              />
              {/* Canvas edge effects */}
              <div className="absolute inset-y-0 left-0 w-[6px] bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[5px] bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-[5px] bg-gradient-to-t from-black/18 to-transparent pointer-events-none" />
              {/* Canvas texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage: "radial-gradient(circle, #000 0.3px, transparent 0.3px)",
                  backgroundSize: "3px 3px",
                }}
              />
            </div>
          )}

          {/* Metal / Acrylic (frameless, floated look) */}
          {(isMetal || isAcrylic) && (
            <div
              className="relative overflow-hidden"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: isMetal ? 0 : 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover block"
                style={{ aspectRatio }}
              />
              {/* Metal sheen / Acrylic gloss */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isMetal
                    ? "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(255,255,255,0.04) 60%, transparent 100%)"
                    : "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 35%, rgba(255,255,255,0.06) 65%, transparent 100%)",
                }}
              />
              {/* Float shadow (standoff from wall) */}
              <div className="absolute -inset-1 -z-10 rounded" style={{
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)"
              }} />
            </div>
          )}

          {/* Wood / Bamboo (natural material, edge tint) */}
          {(isWood || isBamboo) && (
            <div
              className="relative overflow-hidden"
              style={{
                boxShadow: "4px 6px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
                borderRadius: 2,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover block"
                style={{ aspectRatio, opacity: isWood ? 0.88 : 0.92 }}
              />
              {/* Grain overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  opacity: isWood ? 0.1 : 0.06,
                  backgroundImage: isWood
                    ? "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(139,115,85,0.18) 8px, rgba(139,115,85,0.18) 9px)"
                    : "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180,160,100,0.2) 3px, rgba(180,160,100,0.2) 4px)",
                }}
              />
            </div>
          )}

          {/* Standout mount (thick, frameless, beveled edges) */}
          {isStandout && (
            <div
              className="relative"
              style={{
                boxShadow: "6px 10px 30px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover block"
                style={{ aspectRatio }}
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-white/15" />
              {/* Thickness indicator */}
              <div className="absolute inset-x-0 bottom-0 h-[4px] bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Framed print */}
          {hasFrame && !isCanvas && !isMetal && !isAcrylic && !isWood && !isBamboo && !isStandout && (
            <div
              style={{
                padding: frameWidth,
                backgroundColor: frameColor,
                boxShadow: `0 8px 36px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 ${frameHighlight}`,
                borderRadius: 2,
              }}
            >
              {/* Frame inner edge */}
              <div
                className="absolute inset-0 pointer-events-none rounded-sm"
                style={{
                  boxShadow: `inset 0 0 0 ${frameWidth}px ${frameColor}, inset ${frameWidth}px ${frameWidth}px ${frameWidth * 2}px rgba(0,0,0,0.12)`,
                }}
              />
              {/* Mat */}
              <div style={{ padding: matWidth, backgroundColor: "#fefefe" }}>
                <div style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt={productName}
                    className="w-full object-cover block"
                    style={{ aspectRatio }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plain print (no frame selected) */}
          {!hasFrame && !isCanvas && !isMetal && !isAcrylic && !isWood && !isBamboo && !isStandout && (
            <div
              style={{
                boxShadow: "0 6px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={productName}
                className="w-full object-cover block"
                style={{ aspectRatio }}
              />
            </div>
          )}
        </div>

        {/* ─── Furniture ───────────────────────────── */}
        {room === "living" && (
          <>
            {/* Sofa */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-lg"
              style={{
                width: "52%",
                height: "24%",
                background: `linear-gradient(180deg, ${r.furnitureColor}cc 0%, ${r.furnitureAccent}aa 100%)`,
              }}
            >
              {/* Sofa back */}
              <div
                className="absolute -top-[30%] inset-x-0 rounded-t-lg"
                style={{
                  height: "40%",
                  background: `linear-gradient(180deg, ${r.furnitureColor}88 0%, ${r.furnitureColor}bb 100%)`,
                }}
              />
              {/* Sofa arms */}
              <div
                className="absolute -left-[4%] top-[-20%] rounded-tl-lg"
                style={{ width: "8%", height: "80%", backgroundColor: `${r.furnitureColor}99` }}
              />
              <div
                className="absolute -right-[4%] top-[-20%] rounded-tr-lg"
                style={{ width: "8%", height: "80%", backgroundColor: `${r.furnitureColor}99` }}
              />
              {/* Cushion lines */}
              <div className="absolute inset-x-[12%] top-[20%] h-px bg-black/[0.06]" />
              <div className="absolute left-1/2 top-[15%] bottom-[30%] w-px bg-black/[0.05]" />
            </div>
            {/* Side table */}
            <div className="absolute bottom-0 right-[10%]" style={{ width: "6%", height: "18%" }}>
              <div className="w-full h-[30%] rounded-t-sm" style={{ backgroundColor: `${r.furnitureAccent}66` }} />
              <div className="mx-[35%] h-[70%]" style={{ backgroundColor: `${r.furnitureAccent}44` }} />
            </div>
            {/* Plant */}
            <div className="absolute bottom-[18%] right-[11%]">
              <div className="w-3 h-3 rounded-full bg-green-800/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-700/15 -mt-1.5 ml-1" />
              <div className="w-2 h-2 rounded-full bg-green-800/18 -mt-1 -ml-0.5" />
            </div>
          </>
        )}

        {room === "bedroom" && (
          <>
            {/* Bed headboard */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2"
              style={{
                width: "44%",
                height: "28%",
              }}
            >
              {/* Headboard */}
              <div
                className="absolute -top-[25%] inset-x-[2%] rounded-t-lg"
                style={{
                  height: "35%",
                  backgroundColor: `${r.furnitureColor}bb`,
                  boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.05)",
                }}
              />
              {/* Mattress */}
              <div
                className="w-full h-full rounded-t-sm"
                style={{
                  background: `linear-gradient(180deg, #f8f6f2cc 0%, ${r.furnitureColor}88 100%)`,
                }}
              />
              {/* Pillows */}
              <div className="absolute top-[8%] left-[8%] w-[38%] h-[28%] rounded-lg bg-white/60" />
              <div className="absolute top-[8%] right-[8%] w-[38%] h-[28%] rounded-lg bg-white/60" />
              {/* Duvet fold */}
              <div className="absolute bottom-[15%] inset-x-[5%] h-px bg-black/[0.04]" />
            </div>
            {/* Nightstand */}
            <div className="absolute bottom-0 left-[16%]" style={{ width: "5%", height: "14%" }}>
              <div className="w-full h-full rounded-t-sm" style={{ backgroundColor: `${r.furnitureAccent}55` }} />
            </div>
            {/* Lamp */}
            <div className="absolute bottom-[14%] left-[17%]">
              <div className="w-2 h-3 mx-auto" style={{ backgroundColor: `${r.furnitureAccent}44` }} />
              <div className="w-4 h-2.5 rounded-t-full bg-amber-100/30 -ml-1" />
            </div>
          </>
        )}

        {room === "office" && (
          <>
            {/* Desk */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-sm"
              style={{
                width: "48%",
                height: "22%",
                background: `linear-gradient(180deg, ${r.furnitureColor}dd 0%, ${r.furnitureAccent}cc 100%)`,
              }}
            >
              {/* Desk surface highlight */}
              <div className="absolute top-0 inset-x-0 h-[3px] bg-white/[0.06]" />
            </div>
            {/* Monitor */}
            <div className="absolute bottom-[22%] left-1/2 -translate-x-1/2" style={{ width: "18%" }}>
              <div className="w-full aspect-[16/10] rounded-sm bg-gray-900/25 border border-black/10" />
              <div className="mx-auto w-[20%] h-2 bg-gray-600/15" />
              <div className="mx-auto w-[40%] h-0.5 bg-gray-600/10 rounded-b" />
            </div>
            {/* Chair back (behind desk) */}
            <div
              className="absolute bottom-[5%] left-1/2 -translate-x-1/2 rounded-t-2xl"
              style={{
                width: "16%",
                height: "24%",
                backgroundColor: `${r.furnitureColor}44`,
              }}
            />
          </>
        )}

        {room === "dining" && (
          <>
            {/* Sideboard / credenza */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-sm"
              style={{
                width: "46%",
                height: "20%",
                background: `linear-gradient(180deg, ${r.furnitureColor}cc 0%, ${r.furnitureAccent}bb 100%)`,
              }}
            >
              {/* Doors */}
              <div className="absolute inset-[8%] flex gap-px">
                <div className="flex-1 rounded-sm border border-black/[0.04]" />
                <div className="flex-1 rounded-sm border border-black/[0.04]" />
                <div className="flex-1 rounded-sm border border-black/[0.04]" />
              </div>
            </div>
            {/* Vase */}
            <div className="absolute bottom-[20%] left-[calc(50%-8%)]">
              <div className="w-3 h-5 rounded-t-full rounded-b-sm bg-amber-900/15" />
              <div className="w-2 h-2.5 rounded-full bg-green-700/12 -mt-1 ml-0.5" />
            </div>
            {/* Books */}
            <div className="absolute bottom-[20%] right-[calc(50%-10%)] flex gap-px">
              <div className="w-1 h-3 bg-blue-900/10 rounded-t-sm" />
              <div className="w-1 h-3.5 bg-red-900/8 rounded-t-sm" />
              <div className="w-1 h-2.5 bg-green-900/10 rounded-t-sm" />
            </div>
          </>
        )}

        {/* ─── Labels ──────────────────────────────── */}
        {sizeLabel && (
          <div className="absolute bottom-3 right-3 bg-white/85 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {sizeLabel}
          </div>
        )}
        {frameType && hasFrame && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/10"
              style={{ backgroundColor: resolveFrameColor(frameType) }}
            />
            {frameType}
          </div>
        )}
      </div>

      {/* ─── Room Selector ─────────────────────────── */}
      <div className="flex gap-1.5 justify-center">
        {ROOMS.map((rm) => (
          <button
            key={rm.key}
            onClick={() => setRoom(rm.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              room === rm.key
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
          >
            {rm.label}
          </button>
        ))}
      </div>
    </div>
  );
}
