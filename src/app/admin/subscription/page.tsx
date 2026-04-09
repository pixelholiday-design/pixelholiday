"use client";
import { useEffect, useState } from "react";
import { CreditCard, Check, TrendingUp, Image as ImageIcon, BarChart2 } from "lucide-react";
import { SUBSCRIPTION_TIERS, type Tier } from "@/lib/subscriptions";

const TIER_ORDER: Tier[] = ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"];

// Mock billing history for display when Stripe billing portal is unavailable
const MOCK_BILLING: { date: string; amount: string; status: string; description: string }[] = [
  { date: "2026-03-01", amount: "€49.00", status: "Paid", description: "Pixelvo Pro — March 2026" },
  { date: "2026-02-01", amount: "€49.00", status: "Paid", description: "Pixelvo Pro — February 2026" },
  { date: "2026-01-01", amount: "€49.00", status: "Paid", description: "Pixelvo Pro — January 2026" },
];

export default function SubscriptionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // In a real setup orgId comes from session; using "default" as placeholder
  const orgId = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("orgId") || "default"
    : "default";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/saas/subscription?orgId=${orgId}`);
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function changeTier(tier: Tier) {
    setUpgrading(tier);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/saas/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId, tier }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");
      if (result.stripeSessionId) {
        // Redirect to Stripe Checkout
        window.location.href = `https://checkout.stripe.com/pay/${result.stripeSessionId}`;
        return;
      }
      setSuccess(
        tier === "STARTER"
          ? "Downgraded to Free plan."
          : tier === "ENTERPRISE"
          ? "Enterprise request submitted — our team will contact you."
          : `Switched to ${SUBSCRIPTION_TIERS[tier].name} plan (mocked — Stripe not configured).`,
      );
      await load();
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setUpgrading(null);
    }
  }

  const currentTier: Tier = (data?.tier as Tier) || "STARTER";
  const usage = data?.usage || { photosThisMonth: 0, activeGalleries: 0 };
  const config = SUBSCRIPTION_TIERS[currentTier];

  return (
    <div className="space-y-10">
      <header>
        <div className="label-xs">SaaS</div>
        <h1 className="heading text-4xl mt-1">Subscription</h1>
        <p className="text-navy-400 mt-1">Manage your Pixelvo plan, billing, and usage.</p>
      </header>

      {/* Current plan summary */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="label-xs mb-1">Current plan</div>
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl text-navy-900">{config.name}</span>
              {currentTier !== "STARTER" && (
                <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2.5 py-1 rounded-full">Active</span>
              )}
            </div>
            <div className="text-navy-400 mt-1 text-sm">
              {config.priceMonthly > 0
                ? `€${(config.priceMonthly / 100).toFixed(0)}/month`
                : currentTier === "ENTERPRISE"
                ? "Custom pricing"
                : "Free forever"}
            </div>
          </div>
          <CreditCard className="h-8 w-8 text-brand-500 shrink-0" />
        </div>
        <ul className="grid sm:grid-cols-2 gap-1.5">
          {config.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-navy-700">
              <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Usage stats */}
      {!loading && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-brand-500/10 text-brand-700 flex items-center justify-center mb-3">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div className="label-xs">Photos this month</div>
            <div className="font-display text-3xl text-navy-900 mt-1">{usage.photosThisMonth}</div>
            <div className="text-xs text-navy-400 mt-1">
              {config.photosPerMonth === -1 ? "Unlimited" : `Limit: ${config.photosPerMonth}`}
            </div>
            {config.photosPerMonth !== -1 && (
              <div className="mt-2 h-1.5 bg-cream-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (usage.photosThisMonth / config.photosPerMonth) * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-3">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div className="label-xs">Active galleries</div>
            <div className="font-display text-3xl text-navy-900 mt-1">{usage.activeGalleries}</div>
            <div className="text-xs text-navy-400 mt-1">
              {config.activeGalleries === -1 ? "Unlimited" : `Limit: ${config.activeGalleries}`}
            </div>
          </div>
          <div className="stat-card">
            <div className="h-9 w-9 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-3">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="label-xs">Sales commission</div>
            <div className="font-display text-3xl text-navy-900 mt-1">
              {((data?.commissionRate || 0.02) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-navy-400 mt-1">Per transaction</div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="bg-coral-50 border border-coral-200 text-coral-700 rounded-xl px-5 py-3 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-3 text-sm">{success}</div>
      )}

      {/* Plan upgrade/downgrade cards */}
      <div>
        <h2 className="heading text-2xl mb-5">Available plans</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIER_ORDER.map((tier) => {
            const t = SUBSCRIPTION_TIERS[tier];
            const isCurrent = tier === currentTier;
            const tierIdx = TIER_ORDER.indexOf(tier);
            const currentIdx = TIER_ORDER.indexOf(currentTier);
            const isUpgrade = tierIdx > currentIdx;

            return (
              <div
                key={tier}
                className={`relative rounded-2xl ring-1 p-5 flex flex-col ${
                  isCurrent
                    ? "ring-brand-500 bg-brand-50 shadow-lift"
                    : t.popular
                    ? "ring-gold-400 bg-white shadow-card"
                    : "ring-cream-300 bg-white shadow-card"
                }`}
              >
                {t.popular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow">
                    Current
                  </span>
                )}
                <div className="font-display text-xl text-navy-900 mb-1">{t.name}</div>
                <div className="text-2xl font-bold text-navy-900 mb-4">
                  {t.priceMonthly === 0
                    ? tier === "ENTERPRISE" ? "Custom" : "Free"
                    : `€${(t.priceMonthly / 100).toFixed(0)}/mo`}
                </div>
                <ul className="space-y-1.5 flex-1 mb-5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-navy-600">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button
                    onClick={() => changeTier(tier)}
                    disabled={upgrading !== null}
                    className={`w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                      isUpgrade
                        ? "bg-brand-700 hover:bg-brand-800 text-white disabled:opacity-50"
                        : "bg-cream-200 hover:bg-cream-300 text-navy-700 disabled:opacity-50"
                    }`}
                  >
                    {upgrading === tier
                      ? "Processing…"
                      : tier === "ENTERPRISE"
                      ? "Contact Sales"
                      : isUpgrade
                      ? `Upgrade to ${t.name}`
                      : `Downgrade to ${t.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing history */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-300/70">
          <h2 className="heading text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            Billing history
          </h2>
          <p className="text-xs text-navy-400 mt-0.5">Recent invoices. Connect Stripe for live data.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-navy-400 bg-cream-100/70">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300/70">
            {MOCK_BILLING.map((b, i) => (
              <tr key={i} className="hover:bg-cream-100/60">
                <td className="px-6 py-3 text-navy-500">{b.date}</td>
                <td className="px-6 py-3 text-navy-700">{b.description}</td>
                <td className="px-6 py-3 font-semibold text-navy-900">{b.amount}</td>
                <td className="px-6 py-3">
                  <span className="inline-flex rounded-full bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1">
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
