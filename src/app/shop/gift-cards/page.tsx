"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Gift, CheckCircle, XCircle, Search, ArrowRight, Sparkles, Heart, Camera, Star, Shield, Zap, ChevronDown } from "lucide-react";

const TIERS = [
  {
    amount: 25,
    label: "Essentials",
    tagline: "A perfect start",
    description: "A single stunning print or digital keepsake from their holiday.",
    color: "from-rose-400 to-orange-300",
    cardBg: "from-rose-50 to-orange-50",
    icon: Heart,
  },
  {
    amount: 50,
    label: "Classic",
    tagline: "Most gifted",
    description: "A beautiful photo book or gallery-quality canvas print.",
    color: "from-violet-500 to-indigo-400",
    cardBg: "from-violet-50 to-indigo-50",
    popular: true,
    icon: Camera,
  },
  {
    amount: 100,
    label: "Premium",
    tagline: "The full story",
    description: "Complete digital gallery with high-resolution downloads and wall art.",
    color: "from-amber-400 to-yellow-300",
    cardBg: "from-amber-50 to-yellow-50",
    icon: Star,
  },
  {
    amount: 200,
    label: "Ultimate",
    tagline: "Unforgettable",
    description: "The complete luxury experience — gallery, prints, album, and video reel.",
    color: "from-emerald-400 to-teal-300",
    cardBg: "from-emerald-50 to-teal-50",
    icon: Sparkles,
  },
];

export default function GiftCardsPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [checkCode, setCheckCode] = useState("");
  const [balance, setBalance] = useState<{
    code: string;
    balance: number;
    currency: string;
    expiresAt: string | null;
    isActive: boolean;
  } | null>(null);
  const [checkError, setCheckError] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const success = params?.get("success") === "1";
  const code = params?.get("code") || "";
  const cancelled = params?.get("cancelled") === "1";

  async function handlePurchase(amount: number, idx: number | string) {
    setLoading(typeof idx === "number" ? idx : -1);
    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "EUR" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(null);
      }
    } catch {
      alert("Network error. Please try again.");
      setLoading(null);
    }
  }

  async function handleCheckBalance() {
    if (!checkCode.trim()) return;
    setCheckLoading(true);
    setBalance(null);
    setCheckError("");
    try {
      const res = await fetch(`/api/gift-cards/check?code=${encodeURIComponent(checkCode.trim())}`);
      const data = await res.json();
      if (res.ok) {
        setBalance(data);
      } else {
        setCheckError(data.error || "Card not found");
      }
    } catch {
      setCheckError("Network error");
    } finally {
      setCheckLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] text-gray-900 antialiased">
      {/* Minimal nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/portfolio" className="text-xl font-bold tracking-tight text-gray-900">
            Fotiqo
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-sm text-gray-500 hover:text-gray-900 transition">
              Shop
            </Link>
            <Link
              href="/book"
              className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-medium transition"
            >
              Book a session
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-[#faf9f7]" />

        {/* Floating card visual */}
        <div className="relative z-10 pt-20 pb-32 px-6 text-center">
          {/* Decorative gift card */}
          <div
            className="mx-auto mb-10 w-72 h-44 rounded-2xl relative overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              transform: mounted ? "perspective(800px) rotateY(-5deg) rotateX(3deg)" : "none",
              transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
            <div className="absolute top-5 left-6">
              <div className="text-white/90 text-[10px] font-semibold uppercase tracking-[0.2em]">Fotiqo</div>
              <div className="text-white/60 text-[9px] mt-0.5">Gift Card</div>
            </div>
            <div className="absolute bottom-5 left-6">
              <div className="text-white font-bold text-2xl">&euro;50 &ndash; &euro;200</div>
            </div>
            <div className="absolute bottom-5 right-6">
              <Gift className="h-6 w-6 text-white/40" />
            </div>
            {/* Holographic shimmer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 45%, transparent 50%)",
                animation: mounted ? "shimmerCard 3s ease-in-out infinite" : "none",
              }}
            />
          </div>

          <p className="text-violet-300/80 uppercase tracking-[0.25em] text-[11px] font-semibold mb-4">
            Fotiqo Gift Cards
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl mx-auto">
            Give the gift of<br />
            <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
              unforgettable memories
            </span>
          </h1>
          <p className="text-gray-400 text-lg mt-5 max-w-xl mx-auto leading-relaxed">
            The perfect present for anyone heading on holiday. Redeemable for photo
            galleries, prints, wall art, video reels, and more.
          </p>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-6 mt-8 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-violet-400" /> Instant delivery
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-violet-400" /> Never expires
            </span>
            <span className="flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-violet-400" /> Beautifully wrapped
            </span>
          </div>
        </div>
      </header>

      {/* Success / Cancelled */}
      {success && (
        <div className="max-w-2xl mx-auto -mt-8 mb-8 px-6 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Purchase complete!</div>
              <p className="text-gray-500 text-sm mt-1">
                Your gift card code is{" "}
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{code}</span>.
                We&apos;ve also sent it to your email.
              </p>
            </div>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="max-w-2xl mx-auto -mt-8 mb-8 px-6 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Payment cancelled</div>
              <p className="text-gray-500 text-sm mt-1">No worries — pick a card below whenever you&apos;re ready.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier cards */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose an amount</h2>
          <p className="text-gray-400 mt-3 text-lg">Every card is delivered instantly via email</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            const isHovered = hoveredTier === i;
            return (
              <div
                key={tier.amount}
                onMouseEnter={() => setHoveredTier(i)}
                onMouseLeave={() => setHoveredTier(null)}
                className="group relative"
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-violet-500 text-white text-[10px] font-bold uppercase tracking-[0.12em] px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/20">
                      Most Gifted
                    </span>
                  </div>
                )}
                <div
                  className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                    tier.popular ? "ring-2 ring-violet-500 shadow-xl shadow-violet-500/10" : "border border-gray-100 shadow-sm hover:shadow-xl"
                  }`}
                  style={{
                    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  }}
                >
                  {/* Card preview strip */}
                  <div className={`h-28 bg-gradient-to-br ${tier.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20" style={{ background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3-2 3zM0 20.5V18h20v-2H0v-2l-2 3 2 3z' fill='%23fff' fill-opacity='.1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    {/* Mini card mockup */}
                    <div className="absolute bottom-2 right-3 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white/80 text-[9px] font-semibold tracking-wider">FOTIQO</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 mb-1">{tier.tagline}</div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">&euro;{tier.amount}</div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">{tier.label}</div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">{tier.description}</p>

                    <button
                      onClick={() => handlePurchase(tier.amount, i)}
                      disabled={loading !== null}
                      className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        tier.popular
                          ? "bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      } disabled:opacity-50`}
                    >
                      {loading === i ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Processing...
                        </span>
                      ) : (
                        <>
                          Purchase <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom amount */}
        <div className="mt-14 max-w-lg mx-auto">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Gift className="h-4 w-4" />
              Choose a custom amount (&euro;5 &ndash; &euro;1,000)
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
              <div className="text-xl font-bold text-gray-900 mb-1">Custom amount</div>
              <p className="text-gray-400 text-sm mb-6">Enter any amount between &euro;5 and &euro;1,000</p>
              <div className="flex gap-3 max-w-xs mx-auto">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-semibold text-lg">
                    &euro;
                  </span>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="75"
                    autoFocus
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
                <button
                  onClick={() => {
                    const val = parseFloat(customAmount);
                    if (!val || val < 5 || val > 1000) {
                      alert("Please enter an amount between 5 and 1,000.");
                      return;
                    }
                    handlePurchase(val, "custom");
                  }}
                  disabled={loading !== null}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-7 py-3.5 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loading === -1 ? "..." : <>Buy <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
              <button onClick={() => setShowCustom(false)} className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition">
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-bold text-center mb-10 tracking-tight">How it works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Choose & pay", desc: "Pick an amount and complete checkout securely with Stripe." },
            { step: "02", title: "Share the code", desc: "Your unique gift card code is delivered instantly via email." },
            { step: "03", title: "They redeem it", desc: "The recipient uses the code at checkout for any Fotiqo product." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="inline-flex h-12 w-12 rounded-full bg-gray-100 items-center justify-center text-sm font-bold text-gray-400 mb-4">{s.step}</div>
              <div className="text-base font-semibold text-gray-900 mb-1">{s.title}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Check balance */}
      <section className="max-w-xl mx-auto px-6 pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition"
          >
            <div>
              <div className="font-semibold text-gray-900">Check your balance</div>
              <div className="text-sm text-gray-400 mt-0.5">Enter your gift card code</div>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-300 transition-transform ${showBalance ? "rotate-180" : ""}`} />
          </button>

          {showBalance && (
            <div className="px-6 pb-6 border-t border-gray-50">
              <div className="flex gap-3 mt-5">
                <input
                  type="text"
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                  placeholder="PH-GIFT-XXXX-XXXX"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-mono text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition uppercase"
                />
                <button
                  onClick={handleCheckBalance}
                  disabled={checkLoading}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  <Search className="h-4 w-4" />
                  {checkLoading ? "..." : "Check"}
                </button>
              </div>
              {checkError && (
                <div className="mt-4 text-red-500 text-sm font-medium">{checkError}</div>
              )}
              {balance && (
                <div className="mt-5 rounded-xl overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-5 py-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Gift Card</span>
                    <span className="font-mono text-xs font-semibold text-gray-600">{balance.code}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{balance.currency} {balance.balance.toFixed(2)}</span>
                      <span className="text-sm text-gray-400">remaining</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          balance.isActive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {balance.isActive ? "Active" : "Used"}
                      </span>
                      {balance.expiresAt && (
                        <span className="text-xs text-gray-400">
                          Expires {new Date(balance.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold text-lg text-gray-900 tracking-tight">Fotiqo</div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/shop" className="hover:text-gray-900 transition">Shop</Link>
            <Link href="/portfolio" className="hover:text-gray-900 transition">Portfolio</Link>
            <Link href="/book" className="hover:text-gray-900 transition">Book</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition">Terms</Link>
          </div>
          <div className="text-xs text-gray-300">&copy; {new Date().getFullYear()} Fotiqo. All rights reserved.</div>
        </div>
      </footer>

      {/* Shimmer animation for the card */}
      <style jsx global>{`
        @keyframes shimmerCard {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
