"use client";
import { useState } from "react";
import { Camera, Star, Crown, Sparkles } from "lucide-react";

const TIERS = [
  { key: "BASIC", name: "Basic", price: 50, icon: Camera, features: ["Pre-paid photo package"], color: "brand" },
  { key: "UNLIMITED", name: "Unlimited", price: 150, icon: Star, features: ["All photos during stay", "Auto-delivery"], color: "brand" },
  { key: "VIP", name: "VIP", price: 300, icon: Crown, features: ["Priority booking", "Sunset session", "Top photographer"], color: "gold" },
];

export default function PassPage({ params }: { params: { locationId: string } }) {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  async function buy(tier: string) {
    const r = await fetch("/api/pass/purchase", {
      method: "POST",
      body: JSON.stringify({ tier, customerEmail: email, customerWhatsapp: whatsapp, locationId: params.locationId }),
    });
    const d = await r.json();
    if (d.sessionUrl) window.location.href = d.sessionUrl;
  }
  return (
    <div className="min-h-screen bg-cream-100">
      <div className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400 py-16 px-6 text-white text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/70 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> PixelHoliday
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mb-3">Digital Pass</h1>
        <p className="text-white/80 text-lg max-w-md mx-auto">Pre-purchase your memories — better price, instant delivery</p>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-6 mb-8 space-y-3">
        <input className="input bg-white shadow-card" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input bg-white shadow-card" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto px-6 pb-16">
        {TIERS.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.key} className="card p-6 text-center flex flex-col">
              <div className={`h-12 w-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                t.color === "gold" ? "bg-gold-500/10 text-gold-600" : "bg-brand-50 text-brand-700"
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl text-navy-900">{t.name}</h2>
              <div className="font-display text-4xl text-navy-900 my-4">
                €{t.price}
              </div>
              <ul className="text-sm text-navy-500 mb-6 space-y-1.5 flex-1">
                {t.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-brand-400">&#10003;</span> {f}</li>)}
              </ul>
              <button
                onClick={() => buy(t.key)}
                className={`w-full py-2.5 rounded-lg font-semibold transition ${
                  t.color === "gold"
                    ? "bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:brightness-105"
                    : "bg-coral-500 text-white hover:bg-coral-600"
                }`}
              >
                Buy Pass
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
