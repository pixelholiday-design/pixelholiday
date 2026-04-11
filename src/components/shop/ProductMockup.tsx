"use client";

/**
 * ProductMockup — CSS-only realistic product previews with the CLIENT'S photo.
 * Every product type renders the actual photo ON the product (canvas edges,
 * frame mat, metal sheen, mug wrap, phone case, book cover, etc.).
 *
 * Props:
 *   photoUrl  — the client's photo (or a sample/placeholder)
 *   product   — { name, category, subcategory, productKey }
 *   className — optional wrapper class
 *   size      — "card" (grid thumbnail) or "detail" (large preview)
 */

import { memo } from "react";

type Product = {
  name: string;
  category: string;
  subcategory?: string;
  productKey: string;
};

type Props = {
  photoUrl: string;
  product: Product;
  className?: string;
  size?: "card" | "detail";
  frameColor?: string;
};

/* ── helpers ─────────────────────────────────────────────── */

function detect(p: Product): string {
  const k = (p.productKey + " " + p.name + " " + (p.subcategory ?? "")).toLowerCase();
  if (k.includes("canvas")) return "canvas";
  if (k.includes("bamboo")) return "bamboo";
  if (k.includes("wood") && !k.includes("book")) return "wood";
  if (k.includes("standout")) return "standout";
  if (k.includes("float")) return "float";
  if (k.includes("metal")) return "metal";
  if (k.includes("acrylic")) return "acrylic";
  if (k.includes("frame")) return "frame";
  if (k.includes("gallery wall") || k.includes("gallery set")) return "gallery-set";
  if (k.includes("tile")) return "tiles";
  if (k.includes("book") || k.includes("album")) return "book";
  if (k.includes("card") || k.includes("greeting") || k.includes("invitation")) return "card";
  if (k.includes("mug")) return "mug";
  if (k.includes("puzzle")) return "puzzle";
  if (k.includes("phone") || k.includes("case")) return "phone";
  if (k.includes("tote")) return "tote";
  if (k.includes("cushion") || k.includes("pillow")) return "cushion";
  if (k.includes("blanket")) return "blanket";
  if (k.includes("bottle") || k.includes("water")) return "bottle";
  if (k.includes("magnet")) return "magnet";
  if (k.includes("keychain") || k.includes("key ring")) return "keychain";
  if (k.includes("ornament")) return "ornament";
  if (k.includes("coaster")) return "coaster";
  if (k.includes("calendar")) return "calendar";
  if (k.includes("poster") || k.includes("print") || k.includes("lustre") || k.includes("fine art") || k.includes("matte") || k.includes("gloss")) return "print";
  if (p.category === "WALL_ART") return "canvas";
  if (p.category === "PRINTS") return "print";
  if (p.category === "ALBUMS" || p.category === "PHOTO_BOOK") return "book";
  if (p.category === "CARDS") return "card";
  if (p.category === "GIFT" || p.category === "SOUVENIR") return "mug";
  return "print";
}

function resolveFrame(color?: string): string {
  if (!color) return "#1a1a1a";
  const c = color.toLowerCase();
  if (c.includes("white")) return "#f0ede8";
  if (c.includes("walnut")) return "#5c3a1e";
  if (c.includes("oak") || c.includes("natural")) return "#b08450";
  if (c.includes("gold") || c.includes("satin")) return "#c4a94d";
  if (c.includes("silver") || c.includes("pewter")) return "#b8b8b8";
  if (c.includes("espresso") || c.includes("dark")) return "#2c1a0e";
  if (c.includes("cherry")) return "#6b2020";
  if (c.includes("black")) return "#1a1a1a";
  return "#5c3a1e";
}

/* ── The wall background shared by wall-art mockups ─────── */
const WallBg = ({ children, isDetail }: { children: React.ReactNode; isDetail: boolean }) => (
  <div
    className={`relative w-full ${isDetail ? "aspect-[4/3]" : "aspect-[4/3]"} overflow-hidden`}
    style={{
      background: "linear-gradient(180deg, #f5f0ea 0%, #ebe5dc 40%, #e0d8ce 100%)",
    }}
  >
    {/* subtle linen texture */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px),repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 3px)",
      }}
    />
    {/* top ambient light */}
    <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-white/10 blur-3xl rounded-full" />
    <div className="absolute inset-0 flex items-center justify-center">{children}</div>
  </div>
);

/* ── Product photo (the img element reused everywhere) ──── */
const Photo = memo(function Photo({
  src,
  aspect = "3/2",
  rounded,
  className = "",
}: {
  src: string;
  aspect?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Your photo"
      className={`w-full object-cover block ${className}`}
      style={{ aspectRatio: aspect, borderRadius: rounded }}
      draggable={false}
    />
  );
});

/* ═══════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                             */
/* ═══════════════════════════════════════════════════════════ */

function ProductMockup({ photoUrl, product, className = "", size = "card", frameColor }: Props) {
  const type = detect(product);
  const isDetail = size === "detail";
  const frame = resolveFrame(frameColor);

  /* ── Canvas wrap ─────────────────────────────────────── */
  if (type === "canvas") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative" style={{ width: "52%", boxShadow: "6px 10px 30px rgba(0,0,0,0.25), 2px 3px 8px rgba(0,0,0,0.15)" }}>
          <Photo src={photoUrl} />
          {/* canvas edge — right */}
          <div className="absolute top-0 -right-[6px] bottom-0 w-[6px]" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.15), rgba(0,0,0,0.3))` }} />
          {/* canvas edge — bottom */}
          <div className="absolute -bottom-[5px] left-0 right-0 h-[5px]" style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.25))` }} />
          {/* canvas texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #000 0.4px, transparent 0.4px)", backgroundSize: "4px 4px" }} />
        </div>
      </WallBg>
    );
  }

  /* ── Framed print ────────────────────────────────────── */
  if (type === "frame") {
    const isGold = frameColor?.toLowerCase().includes("gold") || frameColor?.toLowerCase().includes("satin");
    const isSilver = frameColor?.toLowerCase().includes("silver") || frameColor?.toLowerCase().includes("pewter");
    return (
      <WallBg isDetail={isDetail}>
        <div
          className="relative"
          style={{
            width: "48%",
            padding: isDetail ? "10px" : "8px",
            backgroundColor: frame,
            boxShadow: "6px 10px 30px rgba(0,0,0,0.25), 1px 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          {/* frame highlight */}
          {(isGold || isSilver) && (
            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(135deg, ${isGold ? "rgba(255,215,0,0.2)" : "rgba(200,200,200,0.25)"} 0%, transparent 50%, ${isGold ? "rgba(255,215,0,0.1)" : "rgba(200,200,200,0.15)"} 100%)`,
            }} />
          )}
          {/* mat */}
          <div className="bg-white" style={{ padding: isDetail ? "12px" : "8px" }}>
            <Photo src={photoUrl} />
          </div>
        </div>
      </WallBg>
    );
  }

  /* ── Metal print ─────────────────────────────────────── */
  if (type === "metal") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative overflow-hidden" style={{ width: "52%", boxShadow: "4px 8px 28px rgba(0,0,0,0.28)" }}>
          <Photo src={photoUrl} />
          {/* metallic sheen */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.08) 100%)" }} />
          {/* subtle rounded corners */}
          <div className="absolute inset-0 pointer-events-none rounded-[1px]" />
        </div>
      </WallBg>
    );
  }

  /* ── Acrylic ─────────────────────────────────────────── */
  if (type === "acrylic") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative overflow-hidden rounded-[2px]" style={{ width: "50%", boxShadow: "4px 8px 32px rgba(0,0,0,0.3)" }}>
          <Photo src={photoUrl} />
          {/* glass glare */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.06) 100%)" }} />
        </div>
      </WallBg>
    );
  }

  /* ── Wood print ──────────────────────────────────────── */
  if (type === "wood") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative overflow-hidden" style={{ width: "50%", boxShadow: "5px 9px 26px rgba(0,0,0,0.22)", borderRadius: "2px" }}>
          <Photo src={photoUrl} className="opacity-[0.88]" />
          {/* wood grain */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(139,115,85,0.2) 8px, rgba(139,115,85,0.2) 9px)" }} />
        </div>
      </WallBg>
    );
  }

  /* ── Bamboo ──────────────────────────────────────────── */
  if (type === "bamboo") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative overflow-hidden rounded-[2px]" style={{ width: "50%", boxShadow: "5px 9px 24px rgba(0,0,0,0.2)" }}>
          <Photo src={photoUrl} className="opacity-[0.9]" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(180,160,100,0.25) 3px, rgba(180,160,100,0.25) 4px)" }} />
        </div>
      </WallBg>
    );
  }

  /* ── Standout mount ──────────────────────────────────── */
  if (type === "standout") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative" style={{ width: "52%", boxShadow: "8px 12px 32px rgba(0,0,0,0.28)" }}>
          <Photo src={photoUrl} />
          <div className="absolute inset-0 pointer-events-none border-[3px] border-white/15" />
        </div>
      </WallBg>
    );
  }

  /* ── Float frame ─────────────────────────────────────── */
  if (type === "float") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="relative" style={{ width: "50%" }}>
          {/* back panel (the "float" gap) */}
          <div className="absolute -bottom-2 -right-2 w-full h-full border border-gray-300/40" style={{ boxShadow: "4px 6px 20px rgba(0,0,0,0.12)" }} />
          {/* photo */}
          <div className="relative" style={{ boxShadow: "4px 8px 24px rgba(0,0,0,0.2)" }}>
            <Photo src={photoUrl} />
          </div>
        </div>
      </WallBg>
    );
  }

  /* ── Gallery wall set ────────────────────────────────── */
  if (type === "gallery-set") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="flex items-end gap-[3%]" style={{ width: "70%" }}>
          <div className="w-[30%] p-[3px] rounded-[1px]" style={{ backgroundColor: frame, boxShadow: "3px 5px 14px rgba(0,0,0,0.2)" }}>
            <Photo src={photoUrl} aspect="3/4" />
          </div>
          <div className="w-[36%] p-[3px] rounded-[1px] -mt-[8%]" style={{ backgroundColor: frame, boxShadow: "3px 5px 14px rgba(0,0,0,0.2)" }}>
            <Photo src={photoUrl} aspect="4/3" />
          </div>
          <div className="w-[26%] p-[3px] rounded-[1px]" style={{ backgroundColor: frame, boxShadow: "3px 5px 14px rgba(0,0,0,0.2)" }}>
            <Photo src={photoUrl} aspect="1/1" />
          </div>
        </div>
      </WallBg>
    );
  }

  /* ── Tiles ───────────────────────────────────────────── */
  if (type === "tiles") {
    return (
      <WallBg isDetail={isDetail}>
        <div className="grid grid-cols-3 gap-[3%]" style={{ width: "65%" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-[2px]" style={{ boxShadow: "2px 4px 12px rgba(0,0,0,0.18)" }}>
              <Photo src={photoUrl} aspect="1/1" />
            </div>
          ))}
        </div>
      </WallBg>
    );
  }

  /* ── Photo book / album ──────────────────────────────── */
  if (type === "book") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f8f5f0 0%, #efe9e0 100%)" }}>
        <div className="relative" style={{ width: "44%", transform: "perspective(800px) rotateY(-8deg) rotateX(2deg)" }}>
          {/* spine shadow */}
          <div className="absolute -left-[4px] top-0 bottom-0 w-[8px] rounded-l" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.25), rgba(0,0,0,0.08))" }} />
          <div className="relative overflow-hidden rounded-r-[3px]" style={{ boxShadow: "8px 10px 30px rgba(0,0,0,0.22)", aspectRatio: "4/5" }}>
            <Photo src={photoUrl} aspect="4/5" />
            {/* page edge illusion */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.2), transparent)" }} />
            {/* title bar */}
            <div className="absolute bottom-0 inset-x-0 p-3" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.5))" }}>
              <p className="text-white text-[10px] font-medium tracking-wide opacity-90">Photo Album</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Greeting / holiday card ─────────────────────────── */
  if (type === "card") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #faf8f5 0%, #f0ece5 100%)" }}>
        <div className="relative bg-white rounded-lg overflow-hidden" style={{ width: "46%", boxShadow: "4px 6px 20px rgba(0,0,0,0.12)" }}>
          <Photo src={photoUrl} aspect="5/3.5" />
          <div className="py-2 px-3 text-center border-t border-gray-100">
            <div className="text-[7px] text-gray-400 uppercase tracking-[0.2em] font-medium">Season&apos;s Greetings</div>
          </div>
        </div>
        {/* second card tilted behind */}
        <div className="absolute" style={{ width: "42%", left: "22%", top: "18%", transform: "rotate(-6deg)", zIndex: 0, opacity: 0.5 }}>
          <div className="bg-white rounded-lg overflow-hidden" style={{ boxShadow: "3px 4px 14px rgba(0,0,0,0.08)" }}>
            <Photo src={photoUrl} aspect="5/3.5" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Mug ─────────────────────────────────────────────── */
  if (type === "mug") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative" style={{ width: isDetail ? "35%" : "38%" }}>
          {/* mug body */}
          <div className="relative bg-white overflow-hidden" style={{ borderRadius: "0 0 28% 28% / 0 0 18% 18%", boxShadow: "4px 6px 20px rgba(0,0,0,0.15)", aspectRatio: "5/6" }}>
            {/* photo wrap */}
            <div className="absolute inset-x-[8%] top-[10%] bottom-[14%] overflow-hidden rounded-[2px]">
              <Photo src={photoUrl} aspect="auto" className="h-full" />
            </div>
            {/* ceramic sheen */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.04) 100%)" }} />
          </div>
          {/* handle */}
          <div className="absolute top-[18%] -right-[18%] w-[22%] h-[45%] border-[3px] border-gray-300 rounded-r-full" />
        </div>
      </div>
    );
  }

  /* ── Puzzle ──────────────────────────────────────────── */
  if (type === "puzzle") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f0ece5 0%, #e8e2d8 100%)" }}>
        <div className="relative overflow-hidden rounded-[3px]" style={{ width: "58%", boxShadow: "4px 6px 20px rgba(0,0,0,0.18)" }}>
          <Photo src={photoUrl} />
          {/* puzzle grid */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
            backgroundSize: "20% 20%",
          }} />
          {/* one piece "lifted" */}
          <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] border border-white/30 rounded-[1px]" style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.12)", transform: "translate(3px, -3px) rotate(4deg)" }} />
        </div>
      </div>
    );
  }

  /* ── Phone case ──────────────────────────────────────── */
  if (type === "phone") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative bg-gray-900 overflow-hidden" style={{ width: "28%", aspectRatio: "9/19", borderRadius: "14%/7%", boxShadow: "4px 8px 24px rgba(0,0,0,0.25)" }}>
          <div className="absolute inset-[4%] rounded-[10%/5%] overflow-hidden">
            <Photo src={photoUrl} aspect="auto" className="h-full" />
          </div>
          {/* camera cutout */}
          <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[20%] h-[3%] bg-gray-800 rounded-full" />
        </div>
      </div>
    );
  }

  /* ── Tote bag ────────────────────────────────────────── */
  if (type === "tote") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative" style={{ width: "46%" }}>
          {/* handles */}
          <div className="absolute -top-[12%] left-[20%] w-[16%] h-[18%] border-t-[3px] border-l-[3px] border-gray-400 rounded-tl-full" />
          <div className="absolute -top-[12%] right-[20%] w-[16%] h-[18%] border-t-[3px] border-r-[3px] border-gray-400 rounded-tr-full" />
          {/* bag body */}
          <div className="relative bg-gray-100 overflow-hidden" style={{ borderRadius: "0 0 6% 6%", boxShadow: "4px 6px 20px rgba(0,0,0,0.12)", aspectRatio: "1/1.1" }}>
            <div className="absolute inset-[10%] overflow-hidden rounded-[2px]">
              <Photo src={photoUrl} aspect="auto" className="h-full" />
            </div>
            {/* fabric texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.1) 1px,rgba(0,0,0,0.1) 2px)" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Cushion / pillow ────────────────────────────────── */
  if (type === "cushion") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative overflow-hidden" style={{ width: "50%", aspectRatio: "1/1", borderRadius: "8%", boxShadow: "4px 6px 20px rgba(0,0,0,0.12)" }}>
          <Photo src={photoUrl} aspect="1/1" />
          {/* cushion puffiness */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 60px rgba(0,0,0,0.04)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.06) 100%)" }} />
        </div>
      </div>
    );
  }

  /* ── Blanket ─────────────────────────────────────────── */
  if (type === "blanket") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative overflow-hidden" style={{ width: "60%", aspectRatio: "4/3", borderRadius: "2%", boxShadow: "4px 6px 20px rgba(0,0,0,0.12)", transform: "rotate(-2deg)" }}>
          <Photo src={photoUrl} />
          {/* fabric fold */}
          <div className="absolute bottom-0 right-0 w-[25%] h-[20%]" style={{ background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)" }} />
        </div>
      </div>
    );
  }

  /* ── Water bottle ────────────────────────────────────── */
  if (type === "bottle") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative" style={{ width: "20%", aspectRatio: "1/3" }}>
          {/* cap */}
          <div className="absolute top-0 inset-x-[15%] h-[14%] bg-gray-400 rounded-t-full" style={{ boxShadow: "2px 2px 8px rgba(0,0,0,0.1)" }} />
          {/* body */}
          <div className="absolute top-[14%] inset-x-0 bottom-0 bg-white rounded-b-[20%] overflow-hidden" style={{ boxShadow: "3px 6px 18px rgba(0,0,0,0.15)" }}>
            <div className="absolute inset-x-[5%] top-[8%] bottom-[10%] overflow-hidden rounded-[2px]">
              <Photo src={photoUrl} aspect="auto" className="h-full" />
            </div>
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.06) 100%)" }} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Magnet / coaster (small square) ─────────────────── */
  if (type === "magnet" || type === "coaster") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="overflow-hidden" style={{ width: "36%", aspectRatio: "1/1", borderRadius: type === "coaster" ? "50%" : "6%", boxShadow: "3px 5px 16px rgba(0,0,0,0.15)" }}>
          <Photo src={photoUrl} aspect="1/1" />
        </div>
      </div>
    );
  }

  /* ── Keychain ────────────────────────────────────────── */
  if (type === "keychain") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative">
          {/* ring */}
          <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-gray-400 rounded-full" />
          <div className="overflow-hidden" style={{ width: "80px", aspectRatio: "1/1", borderRadius: "12%", boxShadow: "2px 4px 12px rgba(0,0,0,0.15)" }}>
            <Photo src={photoUrl} aspect="1/1" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Ornament ────────────────────────────────────────── */
  if (type === "ornament") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative">
          {/* hook */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 border-2 border-gray-400 rounded-full" />
          <div className="overflow-hidden" style={{ width: "90px", aspectRatio: "1/1", borderRadius: "50%", boxShadow: "3px 5px 16px rgba(0,0,0,0.15)" }}>
            <Photo src={photoUrl} aspect="1/1" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Calendar ────────────────────────────────────────── */
  if (type === "calendar") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="bg-white overflow-hidden rounded-[3px]" style={{ width: "48%", boxShadow: "4px 6px 20px rgba(0,0,0,0.15)" }}>
          <Photo src={photoUrl} aspect="4/3" />
          <div className="p-2 border-t border-gray-100">
            <div className="grid grid-cols-7 gap-px">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="text-center text-[5px] text-gray-400 font-medium">
                  {["S", "M", "T", "W", "T", "F", "S"][i]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Print (default for prints/posters) ──────────────── */
  if (type === "print") {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
        <div className="relative bg-white" style={{ width: "50%", padding: "7%", boxShadow: "4px 6px 22px rgba(0,0,0,0.12)" }}>
          <Photo src={photoUrl} />
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.04)" }} />
        </div>
      </div>
    );
  }

  /* ── Fallback ────────────────────────────────────────── */
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(145deg, #f5f0ea 0%, #ebe5dc 100%)" }}>
      <div className="relative" style={{ width: "50%", boxShadow: "4px 6px 20px rgba(0,0,0,0.15)" }}>
        <Photo src={photoUrl} />
      </div>
    </div>
  );
}

export default memo(ProductMockup);
