"use client";

import { useState } from "react";
import { Sparkles, ChevronRight, Image, Download, Printer } from "lucide-react";

type PriceTier = {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  getPrice: (count: number) => number;
};

const TIERS: PriceTier[] = [
  {
    key: "web",
    label: "Web-size (2048px)",
    description: "Perfect for social media sharing",
    icon: <Image className="h-4 w-4" />,
    getPrice: (count) => (count < 20 ? 15 : count <= 50 ? 20 : 25),
  },
  {
    key: "full",
    label: "Full resolution",
    description: "Original quality, print-ready files",
    icon: <Download className="h-4 w-4" />,
    getPrice: (count) => (count < 20 ? 25 : count <= 50 ? 35 : 50),
  },
  {
    key: "full_credit",
    label: "Full res + \u20ac10 print credit",
    description: "Best value \u2014 includes print credit",
    icon: <Printer className="h-4 w-4" />,
    getPrice: (count) => (count < 20 ? 40 : count <= 50 ? 50 : 65),
  },
];

export default function DigitalPassBanner({
  photoCount,
  galleryToken,
}: {
  photoCount: number;
  galleryToken: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUnlock(tierKey: string, price: number) {
    setLoading(tierKey);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              productKey: `gallery_unlock_${tierKey}`,
              qty: 1,
            },
          ],
          galleryToken,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.mock) {
        alert(data.message || "Gallery unlocked (demo mode).");
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      <div className="relative bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 rounded-2xl p-5 sm:p-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative">
          {/* Heading */}
          <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" /> Unlock All Photos
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-white leading-tight">
            Get all {photoCount} photos instantly
          </h3>
          <p className="text-white/70 text-sm mt-1 max-w-lg">
            One purchase, all your memories. Download immediately after payment.
          </p>

          {/* Tier cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {TIERS.map((tier, i) => {
              const price = tier.getPrice(photoCount);
              const isPopular = i === 1;
              return (
                <button
                  key={tier.key}
                  onClick={() => handleUnlock(tier.key, price)}
                  disabled={loading !== null}
                  className={`relative text-left rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                    isPopular
                      ? "bg-white text-navy-900 shadow-lift ring-2 ring-gold-400"
                      : "bg-white/15 hover:bg-white/25 text-white"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-2 right-3 bg-gold-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 shadow">
                      Popular
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isPopular ? "bg-brand-100 text-brand-600" : "bg-white/15 text-white"
                    }`}>
                      {tier.icon}
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${isPopular ? "text-navy-900" : "text-white"}`}>
                    {tier.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isPopular ? "text-navy-400" : "text-white/60"}`}>
                    {tier.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`font-display text-xl ${isPopular ? "text-navy-900" : "text-white"}`}>
                      {"\u20ac"}{price}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      isPopular ? "text-brand-600" : "text-white/80"
                    }`}>
                      {loading === tier.key ? (
                        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      ) : (
                        <>
                          Unlock All <ChevronRight className="h-3 w-3" />
                        </>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
