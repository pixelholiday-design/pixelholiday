"use client";

import { useState } from "react";
import { Film, Sparkles, Play, ChevronRight } from "lucide-react";

interface ReelUpsellBannerProps {
  orderId: string;
  photoCount?: number;
}

const TIERS = [
  {
    key: "SHORT",
    label: "Short",
    duration: "15s",
    price: 9,
    description: "Quick highlight clip",
    popular: false,
  },
  {
    key: "STANDARD",
    label: "Standard",
    duration: "30s",
    price: 15,
    description: "Full cinematic reel with music",
    popular: true,
  },
  {
    key: "PREMIUM",
    label: "Premium",
    duration: "60s",
    price: 25,
    description: "Extended reel with transitions & effects",
    popular: false,
  },
] as const;

export default function ReelUpsellBanner({
  orderId,
  photoCount,
}: ReelUpsellBannerProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);

  async function handlePurchase(tier: string) {
    setPurchasing(tier);
    try {
      const res = await fetch("/api/reel-upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, tier }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setPurchasing(null);
    }
  }

  return (
    <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Film className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">
                Your Cinematic Reel is Ready
              </h3>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-300">
              We created a cinematic reel from your{" "}
              {photoCount ? `${photoCount} photos` : "photos"}!
            </p>
          </div>
        </div>

        {/* Preview placeholder */}
        <div className="relative aspect-video bg-black/40 rounded-xl overflow-hidden mb-4 group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 rounded text-xs text-white font-medium">
            Preview (watermarked)
          </div>
          {/* Gradient overlay to suggest watermark */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      </div>

      {/* Tier selection */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIERS.map((tier) => (
            <button
              key={tier.key}
              onClick={() => handlePurchase(tier.key)}
              disabled={purchasing !== null}
              className={`relative p-4 rounded-xl border text-left transition group ${
                tier.popular
                  ? "border-brand-400 bg-brand-500/10 hover:bg-brand-500/20"
                  : "border-gray-600 bg-white/5 hover:bg-white/10"
              } disabled:opacity-50`}
            >
              {tier.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Popular
                </span>
              )}
              <div className="text-white font-semibold text-sm mb-1">
                {tier.label}{" "}
                <span className="text-gray-400 font-normal">({tier.duration})</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                &euro;{tier.price}
              </div>
              <div className="text-xs text-gray-400 mb-3">{tier.description}</div>
              <div
                className={`flex items-center justify-center gap-1 text-sm font-medium py-2 rounded-lg transition ${
                  tier.popular
                    ? "bg-brand-500 text-white group-hover:bg-brand-600"
                    : "bg-white/10 text-white group-hover:bg-white/20"
                }`}
              >
                {purchasing === tier.key ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Get Reel <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
