"use client";
import { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { Heart, Camera, MapPin, X, ShoppingBag, LayoutGrid, BookOpen, Film } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";
import { toggleFavorite } from "./actions";
import BookingTimePicker from "./BookingTimePicker";
import StripeCheckoutButton from "@/components/gallery/StripeCheckoutButton";
import DownloadAllButton from "@/components/gallery/DownloadAllButton";
import FomoTimer from "@/components/gallery/FomoTimer";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Lightbox from "@/components/gallery/Lightbox";
import ShareMenu from "@/components/gallery/ShareMenu";
import ReelOverlay, { type ReelInfo } from "./ReelOverlay";
import MagicShotModal from "./MagicShotModal";
import ShopCart, { type CartItem } from "@/components/gallery/ShopCart";
import ProductPickerModal from "./ProductPickerModal";
import BookBuilder from "./BookBuilder";
import LiveGalleryStream from "@/components/gallery/LiveGalleryStream";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n-client";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isHookImage: boolean;
  isFavorited: boolean;
  isPurchased: boolean;
  isMagicShot?: boolean;
  parentPhotoId?: string | null;
  _signedWm?: string;
  _signedClean?: string;
};

type Gallery = {
  id: string;
  magicLinkToken: string;
  status: "HOOK_ONLY" | "PREVIEW_ECOM" | "PAID" | "PARTIAL_PAID" | "DIGITAL_PASS" | "EXPIRED";
  expiresAt: string | Date;
  coverMessage: string | null;
  photos: Photo[];
  customer: { name: string | null };
  photographer: { name: string };
  location: { name: string };
};

type CatalogProduct = {
  id: string;
  productKey: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  badge?: string;
  mockupType?: string;
  sizes?: { label: string; price?: number }[];
  category?: string;
};

type ActiveTab = "photos" | "favorites" | "shop";

export default function GalleryView({ gallery, reel }: { gallery: Gallery; reel?: ReelInfo | null }) {
  const tGallery = useTranslations("gallery");
  const tCommon = useTranslations("common");
  const tShop = useTranslations("shop");
  const tFooter = useTranslations("footer");
  const [activeTab, setActiveTab] = useState<ActiveTab>("photos");
  const [favOnly, setFavOnly] = useState(false);
  const [favDrawerOpen, setFavDrawerOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const [extraPhotos, setExtraPhotos] = useState<Photo[]>([]);
  const [magicForId, setMagicForId] = useState<string | null>(null);

  // Shop state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shopProducts, setShopProducts] = useState<CatalogProduct[]>([]);
  const [shopCategories, setShopCategories] = useState<{ key: string; label: string }[]>([]);
  const [shopCat, setShopCat] = useState("ALL");
  const [shopLoading, setShopLoading] = useState(false);
  const [pickerProduct, setPickerProduct] = useState<CatalogProduct | null>(null);
  const [bookBuilderOpen, setBookBuilderOpen] = useState(false);
  const [bookBuilderProduct, setBookBuilderProduct] = useState<CatalogProduct | null>(null);

  // AI Auto-book state
  const [autoBookData, setAutoBookData] = useState<any>(null);
  const [autoBookDismissed, setAutoBookDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Live stream: add new photos as they arrive from the photographer
  const handleNewLivePhotos = useCallback((livePhotos: { id: string; thumbnailUrl: string; fullUrl: string; isHookImage: boolean; createdAt: string }[]) => {
    setExtraPhotos((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const fresh = livePhotos
        .filter((lp) => !existingIds.has(lp.id) && !gallery.photos.some((gp) => gp.id === lp.id))
        .map((lp) => ({
          id: lp.id,
          s3Key_highRes: lp.thumbnailUrl,
          cloudinaryId: null,
          isHookImage: lp.isHookImage,
          isFavorited: false,
          isPurchased: false,
          isMagicShot: false,
          parentPhotoId: null,
        }));
      return [...fresh, ...prev];
    });
  }, [gallery.photos]);

  // Check if gallery qualifies for AI auto-book (10+ photos)
  useEffect(() => {
    if (gallery.photos.length < 10 || autoBookDismissed || autoBookData) return;
    fetch(`/api/gallery/${gallery.magicLinkToken}/auto-book`)
      .then((r) => r.json())
      .then((d) => { if (d.ok && d.eligible) setAutoBookData(d); })
      .catch(() => {});
  }, [gallery.photos.length, gallery.magicLinkToken, autoBookDismissed, autoBookData]);

  // Fetch shop catalog when Shop tab first opens
  useEffect(() => {
    if (activeTab !== "shop" || shopProducts.length > 0) return;
    setShopLoading(true);
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((data) => {
        // Map API shape (retailPrice, sizes as JSON string) to client shape
        const mapped = (data.products ?? []).map((p: any) => ({
          ...p,
          price: p.retailPrice ?? p.price ?? 0,
          sizes: (typeof p.sizes === "string" ? (() => { try { return JSON.parse(p.sizes); } catch { return []; } })() : (p.sizes ?? [])).map((s: any) => ({ ...s, label: s.label || s.name || s.key || "", price: s.price ?? s.cost ?? s.costAddon ?? 0 })),
          options: (typeof p.options === "string" ? (() => { try { return JSON.parse(p.options); } catch { return []; } })() : (p.options ?? [])).map((o: any) => ({ ...o, label: o.label || o.name || o.key || "" })),
          papers: typeof p.papers === "string" ? (() => { try { return JSON.parse(p.papers); } catch { return []; } })() : (p.papers ?? []),
          frames: typeof p.frames === "string" ? (() => { try { return JSON.parse(p.frames); } catch { return []; } })() : (p.frames ?? []),
          finishes: typeof p.finishes === "string" ? (() => { try { return JSON.parse(p.finishes); } catch { return []; } })() : (p.finishes ?? []),
        }));
        setShopProducts(mapped);
        setShopCategories(
          (data.categories ?? []).map((c: any) =>
            typeof c === "string" ? { key: c, label: c.replace(/_/g, " ") } : c
          )
        );
      })
      .catch(() => {})
      .finally(() => setShopLoading(false));
  }, [activeTab, shopProducts.length]);

  // Cart helpers
  const addToCart = useCallback((item: Omit<CartItem, "id">) => {
    setCartItems((prev) => [...prev, { ...item, id: `${Date.now()}-${Math.random()}` }]);
  }, []);

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeCartItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const allPhotos = useMemo(
    () => [...gallery.photos, ...extraPhotos],
    [gallery.photos, extraPhotos],
  );
  const photos = useMemo(
    () => (favOnly ? allPhotos.filter((p) => p.isFavorited) : allPhotos),
    [favOnly, allPhotos]
  );
  const magicSourcePhoto = magicForId ? allPhotos.find((p) => p.id === magicForId) : null;
  const favCount = gallery.photos.filter((p) => p.isFavorited).length;
  const hookPhoto = gallery.photos.find((p) => p.isHookImage) || gallery.photos[0];

  // Track view once on mount
  useEffect(() => {
    fetch(`/api/gallery/${gallery.magicLinkToken}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "view" }),
    }).catch(() => {});
  }, [gallery.magicLinkToken]);

  function handleFav(id: string) {
    startTransition(() => {
      toggleFavorite(id, gallery.magicLinkToken);
    });
  }

  // ── HOOK_ONLY ──
  if (gallery.status === "HOOK_ONLY") {
    return (
      <div className="min-h-screen bg-navy-900 text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-resort-pattern opacity-40" />
          <header className="relative z-10 max-w-4xl mx-auto px-6 pt-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 mb-3">
              <Camera className="h-3.5 w-3.5" /> Fotiqo
            </div>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight">{tGallery("sneakPeek")}</h1>
            <p className="text-white/70 mt-3 inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> {gallery.location.name} · Captured by {gallery.photographer.name}
            </p>
          </header>
          <div className="relative z-10 max-w-3xl mx-auto px-6 mt-10">
            <div className="rounded-2xl overflow-hidden shadow-lift ring-1 ring-white/10 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPhotoSrc(hookPhoto, false)} alt="" className="w-full block" />
              {/* CSS watermark overlay (always shown on HOOK_ONLY) — large repeating */}
              <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
                <div className="absolute inset-[-50%] flex flex-col items-center justify-center gap-20 rotate-[-30deg]">
                  {[0,1,2,3,4].map((row) => (
                    <div key={row} className="flex items-center gap-16 whitespace-nowrap">
                      {[0,1,2,3].map((col) => (
                        <span key={col} className="text-white/30 font-display text-5xl sm:text-7xl font-bold tracking-[0.2em]">FOTIQO</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex justify-center"><FomoTimer expiresAt={gallery.expiresAt} /></div>
          <div className="mt-10 card p-8 text-navy-900">
            <h2 className="heading text-2xl mb-1">{tGallery("bookViewing")}</h2>
            <p className="text-sm text-navy-400 mb-6">{tGallery("bookViewingDesc")}</p>
            <BookingTimePicker token={gallery.magicLinkToken} />
          </div>
        </div>
      </div>
    );
  }

  const isClean = gallery.status === "PAID" || gallery.status === "DIGITAL_PASS";
  const isPartial = gallery.status === "PARTIAL_PAID";
  const galleryUrl = mounted ? window.location.href : "";

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Cover hero */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPhotoSrc(hookPhoto, true)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/40 via-navy-900/10 to-navy-900/95" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center text-white px-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold-400 mb-2">
            <Camera className="h-3 w-3" /> Fotiqo
          </div>
          <h1 className="font-display text-5xl sm:text-6xl leading-none mb-3 text-balance">{gallery.location.name}</h1>
          <p className="text-white/80">
            Captured by {gallery.photographer.name} · {gallery.photos.length} photos
          </p>
          {gallery.coverMessage && (
            <p className="text-white/70 italic mt-3 max-w-xl text-balance">"{gallery.coverMessage}"</p>
          )}
        </div>
      </section>

      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-cream-300/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="font-display text-lg text-navy-900">{gallery.location.name}</div>
          <div className="flex items-center gap-2">
            <LiveGalleryStream
              galleryToken={gallery.magicLinkToken}
              onNewPhotos={handleNewLivePhotos}
            />
            {activeTab === "photos" && (
              <>
                <button
                  onClick={() => setFavDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-white border border-cream-300 text-navy-600 hover:bg-cream-100 transition"
                >
                  <Heart className={`h-3.5 w-3.5 ${favCount > 0 ? "fill-coral-500 text-coral-500" : ""}`} />
                  {favCount} {tGallery("favorites").toLowerCase()}
                </button>
                <button
                  onClick={() => setFavOnly((v) => !v)}
                  className={`text-xs font-semibold rounded-xl px-3 py-2 transition ${
                    favOnly ? "bg-coral-500 text-white" : "bg-white border border-cream-300 text-navy-600"
                  }`}
                >
                  {favOnly ? tGallery("showAll") : tGallery("filterFavs")}
                </button>
              </>
            )}
            {reel && (
              <ReelOverlay
                reel={reel}
                onBuyReel={() => {
                  addToCart({
                    productKey: "video_reel",
                    productName: "Video Reel",
                    price: 10,
                    currency: "EUR",
                    qty: 1,
                  });
                }}
              />
            )}
            <ShareMenu url={galleryUrl} title={`Fotiqo — ${gallery.location.name}`} />
            {isClean && activeTab === "photos" && <DownloadAllButton token={gallery.magicLinkToken} />}
            <LanguageSwitcher />
          </div>
        </div>
        {/* Tab bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-1">
          <div className="flex items-center gap-1 border-b border-cream-200">
            {(
              [
                { key: "photos", label: `${tGallery("photos")}`, icon: LayoutGrid },
                { key: "favorites", label: `${tGallery("favorites")}${favCount > 0 ? ` (${favCount})` : ""}`, icon: Heart },
                { key: "shop", label: tGallery("shop"), icon: ShoppingBag },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key as ActiveTab);
                  if (key === "favorites") setFavOnly(true);
                  if (key === "photos") setFavOnly(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${
                  activeTab === key
                    ? "border-navy-900 text-navy-900"
                    : "border-transparent text-navy-400 hover:text-navy-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
          <FomoTimer expiresAt={gallery.expiresAt} />
        </div>
      </header>

      {/* ── AI AUTO-BOOK BANNER ── */}
      {mounted && autoBookData && !autoBookDismissed && activeTab === "photos" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="relative bg-gradient-to-r from-brand-700 via-brand-600 to-coral-500 rounded-2xl p-5 sm:p-6 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 mb-1">
                  <BookOpen className="h-3 w-3" /> AI Photo Book
                </div>
                <h3 className="font-display text-xl sm:text-2xl leading-tight">
                  Your holiday memories — ready as a photo book
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  AI selected your {autoBookData.autoBook?.photoCount || gallery.photos.length} best photos and arranged them into a beautiful {autoBookData.autoBook?.config?.pageCount || 20}-page book.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setBookBuilderOpen(true);
                    setAutoBookDismissed(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-white text-brand-700 font-semibold text-sm hover:bg-white/90 transition shadow-card whitespace-nowrap"
                >
                  ✨ Preview AI book — €{autoBookData.autoBook?.price || 69}
                </button>
                <button
                  onClick={() => {
                    setBookBuilderOpen(true);
                    setAutoBookDismissed(true);
                  }}
                  className="px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition whitespace-nowrap"
                >
                  📖 Build manually
                </button>
                <button
                  onClick={() => setAutoBookDismissed(true)}
                  className="px-3 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-sm transition"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTOS TAB ── */}
      {(activeTab === "photos" || activeTab === "favorites") && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
          <GalleryGrid
            photos={activeTab === "favorites" ? allPhotos.filter((p) => p.isFavorited) : photos}
            isPaid={isClean}
            isPartial={isPartial}
            onOpen={(i) => setLbIdx(i)}
            onFavorite={handleFav}
            onMagic={(id) => setMagicForId(id)}
          />
        </main>
      )}

      {/* ── SHOP TAB ── */}
      {activeTab === "shop" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
          {shopLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Category chips — scrollable on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-1 px-1">
                {[
                  { key: "ALL",            label: "All" },
                  { key: "DIGITAL",        label: "Digital" },
                  { key: "PRINT",          label: "Prints" },
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
                ]
                  .filter((cat) =>
                    cat.key === "ALL" ||
                    shopProducts.some((p) => p.category === cat.key)
                  )
                  .map((cat) => {
                    const count = cat.key === "ALL"
                      ? shopProducts.length
                      : shopProducts.filter((p) => p.category === cat.key).length;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setShopCat(cat.key)}
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                          shopCat === cat.key
                            ? "bg-navy-900 text-white"
                            : "bg-white border border-cream-300 text-navy-600 hover:bg-cream-100"
                        }`}
                      >
                        {cat.label}
                        {count > 0 && (
                          <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                            shopCat === cat.key ? "bg-white/20 text-white" : "bg-cream-200 text-navy-500"
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* AI/Manual Photo Book + Video Reel featured cards */}
              {shopCat === "ALL" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {/* AI Photo Book — requires 10+ photos */}
                  {gallery.photos.length >= 10 && (
                    <button
                      onClick={() => { setBookBuilderOpen(true); }}
                      className="group text-left bg-gradient-to-r from-brand-700 to-brand-600 rounded-2xl p-5 text-white hover:shadow-lift transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-1">
                        <BookOpen className="h-3 w-3" /> AI Auto-Build
                      </div>
                      <div className="font-display text-xl">Photo Book</div>
                      <p className="text-white/70 text-sm mt-1">AI selected your best {gallery.photos.length} photos into a 20-page book</p>
                      <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                        ✨ Preview AI book — from €39
                      </div>
                    </button>
                  )}
                  {/* Manual Photo Book — always available */}
                  <button
                    onClick={() => { setBookBuilderOpen(true); }}
                    className="group text-left bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-5 text-white hover:shadow-lift transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-1">
                      <BookOpen className="h-3 w-3" /> Build Your Own
                    </div>
                    <div className="font-display text-xl">Custom Photo Book</div>
                    <p className="text-white/70 text-sm mt-1">Pick your favourite photos and arrange them into a personalised book</p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                      📖 Build manually — from €39
                    </div>
                  </button>
                  {/* Video Reel */}
                  {reel && (
                    <button
                      onClick={() => {
                        const reelBtn = document.querySelector("[data-reel-trigger]") as HTMLElement;
                        if (reelBtn) reelBtn.click();
                      }}
                      className="group text-left bg-gradient-to-r from-coral-500 to-coral-400 rounded-2xl p-5 text-white hover:shadow-lift transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 mb-1">
                        <Film className="h-3 w-3" /> Video
                      </div>
                      <div className="font-display text-xl">Your Holiday Reel</div>
                      <p className="text-white/70 text-sm mt-1">{reel.duration}s video of your best moments — share or download</p>
                      <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                        🎬 Watch & Buy — €10
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Product grid */}
              {shopProducts.length === 0 ? (
                <div className="text-center py-20 text-navy-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {shopProducts
                    .filter((p) => {
                      if (shopCat === "ALL") return true;
                      // PRINT is the canonical key; also accept legacy PRINTS
                      if (shopCat === "PRINT") return p.category === "PRINT" || p.category === "PRINTS";
                      return p.category === shopCat;
                    })
                    .map((product) => {
                      const customerPhoto = hookPhoto
                        ? getPhotoSrc(hookPhoto, isClean)
                        : null;
                      return (
                        <button
                          key={product.id}
                          onClick={() => setPickerProduct(product)}
                          className="group text-left bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lift transition-all duration-200 hover:-translate-y-1"
                        >
                          {/* Product with customer photo composited on it */}
                          <div className="relative aspect-[4/3] bg-cream-50 overflow-hidden">
                            <ProductCSSMockup
                              type={inferMockupType(product)}
                              src={customerPhoto || ""}
                            />
                            {product.badge && (
                              <span className="absolute top-2 left-2 text-xs font-bold text-gold-600 bg-white/90 backdrop-blur rounded-full px-2 py-0.5 shadow">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-3">
                            <p className="font-semibold text-navy-900 text-sm leading-tight">{product.name}</p>
                            <p className="text-xs text-navy-400 mt-0.5 line-clamp-1">{product.description}</p>
                            <p className="text-sm font-display text-navy-900 mt-1.5">
                              from €{(product.price ?? (product as any).retailPrice ?? 0).toFixed(2)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {(gallery.status === "PREVIEW_ECOM" || isPartial) && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-navy-900 via-navy-900/95 to-navy-900/80 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="text-white">
              <div className="font-display text-xl sm:text-2xl leading-tight">{tGallery("unlockMemories")}</div>
              <div className="text-white/60 text-xs sm:text-sm">
                {tGallery("fullResolution")}
              </div>
              <a
                href="/shop"
                className="mt-1 inline-flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 underline underline-offset-2 transition"
              >
                {tGallery("wantPrints")} →
              </a>
            </div>
            <StripeCheckoutButton token={gallery.magicLinkToken} />
          </div>
        </div>
      )}

      {/* Footer with legal links */}
      <footer className="border-t border-cream-300/70 bg-white/60 mt-8 mb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-2 text-xs text-navy-400">
          <div>{tFooter("copyright", { year: String(new Date().getFullYear()) })}</div>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-coral-600">{tFooter("privacy")}</a>
            <a href="/terms" className="hover:text-coral-600">{tFooter("terms")}</a>
            <a href="mailto:support@fotiqo.com" className="hover:text-coral-600">{tFooter("contact")}</a>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lbIdx !== null && (
        <Lightbox
          photos={photos}
          startIndex={lbIdx}
          onClose={() => setLbIdx(null)}
          onFavorite={handleFav}
          isPaid={isClean}
          isPartial={isPartial}
          token={gallery.magicLinkToken}
        />
      )}

      {/* Favorites drawer */}
      {favDrawerOpen && (
        <div className="fixed inset-0 z-40 flex" onClick={() => setFavDrawerOpen(false)}>
          <div className="flex-1 bg-black/40" />
          <aside className="w-full max-w-sm bg-cream-100 h-full shadow-lift overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-cream-300 flex items-center justify-between">
              <h3 className="heading text-xl">{tGallery("favorites")}</h3>
              <button onClick={() => setFavDrawerOpen(false)} className="btn-ghost"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5">
              {favCount === 0 ? (
                <p className="text-sm text-navy-400">Tap any heart to start favoriting.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.photos.filter((p) => p.isFavorited).map((p) => (
                    <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPhotoSrc(p, isClean || (isPartial && p.isPurchased))}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Magic shot modal */}
      {magicSourcePhoto && (
        <MagicShotModal
          photo={magicSourcePhoto}
          onClose={() => setMagicForId(null)}
          onSaved={(newPhoto: Photo) =>
            setExtraPhotos((prev) => [
              ...prev,
              {
                ...newPhoto,
                isFavorited: false,
                isPurchased: false,
                isHookImage: false,
                isMagicShot: true,
              },
            ])
          }
        />
      )}

      {/* Shop Cart — always accessible */}
      <ShopCart
        items={cartItems}
        onUpdateQty={updateCartQty}
        onRemove={removeCartItem}
        onClear={clearCart}
        galleryToken={gallery.magicLinkToken}
        isPaid={isClean}
      />

      {/* Product Picker Modal */}
      {pickerProduct && (
        <ProductPickerModal
          product={pickerProduct}
          photos={allPhotos}
          isPaid={isClean}
          onClose={() => setPickerProduct(null)}
          onAddToCart={addToCart}
          onOpenBookBuilder={(product) => {
            setBookBuilderProduct(product);
            setBookBuilderOpen(true);
          }}
        />
      )}

      {/* Book Builder */}
      {bookBuilderOpen && (
        <BookBuilder
          photos={allPhotos}
          isPaid={isClean}
          onClose={() => { setBookBuilderOpen(false); setBookBuilderProduct(null); }}
          onAddToCart={addToCart}
          initialProduct={bookBuilderProduct ? {
            key: bookBuilderProduct.productKey,
            name: bookBuilderProduct.name,
            price: bookBuilderProduct.price ?? (bookBuilderProduct as any).retailPrice ?? 0,
          } : null}
          aiSelectedPhotoIds={
            !bookBuilderProduct && autoBookData?.autoBook?.photoIds
              ? autoBookData.autoBook.photoIds
              : undefined
          }
        />
      )}
    </div>
  );
}

// ── CSS Mockup helper (inline, gallery-only) ──────────────────────────────────
/** Map product name/category to mockup type */
function inferMockupType(product: { name?: string; category?: string; mockupType?: string; productKey?: string }): string {
  if (product.mockupType) return product.mockupType;
  const n = (product.name || "").toLowerCase();
  const k = (product.productKey || "").toLowerCase();
  if (k.startsWith("book_") || n.includes("book") || n.includes("album") || n.includes("journal")) return "book";
  if (n.includes("canvas") || n.includes("thin canvas")) return "canvas";
  if (n.includes("framed") || n.includes("frame")) return "frame";
  if (n.includes("poster") || (n.includes("print") && !n.includes("pillow"))) return "print";
  if (n.includes("metal print") || n.includes("acrylic") || n.includes("glossy metal")) return "metal";
  if (n.includes("mug") || n.includes("tumbler") || n.includes("latte")) return "mug";
  if (n.includes("puzzle")) return "puzzle";
  if (n.includes("pillow") || n.includes("cushion")) return "pillow";
  if (n.includes("blanket")) return "blanket";
  if (n.includes("ornament") || n.includes("magnet")) return "ornament";
  if (n.includes("calendar")) return "calendar";
  if (n.includes("postcard") || n.includes("greeting") || n.includes("card")) return "card";
  if (n.includes("coaster") || n.includes("mouse pad") || n.includes("mousepad")) return "coaster";
  if (n.includes("water bottle") || n.includes("bottle")) return "bottle";
  return "default";
}

/**
 * CSS product mockup — renders customer's photo ON the product shape.
 * Like Pixieset/Zno: instant client-side compositing, no API call.
 */
function ProductCSSMockup({ type, src }: { type: string; src: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream-100 to-cream-200">
        <ShoppingBag className="h-10 w-10 text-navy-200" />
      </div>
    );
  }

  /* eslint-disable @next/next/no-img-element */

  if (type === "print" || type === "poster") {
    // Photo print on wall with white mat border
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8ddd3 0%, #d4c8b8 100%)" }}>
        <div className="bg-white p-[6px] sm:p-2" style={{ boxShadow: "4px 6px 20px rgba(0,0,0,0.25)", width: "70%", height: "78%" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }
  if (type === "frame") {
    // Framed print — dark wood frame
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8ddd3 0%, #d4c8b8 100%)" }}>
        <div className="bg-[#3d2b1f] p-[6px] sm:p-2 rounded-sm" style={{ boxShadow: "6px 8px 24px rgba(0,0,0,0.35)", width: "68%", height: "76%" }}>
          <div className="bg-white p-[4px] sm:p-1.5 w-full h-full">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }
  if (type === "canvas") {
    // Gallery-wrapped canvas on wall — 3D perspective
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8ddd3 0%, #d4c8b8 100%)" }}>
        <div className="relative overflow-hidden" style={{ width: "72%", height: "76%", transform: "perspective(600px) rotateY(-5deg)", boxShadow: "8px 12px 30px rgba(0,0,0,0.35)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-[6px] bg-gradient-to-l from-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[6px] bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    );
  }
  if (type === "metal") {
    // Glossy metal print with sheen
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 50%, #a0a0a0 100%)" }}>
        <div className="overflow-hidden" style={{ width: "70%", height: "74%", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
          <img src={src} alt="" className="w-full h-full object-cover brightness-105 contrast-105 saturate-110" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
        </div>
      </div>
    );
  }
  if (type === "book") {
    // 3D photo book with spine
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0e6d8 0%, #e0d4c4 100%)" }}>
        <div className="relative overflow-hidden rounded-r-sm" style={{ width: "50%", height: "70%", transform: "perspective(500px) rotateY(-12deg)", boxShadow: "10px 12px 30px rgba(0,0,0,0.4)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" style={{ width: "15%" }} />
          <div className="absolute left-0 inset-y-0 w-[5px] bg-[#3d2b1f]" />
          <div className="absolute bottom-3 inset-x-0 text-center text-[8px] text-white font-bold tracking-wider" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>PHOTO BOOK</div>
        </div>
      </div>
    );
  }
  if (type === "mug") {
    // Mug with photo wrapped around
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="relative" style={{ width: 110, height: 90 }}>
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: "6px 6px 16px 16px", boxShadow: "3px 6px 16px rgba(0,0,0,0.2)" }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -right-[12px] top-[12px] w-[14px] h-[46px] border-[3px] border-[#c8bca8] rounded-r-full bg-transparent" />
          <div className="absolute inset-0 rounded-[6px_6px_16px_16px] ring-1 ring-black/10" />
        </div>
      </div>
    );
  }
  if (type === "puzzle") {
    // Jigsaw puzzle with grid overlay
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8e0d4 0%, #d8cfc0 100%)" }}>
        <div className="overflow-hidden rounded-sm relative" style={{ width: "72%", height: "72%", boxShadow: "3px 5px 15px rgba(0,0,0,0.2)", transform: "rotate(-2deg)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)", backgroundSize: "20% 25%" }} />
        </div>
      </div>
    );
  }
  if (type === "pillow") {
    // Throw pillow
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="overflow-hidden" style={{ width: "68%", height: "68%", borderRadius: "22%", boxShadow: "4px 8px 20px rgba(0,0,0,0.18)", transform: "rotate(-3deg)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }
  if (type === "blanket") {
    // Throw blanket draped
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e0d8cc 100%)" }}>
        <div className="overflow-hidden" style={{ width: "82%", height: "72%", borderRadius: "8px", boxShadow: "3px 6px 15px rgba(0,0,0,0.15)", transform: "rotate(1deg) perspective(400px) rotateX(4deg)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      </div>
    );
  }
  if (type === "ornament") {
    // Round ornament with loop
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="flex flex-col items-center">
          <div className="w-[10px] h-[14px] border-2 border-[#c4a94d] rounded-t-full mb-[-3px]" />
          <div className="overflow-hidden" style={{ width: 80, height: 80, borderRadius: "50%", boxShadow: "2px 5px 16px rgba(0,0,0,0.25)", border: "2px solid rgba(196,169,77,0.3)" }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }
  if (type === "calendar") {
    // Wall calendar
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="bg-white rounded shadow-card overflow-hidden" style={{ width: "65%", height: "82%", boxShadow: "2px 4px 12px rgba(0,0,0,0.15)" }}>
          <img src={src} alt="" className="w-full h-[60%] object-cover" />
          <div className="px-2 py-1.5 border-t border-cream-200">
            <div className="text-[8px] font-bold text-coral-500 uppercase tracking-wider">2026</div>
            <div className="grid grid-cols-7 gap-px mt-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="text-[5px] text-navy-400 text-center">{i + 1}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "card") {
    // Greeting card / postcard
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="bg-white rounded shadow-card overflow-hidden" style={{ width: "60%", height: "72%", transform: "rotate(-4deg)", boxShadow: "3px 5px 14px rgba(0,0,0,0.18)" }}>
          <img src={src} alt="" className="w-full h-[72%] object-cover" />
          <div className="px-2 py-1.5 text-center">
            <div className="text-[7px] text-navy-500 font-medium italic">Wish you were here!</div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "coaster") {
    // Round coaster
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="overflow-hidden" style={{ width: 85, height: 85, borderRadius: "50%", boxShadow: "2px 4px 12px rgba(0,0,0,0.2)" }}>
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }
  if (type === "bottle") {
    // Water bottle
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
        <div className="relative flex flex-col items-center">
          <div className="w-[24px] h-[12px] bg-[#e0d8cc] rounded-t-lg" />
          <div className="overflow-hidden" style={{ width: 50, height: 95, borderRadius: "6px", boxShadow: "2px 4px 12px rgba(0,0,0,0.2)" }}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    );
  }
  // Default: photo in elegant card
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f5f0ea 0%, #e8e0d4 100%)" }}>
      <div className="overflow-hidden rounded-lg" style={{ width: "75%", height: "75%", boxShadow: "3px 6px 16px rgba(0,0,0,0.2)" }}>
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
  /* eslint-enable @next/next/no-img-element */
}
