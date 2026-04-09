"use client";

import { useState } from "react";
import { X, Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";
import type { CartItem, CartPhoto } from "@/components/gallery/ShopCart";

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
};

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

function ProductMockup({
  product,
  photo,
  isPaid,
}: {
  product: CatalogProduct;
  photo: Photo | null;
  isPaid: boolean;
}) {
  const imgSrc = photo
    ? getPhotoSrc(photo, !!(isPaid || photo?.isPurchased))
    : null;

  const type = product.mockupType ?? "default";

  if (!imgSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center text-navy-300">
        <ShoppingBag className="h-16 w-16 opacity-30" />
      </div>
    );
  }

  if (type === "print") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div
          className="relative bg-white rounded shadow-lift"
          style={{ maxWidth: "80%", maxHeight: "80%" }}
        >
          <div className="p-4 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" className="block max-w-full max-h-[50vh] object-contain rounded-sm" />
          </div>
          <div className="absolute inset-0 rounded pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
        </div>
      </div>
    );
  }

  if (type === "canvas") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div
          className="relative overflow-hidden rounded"
          style={{
            maxWidth: "75%",
            maxHeight: "75%",
            transform: "perspective(800px) rotateY(-8deg) rotateX(3deg)",
            boxShadow: "8px 16px 40px -8px rgba(15,27,45,0.45)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt="" className="block max-w-full max-h-[55vh] object-contain" />
          {/* Canvas wrap edge */}
          <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
        </div>
      </div>
    );
  }

  if (type === "frame") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div
          className="relative bg-gray-800 rounded p-3 shadow-lift"
          style={{ maxWidth: "78%" }}
        >
          <div className="bg-cream-50 p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" className="block max-w-full max-h-[48vh] object-contain" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "mug") {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        <div className="relative" style={{ maxWidth: "60%" }}>
          {/* Mug body */}
          <div
            className="relative bg-white rounded-b-[3rem] rounded-t-2xl overflow-hidden shadow-lift border border-cream-200"
            style={{ width: 200, height: 240 }}
          >
            {/* Photo on mug (curved) */}
            <div
              className="absolute inset-x-4 top-8 bottom-12 overflow-hidden rounded"
              style={{ borderRadius: "4px 4px 8px 8px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Mug sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10 pointer-events-none" />
          </div>
          {/* Handle */}
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
          {/* Book cover */}
          <div
            className="relative overflow-hidden rounded-r-lg shadow-lift"
            style={{ width: 220, height: 280 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />
            {/* Title overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white font-display text-sm leading-tight">{product.name}</p>
            </div>
          </div>
          {/* Spine */}
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
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedPhoto = photos[selectedPhotoIdx] ?? null;
  const sizeExtra = product.sizes?.find((s) => s.label === selectedSize)?.price ?? 0;
  const unitPrice = product.price + sizeExtra;
  const isBook = product.productKey.startsWith("book_");

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
        className="relative w-full sm:max-w-4xl sm:mx-4 bg-white sm:rounded-3xl overflow-hidden shadow-lift flex flex-col sm:flex-row max-h-screen sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 hover:bg-white text-navy-600 shadow transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: mockup preview */}
        <div className="relative sm:w-1/2 bg-cream-100 flex flex-col flex-shrink-0">
          {/* Photo selector strip */}
          <div className="relative overflow-x-auto">
            <div className="flex gap-2 p-3 pb-2">
              {photos.slice(0, 20).map((p, i) => {
                const src = getPhotoSrc(p, !!(isPaid || p.isPurchased));
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhotoIdx(i)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                      i === selectedPhotoIdx
                        ? "border-brand-400 shadow-md"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mockup */}
          <div className="flex-1 flex items-center justify-center min-h-[240px] sm:min-h-[360px] relative">
            <ProductMockup product={product} photo={selectedPhoto} isPaid={isPaid} />

            {/* Photo nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedPhotoIdx((i) => Math.max(0, i - 1))}
                  disabled={selectedPhotoIdx === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/90 hover:bg-white shadow flex items-center justify-center disabled:opacity-30 transition"
                >
                  <ChevronLeft className="h-4 w-4 text-navy-600" />
                </button>
                <button
                  onClick={() => setSelectedPhotoIdx((i) => Math.min(photos.length - 1, i + 1))}
                  disabled={selectedPhotoIdx === photos.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-white/90 hover:bg-white shadow flex items-center justify-center disabled:opacity-30 transition"
                >
                  <ChevronRight className="h-4 w-4 text-navy-600" />
                </button>
              </>
            )}
          </div>

          {/* Photo counter */}
          <p className="text-center text-xs text-navy-400 pb-3">
            Photo {selectedPhotoIdx + 1} of {photos.length}
          </p>
        </div>

        {/* Right: product details */}
        <div className="sm:w-1/2 flex flex-col overflow-y-auto p-6 sm:p-8 gap-5">
          {/* Badge */}
          {product.badge && (
            <span className="inline-flex self-start text-xs font-bold uppercase tracking-widest text-gold-600 bg-gold-400/15 rounded-full px-3 py-1">
              {product.badge}
            </span>
          )}

          {/* Name & description */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-navy-900 leading-tight">{product.name}</h2>
            <p className="text-navy-500 mt-2 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Size selector */}
          {product.sizes && product.sizes.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedSize === s.label
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-navy-700 border-cream-300 hover:border-navy-300"
                    }`}
                  >
                    {s.label}
                    {s.price ? <span className="text-xs opacity-70 ml-1">+€{s.price}</span> : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book note */}
          {isBook && (
            <div className="bg-cream-100 rounded-2xl p-4 text-sm text-navy-600">
              <p className="font-semibold text-navy-800 mb-1">Build your photo book</p>
              <p>Select your photos, choose a layout, and customise the cover. Takes about 2 minutes.</p>
            </div>
          )}

          {/* Quantity */}
          {!isBook && (
            <div>
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl border border-cream-300 flex items-center justify-center hover:bg-cream-100 transition"
                >
                  <Minus className="h-4 w-4 text-navy-600" />
                </button>
                <span className="font-display text-xl text-navy-900 w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="w-9 h-9 rounded-xl border border-cream-300 flex items-center justify-center hover:bg-cream-100 transition"
                >
                  <Plus className="h-4 w-4 text-navy-600" />
                </button>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-display text-3xl text-navy-900">
                €{(unitPrice * qty).toFixed(2)}
              </span>
              {!isBook && qty > 1 && (
                <span className="text-sm text-navy-400">€{unitPrice.toFixed(2)} each</span>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={added}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-base transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : "bg-navy-900 hover:bg-navy-800 text-white hover:scale-[1.02]"
              }`}
            >
              {added ? (
                "Added to cart!"
              ) : isBook ? (
                <>Build your book →</>
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
