"use client";

import Link from "next/link";
import { useState } from "react";
import { Gift, CreditCard, CheckCircle, XCircle, Search } from "lucide-react";

const TIERS = [
  { amount: 25, label: "Starter", description: "A single print or small keepsake" },
  { amount: 50, label: "Classic", description: "Photo book or canvas print" },
  { amount: 100, label: "Premium", description: "Full gallery or wall art collection" },
  { amount: 200, label: "Ultimate", description: "The complete holiday experience" },
];

export default function GiftCardsPage() {
  const [loading, setLoading] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
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

  // Read success/cancelled from URL
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
    <div className="min-h-screen bg-cream-100 text-navy-900">
      {/* Top nav */}
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-card">
        <Link href="/portfolio" className="font-display text-2xl text-navy-900 tracking-tight">
          Fotiqo
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/shop" className="text-navy-700 hover:text-brand-700 px-3 py-2 transition">
            Shop
          </Link>
          <Link
            href="/book"
            className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-full font-semibold shadow-card transition"
          >
            Book a session
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-coral-500 px-6 py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-300 via-transparent to-transparent" />
        <div className="relative">
          <Gift className="h-12 w-12 text-gold-300 mx-auto mb-4" />
          <p className="text-brand-100 uppercase tracking-[0.3em] text-xs font-semibold">
            Fotiqo Gift Cards
          </p>
          <h1 className="text-white font-display text-4xl md:text-6xl mt-3 max-w-3xl mx-auto leading-tight">
            Give the Gift of&nbsp;Memories
          </h1>
          <p className="text-white/80 text-lg mt-4 max-w-2xl mx-auto">
            The perfect present for anyone about to go on holiday. Redeemable for photo
            galleries, prints, wall art, and more.
          </p>
        </div>
      </header>

      {/* Success / Cancelled banners */}
      {success && (
        <div className="max-w-3xl mx-auto mt-8 px-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-display text-lg text-green-800">Purchase complete!</div>
              <p className="text-green-700 text-sm mt-1">
                Your gift card code is{" "}
                <span className="font-mono font-bold text-green-900">{code}</span>. Save it
                somewhere safe or share it with the lucky recipient.
              </p>
            </div>
          </div>
        </div>
      )}
      {cancelled && (
        <div className="max-w-3xl mx-auto mt-8 px-6">
          <div className="bg-coral-50 border border-coral-200 rounded-2xl p-6 flex items-start gap-4">
            <XCircle className="h-6 w-6 text-coral-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-display text-lg text-coral-800">Payment cancelled</div>
              <p className="text-coral-700 text-sm mt-1">
                No worries! Pick a card below whenever you are ready.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tier cards */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="heading text-3xl text-center mb-12">Choose an amount</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TIERS.map((tier, i) => (
            <div
              key={tier.amount}
              className="bg-white rounded-2xl shadow-card border border-cream-300 p-6 flex flex-col items-center text-center hover:shadow-lift transition"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-coral-400 text-white flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="label-xs text-brand-600 mb-1">{tier.label}</div>
              <div className="font-display text-4xl text-navy-900">&euro;{tier.amount}</div>
              <p className="text-navy-500 text-sm mt-2 mb-6">{tier.description}</p>
              <button
                onClick={() => handlePurchase(tier.amount, i)}
                disabled={loading !== null}
                className="w-full bg-brand-700 hover:bg-brand-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
              >
                {loading === i ? "Redirecting..." : "Buy gift card"}
              </button>
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mt-12 max-w-md mx-auto bg-white rounded-2xl shadow-card border border-cream-300 p-6 text-center">
          <div className="font-display text-xl text-navy-900 mb-2">Custom amount</div>
          <p className="text-navy-500 text-sm mb-4">Enter any amount between &euro;5 and &euro;1,000</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 font-semibold">
                &euro;
              </span>
              <input
                type="number"
                min={5}
                max={1000}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="75"
                className="w-full pl-8 pr-4 py-3 border border-cream-300 rounded-xl text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <button
              onClick={() => {
                const val = parseFloat(customAmount);
                if (!val || val < 5 || val > 1000) {
                  alert("Please enter an amount between 5 and 1000.");
                  return;
                }
                handlePurchase(val, "custom");
              }}
              disabled={loading !== null}
              className="bg-coral-500 hover:bg-coral-600 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading === -1 ? "..." : "Buy"}
            </button>
          </div>
        </div>
      </section>

      {/* Check balance */}
      <section className="max-w-xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-card border border-cream-300 p-6">
          <h3 className="font-display text-xl text-navy-900 mb-1">Check your balance</h3>
          <p className="text-navy-500 text-sm mb-4">Enter your gift card code to see remaining balance.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={checkCode}
              onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
              placeholder="PH-GIFT-XXXX-XXXX"
              className="flex-1 px-4 py-3 border border-cream-300 rounded-xl font-mono text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 uppercase"
            />
            <button
              onClick={handleCheckBalance}
              disabled={checkLoading}
              className="bg-navy-800 hover:bg-navy-900 text-white font-semibold px-5 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {checkLoading ? "..." : "Check"}
            </button>
          </div>
          {checkError && (
            <div className="mt-4 text-coral-600 text-sm font-medium">{checkError}</div>
          )}
          {balance && (
            <div className="mt-4 bg-cream-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-navy-500 text-sm">Code</span>
                <span className="font-mono font-semibold text-navy-900">{balance.code}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-navy-500 text-sm">Balance</span>
                <span className="font-display text-2xl text-brand-700">
                  {balance.currency} {balance.balance.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-navy-500 text-sm">Status</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    balance.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-cream-200 text-navy-500"
                  }`}
                >
                  {balance.isActive ? "ACTIVE" : "USED / INACTIVE"}
                </span>
              </div>
              {balance.expiresAt && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-navy-500 text-sm">Expires</span>
                  <span className="text-navy-700 text-sm">
                    {new Date(balance.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-300 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Fotiqo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/book" className="hover:text-white transition">Book</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-navy-400">&copy; {new Date().getFullYear()} Fotiqo</div>
        </div>
      </footer>
    </div>
  );
}
