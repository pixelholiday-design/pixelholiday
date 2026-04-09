"use client";
import { useEffect, useMemo, useState, useTransition, useCallback } from "react";
import { Heart, Camera, MapPin, X, ShoppingBag, LayoutGrid } from "lucide-react";
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

  // Fetch shop catalog when Shop tab first opens
  useEffect(() => {
    if (activeTab !== "shop" || shopProducts.length > 0) return;
    setShopLoading(true);
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((data) => {
        setShopProducts(data.products ?? []);
        setShopCategories(data.categories ?? []);
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
              {/* CSS watermark overlay (always shown on HOOK_ONLY) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
                <span className="text-white/30 font-display text-5xl sm:text-7xl font-bold tracking-widest rotate-[-25deg]">
                  FOTIQO
                </span>
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
  const galleryUrl = typeof window !== "undefined" ? window.location.href : "";

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
            {reel && <ReelOverlay reel={reel} />}
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
                      const previewSrc = hookPhoto
                        ? getPhotoSrc(hookPhoto, isClean)
                        : null;
                      return (
                        <button
                          key={product.id}
                          onClick={() => setPickerProduct(product)}
                          className="group text-left bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-lift transition-all duration-200 hover:-translate-y-1"
                        >
                          {/* Photo mockup */}
                          <div className="relative aspect-[4/3] bg-cream-100 overflow-hidden">
                            {previewSrc && (
                              <ProductCSSMockup
                                type={product.mockupType ?? "default"}
                                src={previewSrc}
                              />
                            )}
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
                              from €{product.price.toFixed(2)}
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
            price: bookBuilderProduct.price,
          } : null}
        />
      )}
    </div>
  );
}

// ── CSS Mockup helper (inline, gallery-only) ──────────────────────────────────
function ProductCSSMockup({ type, src }: { type: string; src: string }) {
  if (type === "print") {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white p-2 shadow-card rounded" style={{ maxWidth: "75%", maxHeight: "75%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="block max-w-full max-h-28 object-contain" />
        </div>
      </div>
    );
  }
  if (type === "canvas") {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div
          className="overflow-hidden rounded"
          style={{
            width: "72%",
            height: "72%",
            transform: "perspective(500px) rotateY(-6deg) rotateX(2deg)",
            boxShadow: "6px 12px 28px -6px rgba(15,27,45,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-black/20 to-transparent" />
        </div>
      </div>
    );
  }
  if (type === "book") {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className="relative overflow-hidden rounded-r"
          style={{
            width: 90,
            height: 115,
            transform: "perspective(500px) rotateY(-10deg)",
            boxShadow: "8px 10px 24px -6px rgba(15,27,45,0.5)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
          <div className="absolute left-0 inset-y-0 w-2 bg-navy-800/60" />
        </div>
      </div>
    );
  }
  // Default: rounded card
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="overflow-hidden rounded-xl shadow-card" style={{ width: "78%", height: "78%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
