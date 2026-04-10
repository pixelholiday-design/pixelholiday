"use client";

import { useState } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, Truck, CreditCard, ChevronRight } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";

export type CartPhoto = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

export type CartItem = {
  id: string; // unique cart line id
  productKey: string;
  productName: string;
  price: number;
  currency: string;
  qty: number;
  size?: string;
  option?: string;
  photo?: CartPhoto;
  isBook?: boolean;
  bookConfig?: {
    type: string;
    cover: string;
    pageCount: number;
    photoCount: number;
    photoIds?: string[];
  };
};

type ShippingForm = {
  name: string;
  address: string;
  city: string;
  country: string;
  postal: string;
  phone: string;
};

const PHYSICAL_KEYS = new Set([
  "print_4x6", "print_5x7", "print_8x10", "print_a4",
  "canvas_30x40",
  "book_softcover", "book_hardcover", "book_layflat",
  "waterproof_usb",
]);

function isPhysical(productKey: string) {
  return PHYSICAL_KEYS.has(productKey);
}

export default function ShopCart({
  items,
  onUpdateQty,
  onRemove,
  onClear,
  galleryToken,
  isPaid,
}: {
  items: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  galleryToken: string;
  isPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [shipping, setShipping] = useState<ShippingForm>({
    name: "", address: "", city: "", country: "", postal: "", phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);

  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = couponResult?.valid ? subtotal * (couponResult.discount / 100) : 0;
  const hasPhysical = items.some((i) => isPhysical(i.productKey));
  const shippingCost = hasPhysical ? 5 : 0;
  const total = subtotal - discountAmt + shippingCost;

  async function checkCoupon() {
    if (!coupon.trim()) return;
    setCouponChecking(true);
    setCouponResult(null);
    try {
      const res = await fetch(`/api/shop/coupon?code=${encodeURIComponent(coupon.trim())}`);
      const data = await res.json();
      setCouponResult(data);
    } catch {
      setCouponResult({ valid: false, discount: 0, message: "Could not validate coupon." });
    } finally {
      setCouponChecking(false);
    }
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckoutErr(null);
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productKey: i.productKey,
          qty: i.qty,
          size: i.size,
          option: i.option,
          photoId: i.photo?.id,
          // Book-specific fields
          ...(i.isBook && i.bookConfig ? {
            bookPages: i.bookConfig.pageCount,
            bookCoverType: `${i.bookConfig.type}_${i.bookConfig.cover}`,
            bookPhotoIds: i.bookConfig.photoIds || [],
          } : {}),
        })),
        shipping: hasPhysical ? shipping : undefined,
        couponCode: couponResult?.valid ? coupon.trim() : undefined,
        galleryToken,
      };
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.mock) {
        alert(data.message || "Order placed (demo mode).");
        onClear();
        setOpen(false);
      } else {
        setCheckoutErr(data.error || "Checkout failed. Please try again.");
      }
    } catch {
      setCheckoutErr("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating cart button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white rounded-2xl px-4 py-3 shadow-lift transition-all duration-200 hover:scale-105"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-5 w-5" />
        <span className="text-sm font-semibold">Cart</span>
        {itemCount > 0 && (
          <span className="flex items-center justify-center bg-coral-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 -mr-1">
            {itemCount}
          </span>
        )}
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpen(false)}>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" />
          <aside
            className="w-full max-w-md bg-white h-full flex flex-col shadow-lift overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "slideInRight 0.3s ease-out" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-300">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-navy-600" />
                <h2 className="font-display text-xl text-navy-900">Your Cart</h2>
                {itemCount > 0 && (
                  <span className="bg-cream-200 text-navy-600 text-xs font-semibold rounded-full px-2 py-0.5">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-cream-100 transition">
                <X className="h-5 w-5 text-navy-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-navy-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add products from the Shop tab</p>
                </div>
              ) : (
                items.map((item) => {
                  const imgSrc = item.photo
                    ? getPhotoSrc(item.photo, !!(isPaid || item.photo?.isPurchased))
                    : null;
                  return (
                    <div key={item.id} className="flex gap-3 bg-cream-100 rounded-2xl p-3">
                      {/* Photo thumb */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-navy-300">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 text-sm truncate">{item.productName}</p>
                        {(item.size || item.option) && (
                          <p className="text-xs text-navy-400 mt-0.5">
                            {[item.size, item.option].filter(Boolean).join(" · ")}
                          </p>
                        )}
                        {item.isBook && item.bookConfig && (
                          <p className="text-xs text-navy-400 mt-0.5">
                            {item.bookConfig.pageCount}pp · {item.bookConfig.photoCount} photos · {item.bookConfig.cover}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white border border-cream-300 flex items-center justify-center hover:bg-cream-200 transition"
                            >
                              <Minus className="h-3 w-3 text-navy-600" />
                            </button>
                            <span className="text-sm font-semibold text-navy-900 w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-white border border-cream-300 flex items-center justify-center hover:bg-cream-200 transition"
                            >
                              <Plus className="h-3 w-3 text-navy-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base text-navy-900">
                              €{(item.price * item.qty).toFixed(2)}
                            </span>
                            <button
                              onClick={() => onRemove(item.id)}
                              className="text-navy-300 hover:text-coral-500 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: coupon + summary + shipping + checkout */}
            {items.length > 0 && (
              <div className="border-t border-cream-300 px-6 py-5 space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value); setCouponResult(null); }}
                      onKeyDown={(e) => e.key === "Enter" && checkCoupon()}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-sm text-navy-900 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                    />
                  </div>
                  <button
                    onClick={checkCoupon}
                    disabled={couponChecking}
                    className="px-4 py-2.5 rounded-xl bg-navy-100 hover:bg-navy-200 text-navy-800 text-sm font-semibold transition"
                  >
                    {couponChecking ? "..." : "Apply"}
                  </button>
                </div>
                {couponResult && (
                  <p className={`text-xs font-medium ${couponResult.valid ? "text-green-600" : "text-coral-600"}`}>
                    {couponResult.message}
                  </p>
                )}

                {/* Price summary */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-navy-600">
                    <span>Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount ({couponResult?.discount}%)</span>
                      <span>−€{discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {hasPhysical && (
                    <div className="flex justify-between text-navy-600">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" /> Shipping
                      </span>
                      <span>€{shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg text-navy-900 pt-1 border-t border-cream-200">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping form for physical items */}
                {hasPhysical && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide">Shipping address</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="col-span-2 input-field text-sm py-2"
                        placeholder="Full name *"
                        value={shipping.name}
                        onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                      />
                      <input
                        className="col-span-2 input-field text-sm py-2"
                        placeholder="Street address *"
                        value={shipping.address}
                        onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                      />
                      <input
                        className="input-field text-sm py-2"
                        placeholder="City *"
                        value={shipping.city}
                        onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                      />
                      <input
                        className="input-field text-sm py-2"
                        placeholder="Postal code *"
                        value={shipping.postal}
                        onChange={(e) => setShipping((s) => ({ ...s, postal: e.target.value }))}
                      />
                      <input
                        className="input-field text-sm py-2"
                        placeholder="Country *"
                        value={shipping.country}
                        onChange={(e) => setShipping((s) => ({ ...s, country: e.target.value }))}
                      />
                      <input
                        className="input-field text-sm py-2"
                        placeholder="Phone"
                        value={shipping.phone}
                        onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {checkoutErr && (
                  <p className="text-xs text-coral-600 font-medium">{checkoutErr}</p>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={submitting || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-semibold rounded-2xl px-6 py-3.5 transition-all duration-200"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Checkout · €{total.toFixed(2)}
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid #e9e7dd;
          background: #fafaf7;
          font-size: 0.875rem;
          color: #0f1b2d;
          outline: none;
        }
        .input-field:focus {
          ring: 2px solid #0EA5A5;
        }
      `}</style>
    </>
  );
}
