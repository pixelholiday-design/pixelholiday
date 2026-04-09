"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Plus, Minus, X, Check } from "lucide-react";
import type { ShopProduct, ShopCategory } from "@/lib/shopProducts";
import { CATEGORY_LABEL, CATEGORY_BLURB } from "@/lib/shopProducts";

const STORAGE_KEY = "pixelholiday.cart.v1";

type CartItem = { productKey: string; qty: number };

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  function add(productKey: string) {
    setItems((prev) => {
      const found = prev.find((p) => p.productKey === productKey);
      if (found) return prev.map((p) => (p.productKey === productKey ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { productKey, qty: 1 }];
    });
  }
  function dec(productKey: string) {
    setItems((prev) =>
      prev
        .map((p) => (p.productKey === productKey ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0),
    );
  }
  function remove(productKey: string) {
    setItems((prev) => prev.filter((p) => p.productKey !== productKey));
  }
  function clear() {
    setItems([]);
  }

  return { items, add, dec, remove, clear, loaded };
}

export default function ShopClient({
  byCategory,
  categories,
}: {
  byCategory: Record<ShopCategory, ShopProduct[]>;
  categories: ShopCategory[];
}) {
  const { items, add, dec, remove, clear, loaded } = useCart();
  const [open, setOpen] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const productMap = useMemo(() => {
    const m = new Map<string, ShopProduct>();
    for (const cat of categories) for (const p of byCategory[cat]) m.set(p.productKey, p);
    return m;
  }, [byCategory, categories]);

  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((sum, i) => {
    const p = productMap.get(i.productKey);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
  const currency = items[0] ? productMap.get(items[0].productKey)?.currency || "EUR" : "EUR";

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setCouponResult(null);
    try {
      const res = await fetch(`/api/shop/coupon?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        setCouponResult({ valid: true, discount: data.discount || 0, message: data.message || `${data.discount}% off applied!` });
      } else {
        setCouponResult({ valid: false, discount: 0, message: data.error || "Invalid coupon code." });
      }
    } catch {
      setCouponResult({ valid: false, discount: 0, message: "Could not verify coupon." });
    } finally {
      setCouponChecking(false);
    }
  }

  const discountedTotal = couponResult?.valid
    ? total * (1 - couponResult.discount / 100)
    : total;

  async function checkout() {
    if (items.length === 0) return;
    setSubmitting(true);
    setCheckoutErr(null);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items, couponCode: couponResult?.valid ? couponCode.trim() : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        clear();
        window.location.href = data.url;
      } else if (data.mock) {
        setCheckoutErr(
          `Stripe not configured in this environment. Cart logged: ${data.lines?.length ?? 0} items.`,
        );
      } else {
        setCheckoutErr(data.error || "Checkout failed");
      }
    } catch (e: any) {
      setCheckoutErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Sticky cart pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-coral-500 hover:bg-coral-600 text-white rounded-full pl-5 pr-6 py-3 shadow-lift flex items-center gap-2 font-semibold transition"
      >
        <ShoppingBag className="h-5 w-5" />
        {loaded && itemCount > 0 ? `${itemCount} · €${total.toFixed(0)}` : "Cart"}
      </button>

      {/* Category sections */}
      {categories.map((cat) => {
        const list = byCategory[cat];
        if (list.length === 0) return null;
        return (
          <section key={cat} className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8">
              <p className="text-brand-700 uppercase tracking-[0.2em] text-xs font-semibold">
                {CATEGORY_LABEL[cat]}
              </p>
              <h2 className="font-display text-3xl md:text-4xl mt-2 text-navy-900">
                {CATEGORY_LABEL[cat]}
              </h2>
              <p className="text-navy-500 mt-1">{CATEGORY_BLURB[cat]}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {list.map((p) => {
                const inCart = items.find((i) => i.productKey === p.productKey)?.qty || 0;
                return (
                  <div
                    key={p.id}
                    className="relative bg-white rounded-2xl ring-1 ring-cream-300 shadow-card hover:shadow-lift transition p-5 flex flex-col"
                  >
                    {p.badge && (
                      <span className="absolute -top-2 -right-2 bg-gold-500 text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-card">
                        {p.badge}
                      </span>
                    )}
                    <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-100 to-brand-300 mb-4 flex items-center justify-center text-brand-700 font-display text-3xl">
                      {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <h3 className="font-display text-xl text-navy-900 leading-tight">{p.name}</h3>
                    <p className="text-navy-500 text-sm mt-1.5 leading-snug flex-1">
                      {p.description}
                    </p>
                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-cream-300">
                      <div>
                        <div className="text-2xl font-bold text-navy-900">
                          €{p.price.toFixed(p.price % 1 ? 2 : 0)}
                        </div>
                        <div className="text-xs text-navy-400">
                          {p.currency} · {p.locationName ? "Per location" : "All locations"}
                        </div>
                      </div>
                      {inCart > 0 ? (
                        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-2 py-1">
                          <button
                            onClick={() => dec(p.productKey)}
                            className="h-7 w-7 rounded-full hover:bg-brand-100 flex items-center justify-center"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="font-bold w-5 text-center">{inCart}</span>
                          <button
                            onClick={() => add(p.productKey)}
                            className="h-7 w-7 rounded-full hover:bg-brand-100 flex items-center justify-center"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => add(p.productKey)}
                          className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Cart drawer */}
      {open && (
        <div className="fixed inset-0 z-40">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white shadow-lift flex flex-col">
            <header className="px-6 py-5 border-b border-cream-300 flex items-center justify-between">
              <h3 className="font-display text-2xl text-navy-900">Your cart</h3>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full hover:bg-cream-200 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-navy-700" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center text-navy-500 py-16">
                  <ShoppingBag className="h-10 w-10 mx-auto text-navy-300 mb-3" />
                  Your cart is empty.
                  <div className="mt-1 text-sm">Add a product to get started.</div>
                </div>
              ) : (
                <ul className="divide-y divide-cream-300">
                  {items.map((item) => {
                    const p = productMap.get(item.productKey);
                    if (!p) return null;
                    return (
                      <li key={item.productKey} className="py-4 flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-brand-700 font-display text-lg shrink-0">
                          {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-navy-900 truncate">{p.name}</div>
                          <div className="text-xs text-navy-400">€{p.price.toFixed(p.price % 1 ? 2 : 0)} each</div>
                        </div>
                        <div className="flex items-center gap-1 bg-cream-200 rounded-full px-1.5 py-1">
                          <button
                            onClick={() => dec(item.productKey)}
                            className="h-6 w-6 rounded-full hover:bg-white flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                          <button
                            onClick={() => add(item.productKey)}
                            className="h-6 w-6 rounded-full hover:bg-white flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.productKey)}
                          className="text-navy-400 hover:text-coral-600 ml-1"
                          aria-label="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <footer className="px-6 py-5 border-t border-cream-300 bg-cream-100">
              {/* Coupon code input */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-1.5">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponResult(null); }}
                    placeholder="Enter code…"
                    className="flex-1 rounded-lg border border-cream-400 bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim() || couponChecking}
                    className="bg-navy-800 hover:bg-navy-900 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    {couponChecking ? "…" : "Apply"}
                  </button>
                </div>
                {couponResult && (
                  <p className={`text-xs mt-1.5 font-medium ${couponResult.valid ? "text-green-700" : "text-coral-600"}`}>
                    {couponResult.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-navy-500">Subtotal</span>
                <span className="font-semibold text-navy-700">€{total.toFixed(2)}</span>
              </div>
              {couponResult?.valid && (
                <div className="flex items-center justify-between mb-1 text-green-700">
                  <span className="text-sm">Discount ({couponResult.discount}%)</span>
                  <span className="font-semibold">-€{(total - discountedTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-navy-500 font-semibold">Total</span>
                <span className="text-2xl font-bold text-navy-900">
                  €{discountedTotal.toFixed(2)} <span className="text-sm font-normal text-navy-400">{currency}</span>
                </span>
              </div>
              {checkoutErr && (
                <div className="bg-coral-50 border border-coral-200 text-coral-700 text-sm rounded-lg p-3 mb-3">
                  {checkoutErr}
                </div>
              )}
              <button
                onClick={checkout}
                disabled={items.length === 0 || submitting}
                className="w-full bg-coral-500 hover:bg-coral-600 disabled:bg-cream-300 disabled:text-navy-400 text-white font-semibold py-3.5 rounded-full transition flex items-center justify-center gap-2"
              >
                {submitting ? "Redirecting…" : (
                  <>
                    <Check className="h-4 w-4" />
                    Checkout
                  </>
                )}
              </button>
              <Link
                href="/portfolio"
                className="block text-center mt-3 text-sm text-navy-500 hover:text-navy-900"
              >
                Continue browsing
              </Link>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}
