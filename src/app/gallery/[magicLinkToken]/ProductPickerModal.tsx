"use client";

import { useState, useMemo } from "react";
import { X, Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";
import type { CartItem, CartPhoto } from "@/components/gallery/ShopCart";
import RoomPreview from "@/components/shop/RoomPreview";

/* ─── Types ──────────────────────────────────────────────── */
type CatalogProduct = {
  id: string;
  productKey: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  category?: string;
  subcategory?: string;
  badge?: string;
  mockupType?: string;
  mockupUrl?: string;
  hasRoomPreview?: boolean;
  sizes?: { label: string; price?: number; name?: string }[];
  papers?: { name: string; costAddon?: number }[];
  frames?: { name: string; costAddon?: number }[];
  finishes?: { name: string }[];
};

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

/* ─── Frame color swatch ──────────────────────────────────── */
function frameSwatchColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("white")) return "#f5f5f5";
  if (n.includes("walnut")) return "#5c3a1e";
  if (n.includes("oak") || n.includes("natural") || n.includes("wood")) return "#b08450";
  if (n.includes("gold") || n.includes("satin")) return "#c4a94d";
  if (n.includes("silver") || n.includes("pewter")) return "#b8b8b8";
  if (n.includes("espresso") || n.includes("dark")) return "#2c1a0e";
  if (n.includes("cherry")) return "#6b2020";
  if (n.includes("maple")) return "#c8a060";
  if (n.includes("black")) return "#1a1a1a";
  return "#8b7355";
}

/* ─── Paper texture icon ──────────────────────────────────── */
function paperIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("lustre") || n.includes("luster")) return "◐";
  if (n.includes("matte") || n.includes("mat")) return "○";
  if (n.includes("gloss") || n.includes("glossy")) return "●";
  if (n.includes("pearl") || n.includes("metallic")) return "◈";
  if (n.includes("silk") || n.includes("satin")) return "◑";
  if (n.includes("canvas") || n.includes("fine art")) return "▤";
  return "○";
}

/* ─── Detect product type for room preview ────────────────── */
function detectProductType(product: CatalogProduct): "canvas" | "frame" | "metal" | "acrylic" | "wood" | "bamboo" | "standout" | "float" | "print" {
  const key = product.productKey.toLowerCase();
  const name = product.name.toLowerCase();
  if (key.includes("canvas") || name.includes("canvas")) return "canvas";
  if (key.includes("bamboo") || name.includes("bamboo")) return "bamboo";
  if (key.includes("wood") || name.includes("wood")) return "wood";
  if (key.includes("standout") || name.includes("standout")) return "standout";
  if (key.includes("float") || name.includes("float")) return "float";
  if (key.includes("metal") || name.includes("metal")) return "metal";
  if (key.includes("acrylic") || name.includes("acrylic")) return "acrylic";
  if (key.includes("frame") || name.includes("frame")) return "frame";
  return "print";
}

/* ─── Check if product is wall art ────────────────────────── */
function isWallArt(product: CatalogProduct): boolean {
  return (
    product.category === "WALL_ART" ||
    product.category === "SPECIALTY_WALL" ||
    !!product.hasRoomPreview ||
    ["canvas", "frame", "metal", "acrylic"].includes(detectProductType(product))
  );
}

/* ─── Inline mockup for non-wall-art products ─────────────── */
function ProductMockup({
  product,
  imgSrc,
}: {
  product: CatalogProduct;
  imgSrc: string | null;
}) {
  const type = product.mockupType ?? "default";

  if (!imgSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center text-navy-300 bg-cream-50">
        <ShoppingBag className="h-16 w-16 opacity-30" />
      </div>
    );
  }

  if (type === "mug") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="relative" style={{ maxWidth: "60%" }}>
          <div
            className="relative bg-white rounded-b-[3rem] rounded-t-2xl overflow-hidden shadow-lift border border-cream-200"
            style={{ width: 200, height: 240 }}
          >
            <div
              className="absolute inset-x-4 top-8 bottom-12 overflow-hidden rounded"
              style={{ borderRadius: "4px 4px 8px 8px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10 pointer-events-none" />
          </div>
          <div
            className="absolute right-0 top-1/3 w-10 h-14 border-4 border-cream-300 rounded-r-full"
            style={{ transform: "translateX(70%)" }}
          />
        </div>
      </div>
    );
  }

  if (type === "book") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div
          className="relative"
          style={{ maxWidth: "70%", transform: "perspective(800px) rotateY(-12deg)", transformStyle: "preserve-3d" }}
        >
          <div
            className="relative overflow-hidden rounded-r-lg shadow-lift"
            style={{ width: 220, height: 280 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white font-display text-sm leading-tight">{product.name}</p>
            </div>
          </div>
          <div
            className="absolute left-0 inset-y-0 w-8 bg-navy-800 rounded-l-sm"
            style={{ transform: "rotateY(90deg) translateZ(-4px) translateX(-50%)", transformOrigin: "left" }}
          />
        </div>
      </div>
    );
  }

  // Default: rounded card
  return (
    <div className="flex items-center justify-center w-full h-full p-6">
      <div className="relative overflow-hidden rounded-2xl shadow-lift" style={{ maxWidth: "85%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt="" className="block max-w-full max-h-[60vh] object-contain" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* MAIN MODAL                                                 */
/* ═══════════════════════════════════════════════════════════ */
export default function ProductPickerModal({
  product,
  photos,
  isPaid,
  onClose,
  onAddToCart,
  onOpenBookBuilder,
}: {
  product: CatalogProduct;
  photos: Photo[];
  isPaid: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onOpenBookBuilder?: (product: CatalogProduct) => void;
}) {
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.label ?? "");
  const [selectedPaper, setSelectedPaper] = useState(product.papers?.[0]?.name ?? "");
  const [selectedFrame, setSelectedFrame] = useState(product.frames?.[0]?.name ?? "");
  const [selectedFinish, setSelectedFinish] = useState(product.finishes?.[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedPhoto = photos[selectedPhotoIdx] ?? null;
  const imgSrc = selectedPhoto
    ? getPhotoSrc(selectedPhoto, !!(isPaid || selectedPhoto?.isPurchased))
    : null;

  const showRoom = isWallArt(product);
  const productType = detectProductType(product);
  const isBook = product.productKey.startsWith("book_");

  /* ─── Price calculation ──────────────────────────────── */
  const unitPrice = useMemo(() => {
    let base = product.price ?? (product as any).retailPrice ?? 0;
    const sizeExtra = product.sizes?.find((s) => s.label === selectedSize)?.price ?? 0;
    const paperExtra = product.papers?.find((p) => p.name === selectedPaper)?.costAddon ?? 0;
    const frameExtra = product.frames?.find((f) => f.name === selectedFrame)?.costAddon ?? 0;
    return base + sizeExtra + paperExtra + frameExtra;
  }, [product, selectedSize, selectedPaper, selectedFrame]);

  /* ─── Add to cart ────────────────────────────────────── */
  function handleAdd() {
    if (isBook && onOpenBookBuilder) {
      onOpenBookBuilder(product);
      onClose();
      return;
    }
    onAddToCart({
      productKey: product.productKey,
      productName: product.name,
      price: unitPrice,
      currency: product.currency ?? "EUR",
      qty,
      size: selectedSize || undefined,
      photo: selectedPhoto
        ? {
            id: selectedPhoto.id,
            s3Key_highRes: selectedPhoto.s3Key_highRes,
            cloudinaryId: selectedPhoto.cloudinaryId,
            isPurchased: selectedPhoto.isPurchased,
          }
        : undefined,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-5xl sm:mx-4 bg-white sm:rounded-3xl overflow-hidden shadow-lift flex flex-col sm:flex-row max-h-screen sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 shadow-sm transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ═══ LEFT: Preview ══════════════════════════════ */}
        <div className="relative sm:w-[55%] bg-cream-50 flex flex-col flex-shrink-0">
          {/* Photo strip */}
          {photos.length > 1 && (
            <div className="relative overflow-x-auto border-b border-cream-200/60">
              <div className="flex gap-1.5 p-2.5 pb-2">
                {photos.slice(0, 20).map((p, i) => {
                  const src = getPhotoSrc(p, !!(isPaid || p.isPurchased));
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPhotoIdx(i)}
                      className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                        i === selectedPhotoIdx
                          ? "border-gray-900 shadow-md scale-105"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main preview area */}
          <div className="flex-1 flex flex-col min-h-[280px] sm:min-h-[400px] relative">
            {showRoom && imgSrc ? (
              /* ─── Wall art: Room preview is the hero ─── */
              <div className="flex-1 flex flex-col justify-center px-4 py-4">
                <RoomPreview
                  photoUrl={imgSrc}
                  productName={product.name}
                  selectedSize={selectedSize}
                  frameType={selectedFrame || undefined}
                  productType={productType}
                />
              </div>
            ) : (
              /* ─── Non-wall products: standard mockup ─── */
              <div className="flex-1 flex items-center justify-center">
                <ProductMockup product={product} imgSrc={imgSrc} />
              </div>
            )}

            {/* Photo nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIdx((i) => Math.max(0, i - 1))}
                  disabled={selectedPhotoIdx === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-20 transition"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setSelectedPhotoIdx((i) => Math.min(photos.length - 1, i + 1))}
                  disabled={selectedPhotoIdx === photos.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center disabled:opacity-20 transition"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* Photo counter */}
          <p className="text-center text-[10px] text-gray-400 pb-2">
            {selectedPhotoIdx + 1} / {photos.length}
          </p>
        </div>

        {/* ═══ RIGHT: Product details & selectors ═════════ */}
        <div className="sm:w-[45%] flex flex-col overflow-y-auto p-5 sm:p-7 gap-4">
          {/* Badge */}
          {product.badge && (
            <span className="inline-flex self-start text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 rounded-full px-2.5 py-0.5">
              {product.badge}
            </span>
          )}

          {/* Name & description */}
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-gray-900 leading-tight">
              {product.name}
            </h2>
            <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* ─── Size selector ─────────────────────────── */}
          {product.sizes && product.sizes.length > 1 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((s) => {
                  const active = selectedSize === s.label;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setSelectedSize(s.label)}
                      className={`relative px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {s.label}
                      {s.price ? (
                        <span className={`text-[10px] ml-1 ${active ? "text-gray-300" : "text-gray-400"}`}>
                          +€{s.price}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Paper selector ────────────────────────── */}
          {product.papers && product.papers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Paper
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.papers.map((p) => {
                  const active = selectedPaper === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setSelectedPaper(p.name)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <span className={`text-xs ${active ? "text-gray-400" : "text-gray-400"}`}>
                        {paperIcon(p.name)}
                      </span>
                      {p.name}
                      {(p.costAddon ?? 0) > 0 && (
                        <span className={`text-[10px] ${active ? "text-gray-300" : "text-gray-400"}`}>
                          +€{p.costAddon}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Frame selector (visual swatches) ──────── */}
          {product.frames && product.frames.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Frame
              </p>
              <div className="flex flex-wrap gap-2">
                {product.frames.map((f) => {
                  const active = selectedFrame === f.name;
                  const color = frameSwatchColor(f.name);
                  return (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFrame(f.name)}
                      className={`group flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {/* Color swatch */}
                      <span
                        className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                          active ? "border-white/40" : "border-gray-200 group-hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {active && (
                          <Check className="h-3 w-3 text-white drop-shadow-sm" strokeWidth={3} />
                        )}
                      </span>
                      <span className="leading-tight">
                        {f.name}
                        {(f.costAddon ?? 0) > 0 && (
                          <span className={`text-[10px] ml-1 ${active ? "text-gray-300" : "text-gray-400"}`}>
                            +€{f.costAddon}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Finish selector ───────────────────────── */}
          {product.finishes && product.finishes.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Finish
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.finishes.map((f) => {
                  const active = selectedFinish === f.name;
                  return (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFinish(f.name)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Book note */}
          {isBook && (
            <div className="bg-cream-100 rounded-2xl p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-1">Build your photo book</p>
              <p>Select your photos, choose a layout, and customise the cover. Takes about 2 minutes.</p>
            </div>
          )}

          {/* ─── Quantity ──────────────────────────────── */}
          {!isBook && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Minus className="h-4 w-4 text-gray-600" />
                </button>
                <span className="font-display text-xl text-gray-900 w-8 text-center tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Price & CTA ───────────────────────────── */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            {/* Price breakdown */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-3xl text-gray-900 tabular-nums">
                €{(unitPrice * qty).toFixed(2)}
              </span>
              {!isBook && qty > 1 && (
                <span className="text-sm text-gray-400">€{unitPrice.toFixed(2)} each</span>
              )}
            </div>

            {/* Selected options summary */}
            {(selectedPaper || selectedFrame || selectedFinish) && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {selectedSize && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {selectedSize}
                  </span>
                )}
                {selectedPaper && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {selectedPaper}
                  </span>
                )}
                {selectedFrame && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: frameSwatchColor(selectedFrame) }} />
                    {selectedFrame}
                  </span>
                )}
                {selectedFinish && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {selectedFinish}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-base transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : "bg-gray-900 hover:bg-gray-800 text-white hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  Added to cart!
                </>
              ) : isBook ? (
                <>Build your book &rarr;</>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Add to cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
