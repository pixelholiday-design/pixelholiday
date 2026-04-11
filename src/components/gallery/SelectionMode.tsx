"use client";

import { useMemo } from "react";
import { CheckSquare, X, ShoppingBag, Percent } from "lucide-react";
import type { CartItem, CartPhoto } from "./ShopCart";

export type SelectablePhoto = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

function getBulkDiscount(count: number): { rate: number; label: string } {
  if (count >= 10) return { rate: 0.2, label: "20% bulk discount" };
  if (count >= 5) return { rate: 0.1, label: "10% bulk discount" };
  return { rate: 0, label: "" };
}

const DIGITAL_PRICE = 5; // Full-res per photo

export default function SelectionMode({
  photos,
  selectedIds,
  onToggleSelect,
  onBuySelected,
  onCancel,
}: {
  photos: SelectablePhoto[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onBuySelected: (items: Omit<CartItem, "id">[]) => void;
  onCancel: () => void;
}) {
  const count = selectedIds.size;
  const discount = useMemo(() => getBulkDiscount(count), [count]);
  const unitPrice = DIGITAL_PRICE;
  const subtotal = count * unitPrice;
  const discountAmount = subtotal * discount.rate;
  const total = subtotal - discountAmount;

  function handleBuy() {
    const ids = Array.from(selectedIds);
    const items: Omit<CartItem, "id">[] = [];
    for (let k = 0; k < ids.length; k++) {
      const photo = photos.find((p) => p.id === ids[k]);
      if (!photo) continue;
      items.push({
        productKey: "digital_full",
        productName: "Digital Download (Full-res)",
        price: +(unitPrice * (1 - discount.rate)).toFixed(2),
        currency: "EUR",
        qty: 1,
        photo: photo as CartPhoto,
      });
    }
    onBuySelected(items);
  }

  return (
    <>
      {/* Top bar */}
      <div className="sticky top-[140px] z-[15] bg-brand-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {count === 0
                ? "Tap photos to select"
                : `${count} photo${count > 1 ? "s" : ""} selected`}
            </span>
            {discount.rate > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold rounded-full px-2 py-0.5">
                <Percent className="h-3 w-3" /> {discount.label}
              </span>
            )}
          </div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 transition"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        </div>
      </div>

      {/* Bottom action bar */}
      {count > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-cream-300 shadow-lift">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-navy-600">
                {count} photo{count > 1 ? "s" : ""} x {"\u20ac"}{unitPrice.toFixed(2)}
                {discount.rate > 0 && (
                  <span className="text-green-600 font-medium ml-1">
                    -{(discount.rate * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <div className="font-display text-lg text-navy-900">
                {"\u20ac"}{total.toFixed(2)}
                {discountAmount > 0 && (
                  <span className="text-xs text-navy-400 line-through ml-2">
                    {"\u20ac"}{subtotal.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleBuy}
              className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-2xl px-5 py-3 transition-all duration-200 hover:scale-[1.02]"
            >
              <ShoppingBag className="h-4 w-4" />
              Add {count} to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
