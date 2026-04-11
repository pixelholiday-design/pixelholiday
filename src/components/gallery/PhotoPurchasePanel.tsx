"use client";

import { useState } from "react";
import { X, Download, Image, Printer, Frame, ShoppingBag } from "lucide-react";
import { getPhotoSrc } from "@/lib/cloudinary";
import type { CartItem, CartPhoto } from "./ShopCart";

type PurchaseOption = {
  key: string;
  label: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  isDigital: boolean;
};

const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    key: "digital_web",
    label: "Digital Download (Web)",
    description: "2048px, perfect for social media",
    price: 3,
    icon: <Download className="h-4 w-4" />,
    isDigital: true,
  },
  {
    key: "digital_full",
    label: "Digital Download (Full-res)",
    description: "Original resolution, print-ready",
    price: 5,
    icon: <Image className="h-4 w-4" />,
    isDigital: true,
  },
  {
    key: "print",
    label: "Print",
    description: "from \u20ac3.50",
    price: 3.5,
    icon: <Printer className="h-4 w-4" />,
    isDigital: false,
  },
  {
    key: "wall_art",
    label: "Wall Art",
    description: "from \u20ac18",
    price: 18,
    icon: <Frame className="h-4 w-4" />,
    isDigital: false,
  },
];

export type PhotoForPurchase = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
  _signedWm?: string;
  _signedClean?: string;
};

export default function PhotoPurchasePanel({
  photo,
  isOpen,
  onClose,
  onAddToCart,
  onOpenProductPicker,
}: {
  photo: PhotoForPurchase | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onOpenProductPicker: (photoId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen || !photo) return null;

  const imgSrc = getPhotoSrc(photo as CartPhoto, false);

  function handleAddDigital(option: PurchaseOption) {
    onAddToCart({
      productKey: option.key,
      productName: option.label,
      price: option.price,
      currency: "EUR",
      qty: 1,
      photo: photo as CartPhoto,
    });
    onClose();
    setSelected(null);
  }

  function handlePhysical(photoId: string) {
    onOpenProductPicker(photoId);
    onClose();
    setSelected(null);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-lift ring-1 ring-cream-300/70 overflow-hidden"
        style={{ animation: "panelSlideUp 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with thumbnail */}
        <div className="flex items-center gap-3 p-4 border-b border-cream-200">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-200 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base text-navy-900">Buy this photo</h3>
            <p className="text-xs text-navy-400 mt-0.5">Choose a format below</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-cream-100 transition"
          >
            <X className="h-4 w-4 text-navy-500" />
          </button>
        </div>

        {/* Options */}
        <div className="p-3 space-y-1.5">
          {PURCHASE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                if (opt.isDigital) {
                  handleAddDigital(opt);
                } else {
                  handlePhysical(photo.id);
                }
              }}
              onMouseEnter={() => setSelected(opt.key)}
              onMouseLeave={() => setSelected(null)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                selected === opt.key
                  ? "bg-brand-50 ring-1 ring-brand-400"
                  : "bg-cream-50 hover:bg-cream-100"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                opt.isDigital ? "bg-brand-100 text-brand-600" : "bg-coral-100 text-coral-600"
              }`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900">{opt.label}</p>
                <p className="text-xs text-navy-400">{opt.description}</p>
              </div>
              <div className="text-sm font-display text-navy-900 flex-shrink-0">
                {opt.isDigital ? `\u20ac${opt.price.toFixed(2)}` : (
                  <span className="text-xs text-navy-400 flex items-center gap-1">
                    Select <span className="text-navy-300">&rsaquo;</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Cart hint */}
        <div className="px-4 pb-3">
          <p className="text-[10px] text-navy-300 text-center flex items-center justify-center gap-1">
            <ShoppingBag className="h-3 w-3" /> Digital options add directly to your cart
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes panelSlideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
