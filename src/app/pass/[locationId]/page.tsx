"use client";
import { useState } from "react";

const TIERS = [
  { key: "BASIC", name: "Basic", price: 50, features: ["Pre-paid photo package"] },
  { key: "UNLIMITED", name: "Unlimited", price: 150, features: ["All photos during stay", "Auto-delivery"] },
  { key: "VIP", name: "VIP", price: 300, features: ["Priority booking", "Sunset session", "Top photographer"] },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-2">PixelHoliday Digital Pass</h1>
      <p className="text-center text-gray-600 mb-8">Pre-purchase your memories — better price, instant delivery</p>
      <div className="max-w-md mx-auto mb-6 space-y-2">
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {TIERS.map((t) => (
          <div key={t.key} className="bg-white p-6 rounded-lg shadow text-center">
            <h2 className="text-2xl font-bold">{t.name}</h2>
            <div className="text-3xl font-bold my-4">€{t.price}</div>
            <ul className="text-sm text-gray-600 mb-4">{t.features.map((f) => <li key={f}>• {f}</li>)}</ul>
            <button onClick={() => buy(t.key)} className="bg-blue-600 text-white px-6 py-2 rounded w-full">Buy Pass</button>
          </div>
        ))}
      </div>
    </div>
  );
}
