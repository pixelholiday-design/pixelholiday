"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Upload, Check, ChevronRight } from "lucide-react";
import RoomPreview from "@/components/shop/RoomPreview";
/* eslint-disable @next/next/no-img-element */

/* ─── Types ──────────────────────────────────────────────── */
type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  retailPrice: number;
  fulfillmentType: string;
  turnaround?: string;
  mockupUrl?: string;
  isFeatured: boolean;
  hasRoomPreview?: boolean;
  sizes?: string;
  options?: string;
  papers?: string;
  frames?: string;
  finishes?: string;
  defaultSize?: string;
  defaultOption?: string;
};

type SizeEntry = { key?: string; name?: string; label?: string; cost?: number; width?: number; height?: number };
type OptionEntry = { key?: string; name?: string; label?: string; costAddon?: number };
type CartItem = { productKey: string; qty: number; size?: string; option?: string; unitPrice?: number };
const STORAGE_KEY = "fotiqo.cart.v2";

/* ── Product lifestyle images (Unsplash) ── */
const PRODUCT_IMAGES: Record<string, string> = {
  wall_canvas: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
  wall_framed_print: "https://images.unsplash.com/photo-1594633313828-8794e2bd2e15?w=800&q=80",
  wall_metal: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
  wall_acrylic: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=800&q=80",
  wall_wood: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
  wall_float_frame: "https://images.unsplash.com/photo-1594633313828-8794e2bd2e15?w=800&q=80",
  wall_framed_canvas: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
  wall_acrylic_block: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=800&q=80",
  wall_photo_tile: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
  wall_bamboo: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
  wall_standout: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
  wall_gallery_set: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=800&q=80",
  print_lustre: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
  print_glossy: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
  print_matte: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
  print_fine_art: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=800&q=80",
  print_mounted: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
  gift_mug_11oz: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
  gift_mug_15oz: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800&q=80",
  gift_mug_enamel: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
  gift_magnet: "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=800&q=80",
  gift_phone_case: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80",
  gift_puzzle_120: "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0c4?w=800&q=80",
  gift_puzzle_500: "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0c4?w=800&q=80",
  gift_tote: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
  gift_cushion: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  gift_ornament: "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80",
  album_hardcover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
  album_softcover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
  card_greeting: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
  digital_single: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  digital_gallery: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  package_starter: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=800&q=80",
  package_wall_art: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
  package_family: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
  package_premium: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80",
};
const CATEGORY_FALLBACKS: Record<string, string> = {
  WALL_ART: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
  PRINTS: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
  GIFTS: "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=800&q=80",
  ALBUMS: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
  CARDS: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80",
  DIGITAL: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
  PACKAGES: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=800&q=80",
  OTHERS: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
};
function getProductImage(productKey: string, category: string): string {
  return PRODUCT_IMAGES[productKey] ?? CATEGORY_FALLBACKS[category] ?? "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80";
}

/* ─── Helpers ────────────────────────────────────────────── */
function parseJson<T>(json?: string | null): T[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}
function entryId(e: SizeEntry | OptionEntry): string {
  return (e as any).key ?? (e as any).name ?? (e as any).label ?? "";
}
function entryLabel(e: SizeEntry | OptionEntry): string {
  return (e as any).label ?? (e as any).name ?? (e as any).key ?? "";
}
function frameSwatchColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("white")) return "#f0ede8";
  if (n.includes("walnut")) return "#5c3a1e";
  if (n.includes("oak") || n.includes("natural") || n.includes("wood")) return "#b08450";
  if (n.includes("gold") || n.includes("satin")) return "#c4a94d";
  if (n.includes("silver") || n.includes("pewter")) return "#b8b8b8";
  if (n.includes("espresso") || n.includes("dark")) return "#2c1a0e";
  if (n.includes("cherry")) return "#6b2020";
  if (n.includes("distressed")) return "#666";
  if (n.includes("black")) return "#1a1a1a";
  return "#8b7355";
}
function detectProductType(p: ShopProduct): "canvas" | "frame" | "metal" | "acrylic" | "wood" | "bamboo" | "standout" | "float" | "print" {
  const k = p.productKey.toLowerCase();
  const n = p.name.toLowerCase();
  if (k.includes("canvas") || n.includes("canvas")) return "canvas";
  if (k.includes("bamboo") || n.includes("bamboo")) return "bamboo";
  if (k.includes("wood") || n.includes("wood")) return "wood";
  if (k.includes("standout") || n.includes("standout")) return "standout";
  if (k.includes("float") || n.includes("float")) return "float";
  if (k.includes("metal") || n.includes("metal")) return "metal";
  if (k.includes("acrylic") || n.includes("acrylic")) return "acrylic";
  if (k.includes("frame") || n.includes("frame")) return "frame";
  return "print";
}
function isWallArt(p: ShopProduct): boolean {
  return p.category === "WALL_ART" || !!p.hasRoomPreview;
}

/* ─── Cart Hook ──────────────────────────────────────────── */
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try { const raw = sessionStorage.getItem(STORAGE_KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
  }, []);
  function addItem(productKey: string, qty: number, size?: string, option?: string, unitPrice?: number) {
    setItems(prev => {
      const found = prev.find(p => p.productKey === productKey);
      const updated = found
        ? prev.map(p => p.productKey === productKey ? { ...p, qty: p.qty + qty, size, option, unitPrice } : p)
        : [...prev, { productKey, qty, size, option, unitPrice }];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }
  return { items, addItem };
}

/* ═══════════════════════════════════════════════════════════ */
/* CLIENT COMPONENT                                           */
/* ═══════════════════════════════════════════════════════════ */
export default function ProductDetailClient({
  initialProduct,
  initialRelated,
}: {
  initialProduct: ShopProduct | null;
  initialRelated: ShopProduct[];
}) {
  const [product] = useState<ShopProduct | null>(initialProduct);
  const related = initialRelated;

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<string>("");
  const [selectedFrame, setSelectedFrame] = useState<string>("");
  const [selectedFinish, setSelectedFinish] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  // Initialize selections from product data
  useEffect(() => {
    if (!product) return;
    const sizes = parseJson<SizeEntry>(product.sizes);
    const papers = parseJson<OptionEntry>(product.papers);
    const frames = parseJson<OptionEntry>(product.frames);
    const finishes = parseJson<OptionEntry>(product.finishes);
    const opts = parseJson<OptionEntry>(product.options);
    setSelectedSize(product.defaultSize ?? entryId(sizes[0] ?? {}));
    setSelectedPaper(entryId(papers[0] ?? {}));
    setSelectedFrame(entryId(frames[0] ?? {}));
    setSelectedFinish(entryId(finishes[0] ?? {}));
    setSelectedOption(product.defaultOption ?? entryId(opts[0] ?? {}));
  }, [product]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    let base = product.retailPrice;
    const sizes = parseJson<SizeEntry>(product.sizes);
    const sizeEntry = sizes.find(s => entryId(s) === selectedSize);
    if (sizeEntry?.cost && sizes.length > 1) base = sizeEntry.cost;
    const papers = parseJson<OptionEntry>(product.papers);
    const paperEntry = papers.find(p => entryId(p) === selectedPaper);
    if (paperEntry?.costAddon) base += paperEntry.costAddon;
    const frames = parseJson<OptionEntry>(product.frames);
    const frameEntry = frames.find(f => entryId(f) === selectedFrame);
    if (frameEntry?.costAddon) base += frameEntry.costAddon;
    return base;
  }, [product, selectedSize, selectedPaper, selectedFrame]);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  function handleAddToCart() {
    if (!product) return;
    addItem(product.productKey, qty, selectedSize || undefined, selectedOption || undefined, unitPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 text-center text-lg">Product not found.</p>
        <Link href="/shop" className="mt-4 text-[#0EA5A5] font-semibold hover:underline">Back to shop</Link>
      </div>
    );
  }

  const sizes = parseJson<SizeEntry>(product.sizes);
  const papers = parseJson<OptionEntry>(product.papers);
  const frames = parseJson<OptionEntry>(product.frames);
  const finishes = parseJson<OptionEntry>(product.finishes);
  const opts = parseJson<OptionEntry>(product.options);
  const isPhysical = product.fulfillmentType !== "DIGITAL";
  const showRoom = isWallArt(product);
  const productType = detectProductType(product);

  const productImageUrl = photoPreview || getProductImage(product.productKey, product.category);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0C2E3D]">
      {/* Nav */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="font-display text-2xl text-[#0C2E3D] tracking-tight">
          Fotiqo
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-gray-500 hover:text-[#0C2E3D] text-sm font-medium flex items-center gap-1.5 transition">
            <ShoppingBag className="h-4 w-4" /> Shop
          </Link>
        </div>
      </nav>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <ol className="flex items-center flex-wrap gap-1.5 text-sm text-gray-400">
          <li><Link href="/shop" className="hover:text-[#0C2E3D] transition font-medium">Shop</Link></li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li>
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#0C2E3D] transition font-medium capitalize">
              {product.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="h-3 w-3" /></li>
          <li className="text-[#0C2E3D] font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</li>
        </ol>
      </nav>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Left: Preview ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Main product image */}
            <div className="rounded-2xl overflow-hidden shadow-lg bg-white">
              <img
                src={productImageUrl}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            {showRoom ? (
              <>
                {/* Room preview for wall art */}
                <div className="rounded-2xl overflow-hidden shadow-md">
                  <RoomPreview
                    photoUrl={productImageUrl}
                    productName={product.name}
                    selectedSize={selectedSize}
                    frameType={selectedFrame || undefined}
                    productType={productType}
                  />
                </div>
                {isPhysical && (
                  <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-[#0EA5A5]/30 hover:border-[#0EA5A5] rounded-xl p-4 transition bg-[#0EA5A5]/[0.02] hover:bg-[#0EA5A5]/[0.05]">
                    <Upload className="h-5 w-5 text-[#0EA5A5]" />
                    <span className="text-sm text-gray-500 font-medium">
                      {photoFile ? photoFile.name : "Upload your photo to see it on the wall"}
                    </span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
                  </label>
                )}
              </>
            ) : (
              <></>
            )}

            {/* Upload for non-wall-art physical */}
            {isPhysical && !showRoom && (
              <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-[#0EA5A5]/30 hover:border-[#0EA5A5] rounded-xl p-4 transition bg-[#0EA5A5]/[0.02] hover:bg-[#0EA5A5]/[0.05]">
                <Upload className="h-5 w-5 text-[#0EA5A5]" />
                <span className="text-sm text-gray-500 font-medium">
                  {photoFile ? photoFile.name : "Upload your photo for a personalized preview"}
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />
              </label>
            )}
            {photoPreview && !showRoom && (
              <div className="rounded-xl overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-contain" />
              </div>
            )}
          </div>

          {/* ── Right: Details ─────────────────────────────── */}
          <div>
            <span className="text-[#0EA5A5] text-[11px] font-semibold uppercase tracking-[0.2em]">
              {product.category.replace(/_/g, " ")}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl mt-2 text-[#0C2E3D] leading-tight">
              {product.name}
            </h1>
            <p className="text-gray-500 mt-3 text-base leading-relaxed">{product.description}</p>

            {product.turnaround && (
              <div className="mt-4 inline-flex items-center gap-2 bg-[#0EA5A5]/5 text-[#0EA5A5] rounded-full px-4 py-2 text-sm font-medium">
{product.turnaround}
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-6" />

            {/* ─── Size ──────────────────────────────────── */}
            {sizes.length > 1 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2.5">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s, idx) => {
                    const id = entryId(s) || `size_${idx}`;
                    const active = selectedSize === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedSize(id)}
                        className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                          active
                            ? "border-[#0C2E3D] bg-[#0C2E3D] text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {entryLabel(s)}
                        {s.cost != null && sizes.length > 1 && (
                          <span className={`text-[10px] ml-1 ${active ? "text-gray-300" : "text-gray-400"}`}>
                            €{s.cost}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Paper ─────────────────────────────────── */}
            {papers.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2.5">Paper</p>
                <div className="flex flex-wrap gap-2">
                  {papers.map((p, idx) => {
                    const id = entryId(p) || `paper_${idx}`;
                    const active = selectedPaper === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedPaper(id)}
                        className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                          active
                            ? "border-[#0C2E3D] bg-[#0C2E3D] text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {entryLabel(p)}
                        {(p.costAddon ?? 0) > 0 && (
                          <span className={`text-[10px] ml-1 ${active ? "text-gray-300" : "text-gray-400"}`}>
                            +€{p.costAddon}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Frame ─────────────────────────────────── */}
            {frames.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2.5">Frame</p>
                <div className="flex flex-wrap gap-2">
                  {frames.map((f, idx) => {
                    const id = entryId(f) || `frame_${idx}`;
                    const active = selectedFrame === id;
                    const color = frameSwatchColor(entryLabel(f));
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedFrame(id)}
                        className={`group/f flex items-center gap-2 pl-1.5 pr-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                          active
                            ? "border-[#0C2E3D] bg-[#0C2E3D] text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <span
                          className={`relative w-7 h-7 rounded-md flex items-center justify-center shadow-inner ${
                            active ? "ring-2 ring-white/30" : "ring-1 ring-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {active && <Check className="h-3.5 w-3.5 text-white drop-shadow" strokeWidth={3} />}
                        </span>
                        {entryLabel(f)}
                        {(f.costAddon ?? 0) > 0 && (
                          <span className={`text-[10px] ${active ? "text-gray-300" : "text-gray-400"}`}>
                            +€{f.costAddon}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Finish ────────────────────────────────── */}
            {finishes.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2.5">Finish</p>
                <div className="flex flex-wrap gap-2">
                  {finishes.map((f, idx) => {
                    const id = entryId(f) || `finish_${idx}`;
                    const active = selectedFinish === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedFinish(id)}
                        className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                          active
                            ? "border-[#0C2E3D] bg-[#0C2E3D] text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {entryLabel(f)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Options ───────────────────────────────── */}
            {opts.length > 0 && (
              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2.5">Option</p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o, idx) => {
                    const id = entryId(o) || `opt_${idx}`;
                    const active = selectedOption === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedOption(id)}
                        className={`px-3.5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                          active
                            ? "border-[#0C2E3D] bg-[#0C2E3D] text-white"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {entryLabel(o)}
                        {(o.costAddon ?? 0) > 0 && (
                          <span className={`text-[10px] ml-1 ${active ? "text-gray-300" : "text-gray-400"}`}>
                            +€{o.costAddon}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 my-6" />

            {/* Quantity + Price */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">Quantity</p>
                <div className="inline-flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1.5 border border-gray-200">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-full hover:bg-white flex items-center justify-center transition shadow-sm">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold w-8 text-center text-lg tabular-nums">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(20, q + 1))} className="h-8 w-8 rounded-full hover:bg-white flex items-center justify-center transition shadow-sm">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Total</div>
                <div className="font-display text-4xl text-[#0C2E3D] tabular-nums">
                  €{(unitPrice * qty).toFixed(2)}
                </div>
                {qty > 1 && (
                  <div className="text-sm text-gray-400 mt-0.5">€{unitPrice.toFixed(2)} each</div>
                )}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-full font-semibold text-[15px] transition-all duration-300 ${
                added
                  ? "bg-green-500 text-white shadow-[0_4px_14px_rgba(34,197,94,0.3)]"
                  : "bg-[#F97316] hover:bg-[#ea6c10] text-white shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)]"
              }`}
            >
              {added ? (
                <><Check className="h-5 w-5" /> Added to Cart</>
              ) : (
                <><ShoppingBag className="h-5 w-5" /> Add to Cart — €{(unitPrice * qty).toFixed(2)}</>
              )}
            </button>

            {added && (
              <Link href="/shop" className="mt-3 block text-center text-sm text-[#0EA5A5] hover:underline font-semibold">
                View cart & checkout
              </Link>
            )}

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 mt-6 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              <span>Lab-quality prints</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Ships worldwide</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-100">
            <h2 className="font-display text-2xl text-[#0C2E3D] mb-8">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => (
                <Link
                  key={p.id}
                  href={`/shop/${p.productKey}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ring-gray-100"
                >
                  <div className="overflow-hidden aspect-[4/3]">
                    <img
                      src={getProductImage(p.productKey, p.category)}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0C2E3D] text-sm group-hover:text-[#0EA5A5] transition leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.category.replace(/_/g, " ").toLowerCase()}</p>
                    <div className="text-sm font-bold text-[#0EA5A5] mt-1.5">
                      From €{p.retailPrice.toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0C2E3D] text-gray-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Fotiqo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
          <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Fotiqo</div>
        </div>
      </footer>
    </div>
  );
}
