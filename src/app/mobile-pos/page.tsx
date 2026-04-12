"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Types ─────────────────────────────────────── */
interface GalleryResult {
  id: string;
  roomNumber: string | null;
  customer: { name: string | null; email: string | null };
  totalCount: number;
  status: string;
}

type Step = "form" | "waiting" | "success";

/* ── Component ─────────────────────────────────── */
export default function MobilePOSPage() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("eur");
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleries, setGalleries] = useState<GalleryResult[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<GalleryResult | null>(null);
  const [photographerId] = useState("demo-photographer");
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Gallery search ──────────────────────────── */
  const searchGalleries = useCallback(async () => {
    if (gallerySearch.length < 2) {
      setGalleries([]);
      return;
    }
    try {
      const res = await fetch(`/api/terminal/search-galleries?q=${encodeURIComponent(gallerySearch)}`);
      if (res.ok) {
        const data = await res.json();
        setGalleries(data.galleries || []);
      }
    } catch {
      /* ignore search errors */
    }
  }, [gallerySearch]);

  useEffect(() => {
    const t = setTimeout(searchGalleries, 300);
    return () => clearTimeout(t);
  }, [searchGalleries]);

  /* ── Tap to Pay ──────────────────────────────── */
  async function handleTapToPay() {
    if (!selectedGallery || !amount) return;
    setError("");
    setLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountCents) || amountCents < 100) {
        setError("Minimum amount is 1.00");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/terminal/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          currency,
          galleryId: selectedGallery.id,
          photographerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPaymentIntentId(data.paymentIntentId);
      setStep("waiting");
      pollPayment(data.paymentIntentId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── QR Code payment ─────────────────────────── */
  async function handleQRPayment() {
    if (!selectedGallery || !amount) return;
    setError("");
    setLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountCents) || amountCents < 100) {
        setError("Minimum amount is 1.00");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/terminal/qr-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountCents,
          currency,
          galleryId: selectedGallery.id,
          description: `Gallery - ${selectedGallery.customer.name || selectedGallery.roomNumber || selectedGallery.id}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setQrUrl(data.url);
      setStep("waiting");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Poll for payment confirmation ───────────── */
  function pollPayment(piId: string) {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 120) {
        clearInterval(interval);
        setError("Payment timed out. Please try again.");
        setStep("form");
        return;
      }
      try {
        const res = await fetch("/api/terminal/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: piId,
            galleryId: selectedGallery!.id,
            photographerId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          clearInterval(interval);
          setOrderId(data.orderId);
          setStep("success");
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
  }

  /* ── Reset ───────────────────────────────────── */
  function reset() {
    setStep("form");
    setAmount("");
    setSelectedGallery(null);
    setGallerySearch("");
    setGalleries([]);
    setPaymentIntentId("");
    setOrderId("");
    setQrUrl("");
    setError("");
  }

  const currencySymbol = currency === "eur" ? "\u20AC" : currency === "usd" ? "$" : currency.toUpperCase() + " ";

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-amber-400">Fotiqo</span> Mobile POS
          </h1>
          {step !== "form" && (
            <button onClick={reset} className="text-sm text-slate-400 hover:text-white transition">
              New Sale
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* ── FORM STEP ──────────────────────── */}
        {step === "form" && (
          <>
            {/* Gallery Search */}
            <section className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Gallery</label>
              {selectedGallery ? (
                <div className="flex items-center justify-between bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-600">
                  <div>
                    <p className="font-medium">{selectedGallery.customer.name || "Guest"}</p>
                    <p className="text-sm text-slate-400">
                      {selectedGallery.roomNumber ? `Room ${selectedGallery.roomNumber}` : selectedGallery.id.slice(0, 8)}
                      {" \u00B7 "}
                      {selectedGallery.totalCount} photos
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedGallery(null); setGallerySearch(""); }}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by room number or name..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full rounded-xl bg-slate-700/50 border border-slate-600 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                  {galleries.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl overflow-hidden shadow-xl z-20 max-h-60 overflow-y-auto">
                      {galleries.map((g) => (
                        <li key={g.id}>
                          <button
                            onClick={() => { setSelectedGallery(g); setGalleries([]); }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition"
                          >
                            <p className="font-medium">{g.customer.name || "Guest"}</p>
                            <p className="text-sm text-slate-400">
                              {g.roomNumber ? `Room ${g.roomNumber}` : g.id.slice(0, 8)} &middot; {g.totalCount} photos &middot; {g.status}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </section>

            {/* Amount */}
            <section className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Amount</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-medium">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl bg-slate-700/50 border border-slate-600 pl-10 pr-4 py-3 text-white text-2xl font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-xl bg-slate-700/50 border border-slate-600 px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                >
                  <option value="eur">EUR</option>
                  <option value="usd">USD</option>
                  <option value="gbp">GBP</option>
                  <option value="tnd">TND</option>
                </select>
              </div>
              {/* Quick-amount buttons */}
              <div className="flex gap-2 flex-wrap">
                {[15, 49, 99, 130, 150].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600 text-sm hover:bg-slate-600 transition"
                  >
                    {currencySymbol}{v}
                  </button>
                ))}
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Payment Buttons */}
            <section className="space-y-3 pt-2">
              <button
                onClick={handleTapToPay}
                disabled={!selectedGallery || !amount || loading}
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {loading ? "Creating..." : "Tap to Pay"}
              </button>

              <button
                onClick={handleQRPayment}
                disabled={!selectedGallery || !amount || loading}
                className="w-full py-4 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg transition flex items-center justify-center gap-2 border border-slate-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {loading ? "Creating..." : "QR Code Payment"}
              </button>
            </section>
          </>
        )}

        {/* ── WAITING STEP ───────────────────── */}
        {step === "waiting" && (
          <div className="text-center space-y-6 pt-8">
            {qrUrl ? (
              <>
                <p className="text-xl font-semibold">Scan to Pay</p>
                <p className="text-slate-400 text-sm">Customer scans this QR code to complete payment</p>
                {/* QR code rendered as an img using a public QR API */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-2xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`}
                      alt="Payment QR Code"
                      width={250}
                      height={250}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 break-all max-w-xs mx-auto">{qrUrl}</p>
                <button onClick={reset} className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium">
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* Tap to pay waiting */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
                </div>
                <p className="text-xl font-semibold">Waiting for payment...</p>
                <p className="text-slate-400 text-sm">
                  Present device to customer for tap / contactless payment
                </p>
                <p className="text-slate-500 text-xs mt-2">
                  Payment Intent: {paymentIntentId.slice(0, 20)}...
                </p>
                <button onClick={reset} className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium">
                  Cancel
                </button>
              </>
            )}
          </div>
        )}

        {/* ── SUCCESS STEP ───────────────────── */}
        {step === "success" && (
          <div className="text-center space-y-6 pt-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-400">Payment Successful</p>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="font-bold text-lg">{currencySymbol}{amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span>{selectedGallery?.customer.name || "Guest"}</span>
              </div>
              {selectedGallery?.roomNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Room</span>
                  <span>{selectedGallery.roomNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID</span>
                <span className="text-xs font-mono text-slate-500">{orderId}</span>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition"
            >
              New Sale
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
