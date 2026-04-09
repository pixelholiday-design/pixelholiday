"use client";
import { useState } from "react";
import { SUBSCRIPTION_TIERS, type Tier } from "@/lib/subscriptions";

const DISPLAY_TIERS: Tier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"];

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", tier: "PROFESSIONAL" as Tier });
  const [status, setStatus] = useState<string>("");
  const [step, setStep] = useState<"plan" | "details">("plan");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account...");

    const res = await fetch("/api/saas/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${data.error || "Signup failed"}`);
      return;
    }

    // For paid tiers, redirect to Stripe checkout
    const tier = SUBSCRIPTION_TIERS[form.tier];
    if (tier.priceMonthly > 0) {
      setStatus("Redirecting to payment...");
      const subRes = await fetch("/api/saas/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: data.orgId, tier: form.tier }),
      });
      const subData = await subRes.json();
      if (subData.stripeSessionId && !subData.mocked) {
        window.location.href = `/api/checkout/redirect?sessionId=${subData.stripeSessionId}`;
        return;
      }
    }

    setStatus("Account created! Redirecting...");
    setTimeout(() => { window.location.href = "/admin/dashboard"; }, 1500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-brand-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Start with Pixelvo</h1>
          <p className="text-lg text-slate-600">Resort photography delivery that scales with you</p>
        </div>

        {step === "plan" && (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {DISPLAY_TIERS.map((k) => {
                const t = SUBSCRIPTION_TIERS[k];
                const active = form.tier === k;
                const isEnterprise = k === "ENTERPRISE";

                return (
                  <div
                    key={k}
                    onClick={() => !isEnterprise && setForm({ ...form, tier: k })}
                    className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                      active
                        ? "border-brand-400 bg-brand-50 shadow-lg scale-[1.02]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } ${isEnterprise ? "cursor-default" : ""}`}
                  >
                    {t.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    )}

                    <div className="font-bold text-lg mb-1">{t.name}</div>

                    {isEnterprise ? (
                      <div className="text-2xl font-bold text-slate-800 mb-1">Custom</div>
                    ) : t.priceMonthly === 0 ? (
                      <div className="text-2xl font-bold text-slate-800 mb-1">Free</div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-slate-800">
                          ${(t.priceMonthly / 100).toFixed(0)}
                        </span>
                        <span className="text-sm text-slate-500">/mo</span>
                      </div>
                    )}

                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-400 mt-0.5">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEnterprise) {
                          window.location.href = "mailto:sales@pixelvo.com?subject=Enterprise%20Plan";
                        } else {
                          setForm({ ...form, tier: k });
                          setStep("details");
                        }
                      }}
                      className={`w-full mt-5 py-2.5 rounded-lg font-semibold text-sm transition ${
                        active
                          ? "bg-coral-500 text-white hover:bg-coral-600"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {t.cta}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-slate-400">
              All paid plans include a 14-day free trial. Cancel anytime.
            </p>
          </>
        )}

        {step === "details" && (
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setStep("plan")}
              className="text-sm text-slate-500 hover:text-slate-700 mb-4"
            >
              &larr; Back to plans
            </button>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="font-bold text-lg">{SUBSCRIPTION_TIERS[form.tier].name} Plan</div>
                  <div className="text-sm text-slate-500">
                    {SUBSCRIPTION_TIERS[form.tier].priceMonthly === 0
                      ? "Free forever"
                      : `$${(SUBSCRIPTION_TIERS[form.tier].priceMonthly / 100).toFixed(0)}/month`}
                  </div>
                </div>
                <button
                  onClick={() => setStep("plan")}
                  className="text-xs text-brand-400 hover:text-brand-700"
                >
                  Change plan
                </button>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <input
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  placeholder="Business name"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                />
                <input
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button className="w-full bg-coral-500 text-white py-3 rounded-lg font-bold hover:bg-coral-600 transition">
                  {SUBSCRIPTION_TIERS[form.tier].cta}
                </button>
                {status && <p className="text-center text-sm text-slate-600">{status}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
