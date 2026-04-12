"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag, Plus, Minus, X, Check, ChevronRight,
  Loader2, Truck, CreditCard, Tag,
} from "lucide-react";
/* eslint-disable @next/next/no-img-element */

/* ── Types ──────────────────────────────────────────────── */

type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  retailPrice: number;
  costPrice?: number;
  fulfillmentType: string;
  turnaround?: string;
  mockupUrl?: string;
  isFeatured: boolean;
  sizes?: string;
  options?: string;
  defaultSize?: string;
  defaultOption?: string;
};

type CategoryMeta = { label: string; blurb: string; icon: string };
type CatalogData = {
  products: ShopProduct[];
  byCategory: Record<string, ShopProduct[]>;
  categories: string[];
  categoryMeta: Record<string, CategoryMeta>;
};

type CartItem = { productKey: string; qty: number; size?: string; option?: string; unitPrice?: number };
type SizeEntry = { key?: string; name?: string; label?: string; cost?: number };

const STORAGE_KEY = "fotiqo.cart.v2";

function parseJsonSafe<T>(json?: string | null): T[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}
function sizeEntryId(e: SizeEntry): string {
  return e.key ?? e.name ?? e.label ?? "";
}
function getItemPrice(product: ShopProduct, sizeKey?: string): number {
  if (!sizeKey) return product.retailPrice;
  const sizes = parseJsonSafe<SizeEntry>(product.sizes);
  const match = sizes.find(s => sizeEntryId(s) === sizeKey);
  return match?.cost ?? product.retailPrice;
}

/* ── Product lifestyle images (Unsplash, royalty-free) ── */
const PRODUCT_IMAGES: Record<string, string> = {
  // Wall Art
  wall_canvas:        "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
  wall_framed_print:  "https://images.unsplash.com/photo-1594633313828-8794e2bd2e15?w=600&q=80",
  wall_metal:         "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
  wall_acrylic:       "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=600&q=80",
  wall_wood:          "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
  wall_float_frame:   "https://images.unsplash.com/photo-1594633313828-8794e2bd2e15?w=600&q=80",
  wall_framed_canvas: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
  wall_acrylic_block: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=600&q=80",
  wall_photo_tile:    "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
  wall_bamboo:        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80",
  wall_standout:      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
  wall_gallery_set:   "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=600&q=80",
  // Prints
  print_lustre:       "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
  print_glossy:       "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
  print_matte:        "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
  print_fine_art:     "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=600&q=80",
  print_mounted:      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
  // Gifts
  gift_mug_11oz:      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  gift_mug_15oz:      "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&q=80",
  gift_mug_enamel:    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
  gift_magnet:        "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  gift_keychain:      "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  gift_phone_case:    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
  gift_puzzle_120:    "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0c4?w=600&q=80",
  gift_puzzle_500:    "https://images.unsplash.com/photo-1606503153255-59d8b2e4b0c4?w=600&q=80",
  gift_coasters:      "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  gift_ornament:      "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=600&q=80",
  gift_mouse_pad:     "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  gift_tote:          "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
  gift_cushion:       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  gift_blanket:       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  gift_bottle:        "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  gift_calendar:      "https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&q=80",
  // Albums
  album_hardcover:    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  album_softcover:    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  album_signature:    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  album_layflat:      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
  // Cards
  card_greeting:      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  card_holiday:       "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  card_thankyou:      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  card_postcard:      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  card_savethedate:   "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  card_folded:        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  // Digital
  digital_single:     "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
  digital_gallery:    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
  // Packages
  package_starter:    "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=600&q=80",
  package_wall_art:   "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
  package_family:     "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  package_premium:    "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80",
  // Extras
  extra_retouch:      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
  extra_reel:         "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80",
};

const CATEGORY_FALLBACKS: Record<string, string> = {
  WALL_ART: "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80",
  PRINTS:   "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
  GIFTS:    "https://images.unsplash.com/photo-1549465220-1a8b9238f2b8?w=600&q=80",
  ALBUMS:   "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
  CARDS:    "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&q=80",
  DIGITAL:  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80",
  PACKAGES: "https://images.unsplash.com/photo-1596900779744-2bdc4a90509a?w=600&q=80",
  OTHERS:   "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80",
};

function getProductImage(productKey: string, category: string, mockupUrl?: string): string {
  // 1. Lab-provided mockup image (from Printful catalog sync, etc.)
  if (mockupUrl && mockupUrl.startsWith("http")) return mockupUrl;
  // 2. Curated product lifestyle photo
  if (PRODUCT_IMAGES[productKey]) return PRODUCT_IMAGES[productKey];
  // 3. Category fallback
  return CATEGORY_FALLBACKS[category]
    ?? "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&q=80";
}

const DISPLAY_TABS = [
  { key: "ALL",            label: "All" },
  { key: "DIGITAL",        label: "Digital" },
  { key: "PRINT",          label: "Prints" },
  { key: "PRINTS",         label: "Prints" },
  { key: "WALL_ART",       label: "Wall Art" },
  { key: "SPECIALTY_WALL", label: "Specialty Wall" },
  { key: "PHOTO_BOOK",     label: "Books & Albums" },
  { key: "GIFT",           label: "Gifts" },
  { key: "CARD",           label: "Cards" },
  { key: "SOUVENIR",       label: "Souvenirs" },
  { key: "BUNDLE",         label: "Bundles" },
  { key: "DISPLAY",        label: "Tabletop" },
  { key: "PASSES",         label: "Passes" },
  { key: "ADD_ONS",        label: "Add-ons" },
];
const DEDUP_LABELS = new Set<string>();
const CATEGORY_PAGE_SIZE = 12;

/* ── Cart hook ──────────────────────────────────────────── */

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { const raw = sessionStorage.getItem(STORAGE_KEY); if (raw) setItems(JSON.parse(raw)); } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, loaded]);

  const add = useCallback((productKey: string, size?: string, option?: string) => {
    setItems(prev => {
      const found = prev.find(p => p.productKey === productKey);
      if (found) return prev.map(p => p.productKey === productKey ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { productKey, qty: 1, size, option }];
    });
  }, []);

  const dec = useCallback((productKey: string) => {
    setItems(prev => prev.map(p => p.productKey === productKey ? { ...p, qty: p.qty - 1 } : p).filter(p => p.qty > 0));
  }, []);

  const remove = useCallback((productKey: string) => {
    setItems(prev => prev.filter(p => p.productKey !== productKey));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return { items, add, dec, remove, clear, loaded };
}

/* ── Main component ─────────────────────────────────────── */

export default function ShopClient({ initialCatalog }: { initialCatalog?: CatalogData }) {
  const { items, add, dec, remove, clear, loaded } = useCart();
  const [catalog, setCatalog] = useState<CatalogData | null>(initialCatalog ?? null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [needsShipping, setNeedsShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState({ name: "", address: "", city: "", country: "", postal: "", phone: "", method: "STANDARD" });

  useEffect(() => {
    // Skip fetch if products were pre-loaded from server
    if (initialCatalog) return;
    fetch("/api/shop/catalog")
      .then(r => r.json())
      .then(d => { if (d.error) setCatalogError(d.error); else setCatalog(d as CatalogData); })
      .catch(e => setCatalogError(e.message));
  }, [initialCatalog]);

  const productMap = useMemo<Map<string, ShopProduct>>(() => {
    if (!catalog) return new Map();
    return new Map(catalog.products.map(p => [p.productKey, p]));
  }, [catalog]);

  const visibleProducts = useMemo<ShopProduct[]>(() => {
    if (!catalog) return [];
    if (activeTab === "ALL") return catalog.products;
    return catalog.byCategory[activeTab] ?? [];
  }, [catalog, activeTab]);

  const visibleTabs = useMemo(() => {
    if (!catalog) return DISPLAY_TABS.slice(0, 1);
    DEDUP_LABELS.clear();
    const result: typeof DISPLAY_TABS = [];
    for (const t of DISPLAY_TABS) {
      if (t.key !== "ALL" && (catalog.byCategory[t.key]?.length ?? 0) === 0) continue;
      if (t.key !== "ALL" && DEDUP_LABELS.has(t.label)) continue;
      DEDUP_LABELS.add(t.label);
      result.push(t);
    }
    return result;
  }, [catalog]);

  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((sum, i) => {
    const p = productMap.get(i.productKey);
    if (!p) return sum;
    const price = i.unitPrice ?? getItemPrice(p, i.size);
    return sum + price * i.qty;
  }, 0);
  const discountedTotal = couponResult?.valid ? total * (1 - couponResult.discount / 100) : total;
  const hasPhysical = items.some(i => { const p = productMap.get(i.productKey); return p && p.fulfillmentType !== "DIGITAL"; });

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setCouponResult(null);
    try {
      const res = await fetch(`/api/shop/coupon?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (data.valid) setCouponResult({ valid: true, discount: data.discount || 0, message: data.message || `${data.discount}% off!` });
      else setCouponResult({ valid: false, discount: 0, message: data.error || "Invalid coupon code." });
    } catch { setCouponResult({ valid: false, discount: 0, message: "Could not verify coupon." }); }
    finally { setCouponChecking(false); }
  }

  async function checkout() {
    if (items.length === 0) return;
    if (hasPhysical && !needsShipping) { setNeedsShipping(true); return; }
    if (hasPhysical && (!shippingForm.name || !shippingForm.address || !shippingForm.city || !shippingForm.country || !shippingForm.postal)) {
      setCheckoutErr("Please fill in your shipping address.");
      return;
    }
    setSubmitting(true);
    setCheckoutErr(null);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productKey: i.productKey, qty: i.qty, size: i.size, option: i.option })),
          shipping: hasPhysical ? shippingForm : undefined,
          couponCode: couponResult?.valid ? couponCode.trim() : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { clear(); window.location.href = data.url; }
      else if (data.mock) setCheckoutErr(`Demo mode — order created: ${data.orderId}. Total: €${data.total?.toFixed(2)}`);
      else setCheckoutErr(data.error || "Checkout failed");
    } catch (e: any) { setCheckoutErr(e.message); }
    finally { setSubmitting(false); }
  }

  const categoryMeta = catalog?.categoryMeta ?? {};

  return (
    <>
      {/* ── Floating cart button ──────────────────────────── */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 group"
      >
        <div className="relative bg-[#0C2E3D] hover:bg-[#0a2633] text-white rounded-full pl-5 pr-6 py-3.5 shadow-[0_8px_30px_rgba(12,46,61,0.4)] flex items-center gap-2.5 font-semibold transition-all duration-200 hover:shadow-[0_12px_40px_rgba(12,46,61,0.5)] hover:scale-[1.02]">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[15px]">
            {loaded && itemCount > 0 ? `${itemCount} · €${total.toFixed(2)}` : "Cart"}
          </span>
          {loaded && itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-[#F97316] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {itemCount}
            </span>
          )}
        </div>
      </button>

      {/* ── Category tabs ────────────────────────────────── */}
      <div className="sticky top-[65px] z-10 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-3 -mx-1 px-1">
            {visibleTabs.map(tab => {
              const count = tab.key === "ALL" ? (catalog?.products.length ?? 0) : (catalog?.byCategory[tab.key]?.length ?? 0);
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    active
                      ? "bg-[#0C2E3D] text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                  {catalog && count > 0 && (
                    <span className={`text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none ${
                      active ? "bg-white/20 text-white/90" : "bg-gray-200 text-gray-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Product grid ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {catalogError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center mb-8">
            <p className="font-semibold">Could not load products</p>
            <p className="text-sm mt-1">{catalogError}</p>
          </div>
        )}

        {!catalog && !catalogError && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden ring-1 ring-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="flex items-end justify-between pt-3 border-t border-gray-50">
                    <div className="h-7 bg-gray-100 rounded w-16" />
                    <div className="h-9 bg-gray-100 rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {catalog && visibleProducts.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="font-semibold text-gray-600 text-lg">No products in this category yet.</p>
            <button onClick={() => setActiveTab("ALL")} className="mt-3 text-[#0EA5A5] font-semibold text-sm hover:underline">
              View all products
            </button>
          </div>
        )}

        {catalog && visibleProducts.length > 0 && (
          <>
            {/* Featured products — only on ALL tab */}
            {activeTab === "ALL" && (() => {
              const featured = catalog.products.filter(p => p.isFeatured);
              if (featured.length === 0) return null;
              return (
                <section className="mb-16">
                  <div className="mb-8">
                    <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-[0.25em]">Most Popular</p>
                    <h2 className="font-display text-3xl text-[#0C2E3D] mt-1">Customer Favourites</h2>
                    <p className="text-gray-500 text-sm mt-1.5">Our top-rated products loved by guests.</p>
                  </div>
                  <ProductGrid products={featured} items={items} add={add} dec={dec} productMap={productMap} />
                </section>
              );
            })()}

            {/* Category sections */}
            {activeTab === "ALL" ? (
              catalog.categories.map(cat => {
                const prods = catalog.byCategory[cat] ?? [];
                if (prods.length === 0) return null;
                const meta = categoryMeta[cat] ?? { label: cat, blurb: "", icon: "" };
                const isExpanded = expandedCategories.has(cat);
                const displayProds = isExpanded ? prods : prods.slice(0, CATEGORY_PAGE_SIZE);
                const hasMore = prods.length > CATEGORY_PAGE_SIZE;
                return (
                  <section key={cat} className="mb-16">
                    <div className="flex items-end justify-between mb-8">
                      <div>
                        <p className="text-[#0EA5A5] text-xs font-semibold uppercase tracking-[0.25em]">{meta.label}</p>
                        <h2 className="font-display text-3xl text-[#0C2E3D] mt-1">{meta.label}</h2>
                        {meta.blurb && <p className="text-gray-500 text-sm mt-1.5">{meta.blurb}</p>}
                      </div>
                      {hasMore && !isExpanded && (
                        <span className="text-xs text-gray-400 font-medium">{prods.length} products</span>
                      )}
                    </div>
                    <ProductGrid products={displayProds} items={items} add={add} dec={dec} productMap={productMap} />
                    {hasMore && !isExpanded && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setExpandedCategories(prev => { const n = new Set(Array.from(prev)); n.add(cat); return n; })}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0EA5A5] hover:text-[#0C2E3D] transition"
                        >
                          View all {prods.length} products <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </section>
                );
              })
            ) : (
              (() => {
                const cat = activeTab;
                const isExpanded = expandedCategories.has(cat);
                const displayProds = isExpanded ? visibleProducts : visibleProducts.slice(0, CATEGORY_PAGE_SIZE);
                const hasMore = visibleProducts.length > CATEGORY_PAGE_SIZE;
                return (
                  <>
                    <ProductGrid products={displayProds} items={items} add={add} dec={dec} productMap={productMap} />
                    {hasMore && !isExpanded && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setExpandedCategories(prev => { const n = new Set(Array.from(prev)); n.add(cat); return n; })}
                          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#0C2E3D] font-semibold px-6 py-3 rounded-full transition text-sm"
                        >
                          View all {visibleProducts.length} products <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </>
        )}
      </main>

      {/* ── Cart drawer ──────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          <div
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Header */}
            <header className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#0C2E3D]" />
                <h3 className="font-display text-2xl text-[#0C2E3D]">Your Cart</h3>
                {itemCount > 0 && (
                  <span className="bg-[#0EA5A5] text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </header>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-400 py-20">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-200 mb-4" />
                  <p className="font-medium text-gray-600 mb-1">Your cart is empty</p>
                  <p className="text-sm">Add a product to get started.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map(item => {
                    const p = productMap.get(item.productKey);
                    if (!p) return null;
                    return (
                      <li key={item.productKey} className="flex gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={getProductImage(item.productKey, p.category, p.mockupUrl)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0C2E3D] text-sm truncate">{p.name}</div>
                          {item.size && <div className="text-xs text-gray-400 mt-0.5">{item.size}</div>}
                          <div className="text-sm font-semibold text-[#0C2E3D] mt-1">€{((item.unitPrice ?? getItemPrice(p, item.size)) * item.qty).toFixed(2)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <button onClick={() => remove(item.productKey)} className="text-gray-300 hover:text-red-500 transition p-0.5">
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex items-center gap-1 bg-white rounded-full px-1 py-0.5 shadow-sm border border-gray-200">
                            <button onClick={() => dec(item.productKey)} className="h-6 w-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-bold text-xs w-5 text-center">{item.qty}</span>
                            <button onClick={() => add(item.productKey)} className="h-6 w-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Shipping form */}
              {needsShipping && hasPhysical && (
                <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-semibold text-[#0C2E3D] flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#0EA5A5]" /> Shipping Address
                  </h4>
                  {(["name", "address", "city", "country", "postal", "phone"] as const).map(field => (
                    <div key={field}>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1 capitalize">
                        {field === "postal" ? "Postcode / ZIP" : field}
                        {field !== "phone" && <span className="text-[#F97316] ml-0.5">*</span>}
                      </label>
                      <input
                        type={field === "phone" ? "tel" : "text"}
                        value={shippingForm[field]}
                        onChange={e => setShippingForm(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#0C2E3D] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/30 focus:border-[#0EA5A5] transition"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Shipping method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["STANDARD", "EXPRESS"] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setShippingForm(p => ({ ...p, method: m }))}
                          className={`py-2.5 px-3 rounded-lg border text-sm font-semibold transition ${
                            shippingForm.method === m
                              ? "border-[#0EA5A5] bg-[#0EA5A5]/5 text-[#0EA5A5]"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {m === "STANDARD" ? "Standard (+€5)" : "Express (+€15)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — totals & checkout */}
            {items.length > 0 && (
              <footer className="px-6 py-5 border-t border-gray-100 bg-white">
                {/* Coupon */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value); setCouponResult(null); }}
                        placeholder="Coupon code"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-[#0C2E3D] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0EA5A5]/30 focus:border-[#0EA5A5] transition"
                      />
                    </div>
                    <button
                      onClick={applyCoupon}
                      disabled={!couponCode.trim() || couponChecking}
                      className="bg-[#0C2E3D] hover:bg-[#0a2633] disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                      {couponChecking ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponResult && (
                    <p className={`text-xs mt-1.5 font-medium ${couponResult.valid ? "text-green-600" : "text-red-500"}`}>
                      {couponResult.message}
                    </p>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#0C2E3D]">€{total.toFixed(2)}</span>
                  </div>
                  {couponResult?.valid && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({couponResult.discount}%)</span>
                      <span className="font-medium">-€{(total - discountedTotal).toFixed(2)}</span>
                    </div>
                  )}
                  {hasPhysical && needsShipping && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping ({shippingForm.method.toLowerCase()})</span>
                      <span>+€{shippingForm.method === "EXPRESS" ? "15.00" : "5.00"}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-semibold text-[#0C2E3D]">Total</span>
                    <span className="text-2xl font-bold text-[#0C2E3D]">
                      €{(discountedTotal + (hasPhysical && needsShipping ? (shippingForm.method === "EXPRESS" ? 15 : 5) : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {checkoutErr && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-3">
                    {checkoutErr}
                  </div>
                )}

                <button
                  onClick={checkout}
                  disabled={items.length === 0 || submitting}
                  className="w-full bg-[#F97316] hover:bg-[#ea6c10] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-4 rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-[15px] shadow-[0_4px_14px_rgba(249,115,22,0.3)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)]"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : needsShipping && hasPhysical ? (
                    <><CreditCard className="h-4 w-4" /> Place Order</>
                  ) : (
                    <><ChevronRight className="h-4 w-4" /> {hasPhysical ? "Enter Shipping Details" : "Checkout"}</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                  <span>Secure checkout</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>SSL encrypted</span>
                </div>
              </footer>
            )}
          </aside>
        </div>
      )}

      {/* Slide-in animation */}
      <style jsx global>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </>
  );
}

/* ── Product grid ────────────────────────────────────────── */

function ProductGrid({
  products, items, add, dec, productMap,
}: {
  products: ShopProduct[];
  items: CartItem[];
  add: (key: string, size?: string, option?: string) => void;
  dec: (key: string) => void;
  productMap: Map<string, ShopProduct>;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
      {products.map(p => {
        const inCart = items.find(i => i.productKey === p.productKey)?.qty || 0;
        const imgSrc = getProductImage(p.productKey, p.category, p.mockupUrl);

        return (
          <div
            key={p.id}
            className="group relative bg-white rounded-xl overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col border border-gray-100 hover:border-[#0EA5A5]/25"
          >
            {/* Featured badge */}
            {p.isFeatured && (
              <span className="absolute top-3 right-3 z-10 bg-[#D4A853] text-white text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-full shadow-md">
                Popular
              </span>
            )}

            {/* Product image — real lifestyle photo */}
            <Link href={`/shop/${p.productKey}`} className="block overflow-hidden relative aspect-[4/3]">
              <img
                src={imgSrc}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-5">
                <span className="bg-white/95 backdrop-blur-sm text-[#0C2E3D] text-sm font-semibold px-5 py-2 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  View options →
                </span>
              </div>
            </Link>

            {/* Info */}
            <div className="p-4 sm:p-5 flex flex-col flex-1">
              <Link href={`/shop/${p.productKey}`} className="flex-1">
                <h3 className="font-semibold text-[15px] text-[#0C2E3D] leading-snug group-hover:text-[#0EA5A5] transition-colors duration-200">
                  {p.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1 capitalize">
                  {p.category.replace(/_/g, " ").toLowerCase()}
                </p>
              </Link>

              <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
                <div>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">from</span>
                  <div className="text-lg font-bold text-[#0C2E3D]">
                    €{p.retailPrice.toFixed(p.retailPrice % 1 ? 2 : 0)}
                  </div>
                </div>

                {inCart > 0 ? (
                  <div className="flex items-center gap-1.5 bg-[#0EA5A5]/10 text-[#0EA5A5] rounded-full px-1.5 py-1">
                    <button onClick={() => dec(p.productKey)} className="h-7 w-7 rounded-full hover:bg-[#0EA5A5]/20 flex items-center justify-center transition">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-bold w-5 text-center text-sm">{inCart}</span>
                    <button onClick={() => add(p.productKey)} className="h-7 w-7 rounded-full hover:bg-[#0EA5A5]/20 flex items-center justify-center transition">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => add(p.productKey)}
                    className="bg-[#0C2E3D] hover:bg-[#0a2633] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-md"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
