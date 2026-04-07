"use client";
import { useState } from "react";
import { SUBSCRIPTION_TIERS, type Tier } from "@/lib/subscriptions";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", tier: "STARTER" as Tier });
  const [status, setStatus] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account…");
    const res = await fetch("/api/saas/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) setStatus(`✓ Account created. Org: ${data.orgId}. Redirecting…`);
    else setStatus(`✗ ${data.error || "Signup failed"}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Join PixelHoliday SaaS</h1>
        <p className="text-center text-gray-600 mb-8">Photographer cloud galleries — pick your plan</p>

        <div className="grid md:grid-cols-4 gap-3 mb-8">
          {(Object.keys(SUBSCRIPTION_TIERS) as Tier[]).map((k) => {
            const t = SUBSCRIPTION_TIERS[k];
            const active = form.tier === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setForm({ ...form, tier: k })}
                className={`p-4 rounded-xl border-2 text-left ${active ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"}`}
              >
                <div className="font-bold">{t.name}</div>
                <div className="text-2xl font-bold text-orange-600">${(t.priceMonthly / 100).toFixed(2)}</div>
                <div className="text-xs text-gray-500">/month</div>
                <div className="text-xs mt-2">
                  {t.photosPerMonth === -1 ? "Unlimited" : t.photosPerMonth} photos<br />
                  {t.activeGalleries === -1 ? "Unlimited" : t.activeGalleries} galleries
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow space-y-4">
          <input className="w-full border p-3 rounded" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="w-full border p-3 rounded" placeholder="Business name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
          <input className="w-full border p-3 rounded" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="w-full border p-3 rounded" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="w-full bg-orange-600 text-white py-3 rounded font-bold hover:bg-orange-700">Create Account & Subscribe</button>
          {status && <p className="text-center text-sm">{status}</p>}
        </form>
      </div>
    </div>
  );
}
