"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Plus, Minus, X, Check, ChevronRight, Loader2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  retailPrice: number;
  costPrice?: number;
  fulfillmentType: string;
  turnaround?: string;
  mockupUrl?: string;
  isFeatured: boolean;
  sizes?: string; // JSON
  options?: string; // JSON
  defaultSize?: string;
  defaultOption?: string;
};

type CategoryMeta = {
  label: string;
  blurb: string;
  icon: string;
};

type CatalogData = {
  products: ShopProduct[];
  byCategory: Record<string, ShopProduct[]>;
  categories: string[];
  categoryMeta: Record<string, CategoryMeta>;
};

type CartItem = {
  productKey: string;
  qty: number;
  size?: string;
  option?: string;
};

const STORAGE_KEY = "fotiqo.cart.v2";

const DISPLAY_TABS = [
  { key: "ALL",           label: "All" },
  { key: "DIGITAL",       label: "Digital" },
  { key: "PRINT",         label: "Prints" },
  { key: "PRINTS",        label: "Prints" },      // legacy alias
  { key: "WALL_ART",      label: "Wall Art" },
  { key: "SPECIALTY_WALL",label: "Specialty Wall" },
  { key: "PHOTO_BOOK",    label: "Books & Albums" },
  { key: "GIFT",          label: "Gifts" },
  { key: "CARD",          label: "Cards" },
  { key: "SOUVENIR",      label: "Souvenirs" },
  { key: "BUNDLE",        label: "Bundles" },
  { key: "DISPLAY",       label: "Tabletop" },
  { key: "PASSES",        label: "Passes" },
  { key: "ADD_ONS",       label: "Add-ons" },
];

// Collapse legacy alias tabs — only one entry per label shown
const DEDUP_TAB_LABELS = new Set<string>();

const CATEGORY_PAGE_SIZE = 12;

// ── Cart hook ─────────────────────────────────────────────────────────────────

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

  function add(productKey: string, size?: string, option?: string) {
    setItems((prev) => {
      const found = prev.find((p) => p.productKey === productKey);
      if (found) return prev.map((p) => (p.productKey === productKey ? { ...p, qty: p.qty + 1 } : p));
      return [...prev, { productKey, qty: 1, size, option }];
    });
  }
  function dec(productKey: string) {
    setItems((prev) =>
      prev.map((p) => (p.productKey === productKey ? { ...p, qty: p.qty - 1 } : p)).filter((p) => p.qty > 0),
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

// ── Main component ─────────────────────────────────────────────────────────────

export default function ShopClient() {
  const { items, add, dec, remove, clear, loaded } = useCart();
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    discount: number;
    message: string;
  } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // Shipping form state
  const [needsShipping, setNeedsShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    postal: "",
    phone: "",
    method: "STANDARD",
  });

  // Fetch catalog
  useEffect(() => {
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setCatalogError(d.error);
        else setCatalog(d as CatalogData);
      })
      .catch((e) => setCatalogError(e.message));
  }, []);

  const productMap = useMemo<Map<string, ShopProduct>>(() => {
    if (!catalog) return new Map();
    return new Map(catalog.products.map((p) => [p.productKey, p]));
  }, [catalog]);

  const visibleProducts = useMemo<ShopProduct[]>(() => {
    if (!catalog) return [];
    if (activeTab === "ALL") return catalog.products;
    return catalog.byCategory[activeTab] ?? [];
  }, [catalog, activeTab]);

  const visibleTabs = useMemo(() => {
    if (!catalog) return DISPLAY_TABS.slice(0, 1);
    DEDUP_TAB_LABELS.clear();
    const result: typeof DISPLAY_TABS = [];
    for (const t of DISPLAY_TABS) {
      if (t.key !== "ALL" && (catalog.byCategory[t.key]?.length ?? 0) === 0) continue;
      if (t.key !== "ALL" && DEDUP_TAB_LABELS.has(t.label)) continue;
      DEDUP_TAB_LABELS.add(t.label);
      result.push(t);
    }
    return result;
  }, [catalog]);

  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((sum, i) => {
    const p = productMap.get(i.productKey);
    return sum + (p ? p.retailPrice * i.qty : 0);
  }, 0);

  const discountedTotal = couponResult?.valid ? total * (1 - couponResult.discount / 100) : total;
  const hasPhysical = items.some((i) => {
    const p = productMap.get(i.productKey);
    return p && p.fulfillmentType !== "DIGITAL";
  });

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setCouponResult(null);
    try {
      const res = await fetch(`/api/shop/coupon?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        setCouponResult({ valid: true, discount: data.discount || 0, message: data.message || `${data.discount}% off!` });
      } else {
        setCouponResult({ valid: false, discount: 0, message: data.error || "Invalid coupon code." });
      }
    } catch {
      setCouponResult({ valid: false, discount: 0, message: "Could not verify coupon." });
    } finally {
      setCouponChecking(false);
    }
  }

  async function checkout() {
    if (items.length === 0) return;
    // If physical items need shipping but form not shown yet
    if (hasPhysical && !needsShipping) {
      setNeedsShipping(true);
      return;
    }
    // Validate shipping form if needed
    if (hasPhysical && (!shippingForm.name || !shippingForm.address || !shippingForm.city || !shippingForm.country || !shippingForm.postal)) {
      setCheckoutErr("Please fill in your shipping address.");
      return;
    }

    setSubmitting(true);
    setCheckoutErr(null);
    try {
      const res = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productKey: i.productKey, qty: i.qty, size: i.size, option: i.option })),
          shipping: hasPhysical ? shippingForm : undefined,
          couponCode: couponResult?.valid ? couponCode.trim() : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        clear();
        window.location.href = data.url;
      } else if (data.mock) {
        setCheckoutErr(`Demo mode — order created: ${data.orderId}. Total: €${data.total?.toFixed(2)}`);
      } else {
        setCheckoutErr(data.error || "Checkout failed");
      }
    } catch (e: any) {
      setCheckoutErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const categoryMeta = catalog?.categoryMeta ?? {};

  return (
    <>
      {/* Sticky cart button */}
      <button
        onClick={() => setCartOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-coral-500 hover:bg-coral-600 text-white rounded-full pl-5 pr-6 py-3 shadow-lift flex items-center gap-2 font-semibold transition"
      >
        <ShoppingBag className="h-5 w-5" />
        {loaded && itemCount > 0 ? `${itemCount} · €${total.toFixed(0)}` : "Cart"}
      </button>

      {/* Category sticky tabs — scrollable on mobile */}
      <div className="sticky top-[65px] z-10 bg-white/90 backdrop-blur border-b border-cream-300 shadow-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1">
            {visibleTabs.map((tab) => {
              const count = tab.key === "ALL"
                ? (catalog?.products.length ?? 0)
                : (catalog?.byCategory[tab.key]?.length ?? 0);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-brand-700 text-white shadow-card"
                      : "text-navy-600 hover:bg-cream-200"
                  }`}
                >
                  {tab.label}
                  {catalog && count > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-cream-300 text-navy-500"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {catalogError && (
          <div className="bg-coral-50 border border-coral-200 text-coral-700 rounded-xl p-6 text-center mb-8">
            <p className="font-semibold">Could not load products</p>
            <p className="text-sm mt-1">{catalogError}</p>
          </div>
        )}

        {!catalog && !catalogError && (
          <div className="flex flex-col items-center py-20 text-navy-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading products…</p>
          </div>
        )}

        {catalog && visibleProducts.length === 0 && (
          <div className="text-center py-20 text-navy-400">
            <p className="font-semibold text-navy-600">No products in this category yet.</p>
            <button onClick={() => setActiveTab("ALL")} className="mt-3 text-brand-700 underline text-sm">
              View all products
            </button>
          </div>
        )}

        {catalog && visibleProducts.length > 0 && (
          <>
            {/* Popular section — featured products shown before tabs, only on ALL view */}
            {activeTab === "ALL" && (() => {
              const featured = catalog.products.filter((p) => p.isFeatured);
              if (featured.length === 0) return null;
              return (
                <section className="mb-14">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <p className="text-gold-600 text-xs font-semibold uppercase tracking-[0.2em]">
                        ⭐ Most Popular
                      </p>
                      <h2 className="font-display text-2xl text-navy-900 mt-0.5">Customer Favourites</h2>
                      <p className="text-navy-500 text-sm mt-1">Our top-rated products loved by guests.</p>
                    </div>
                  </div>
                  <ProductGrid products={featured} items={items} add={add} dec={dec} />
                </section>
              );
            })()}

            {/* Category heading when ALL is selected — group by category */}
            {activeTab === "ALL" ? (
              catalog.categories.map((cat) => {
                const prods = catalog.byCategory[cat] ?? [];
                if (prods.length === 0) return null;
                const meta = categoryMeta[cat] ?? { label: cat, blurb: "", icon: "" };
                const isExpanded = expandedCategories.has(cat);
                const displayProds = isExpanded ? prods : prods.slice(0, CATEGORY_PAGE_SIZE);
                const hasMore = prods.length > CATEGORY_PAGE_SIZE;
                return (
                  <section key={cat} className="mb-14">
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-brand-700 text-xs font-semibold uppercase tracking-[0.2em]">
                          {meta.label}
                        </p>
                        <h2 className="font-display text-2xl text-navy-900 mt-0.5">{meta.label}</h2>
                        {meta.blurb && <p className="text-navy-500 text-sm mt-1">{meta.blurb}</p>}
                      </div>
                      {hasMore && !isExpanded && (
                        <span className="text-xs text-navy-400">{prods.length} products</span>
                      )}
                    </div>
                    <ProductGrid products={displayProds} items={items} add={add} dec={dec} />
                    {hasMore && !isExpanded && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => setExpandedCategories((prev) => { const n = new Set(Array.from(prev)); n.add(cat); return n; })}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900 transition"
                        >
                          View all {prods.length} products →
                        </button>
                      </div>
                    )}
                  </section>
                );
              })
            ) : (
              (() => {
                const cat = activeTab;
                const isExpanded = expandedCategories.has(cat);
                const displayProds = isExpanded ? visibleProducts : visibleProducts.slice(0, CATEGORY_PAGE_SIZE);
                const hasMore = visibleProducts.length > CATEGORY_PAGE_SIZE;
                return (
                  <>
                    <ProductGrid products={displayProds} items={items} add={add} dec={dec} />
                    {hasMore && !isExpanded && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setExpandedCategories((prev) => { const n = new Set(Array.from(prev)); n.add(cat); return n; })}
                          className="inline-flex items-center gap-2 bg-cream-200 hover:bg-cream-300 text-navy-700 font-semibold px-6 py-3 rounded-full transition text-sm"
                        >
                          View all {visibleProducts.length} products →
                        </button>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </>
        )}
      </main>

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
          />
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-[460px] bg-white shadow-lift flex flex-col">
            <header className="px-6 py-5 border-b border-cream-300 flex items-center justify-between">
              <h3 className="font-display text-2xl text-navy-900">Your cart</h3>
              <button
                onClick={() => setCartOpen(false)}
                className="h-9 w-9 rounded-full hover:bg-cream-200 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-navy-700" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="text-center text-navy-500 py-16">
                  <ShoppingBag className="h-10 w-10 mx-auto text-navy-300 mb-3" />
                  <p>Your cart is empty.</p>
                  <p className="text-sm mt-1">Add a product to get started.</p>
                </div>
              ) : (
                <ul className="divide-y divide-cream-300">
                  {items.map((item) => {
                    const p = productMap.get(item.productKey);
                    if (!p) return null;
                    return (
                      <li key={item.productKey} className="py-4 flex items-center gap-3">
                        <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-brand-700 font-display text-lg shrink-0">
                          {p.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-navy-900 truncate">{p.name}</div>
                          {item.size && <div className="text-xs text-navy-400">{item.size}</div>}
                          <div className="text-xs text-navy-400">€{p.retailPrice.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center gap-1 bg-cream-200 rounded-full px-1.5 py-1">
                          <button onClick={() => dec(item.productKey)} className="h-6 w-6 rounded-full hover:bg-white flex items-center justify-center">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                          <button onClick={() => add(item.productKey)} className="h-6 w-6 rounded-full hover:bg-white flex items-center justify-center">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => remove(item.productKey)} className="text-navy-400 hover:text-coral-600 ml-1" aria-label="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Shipping form for physical items */}
              {needsShipping && hasPhysical && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-navy-900">Shipping address</h4>
                  {(["name", "address", "city", "country", "postal", "phone"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-1 capitalize">
                        {field === "postal" ? "Postcode / ZIP" : field}
                        {field !== "phone" && <span className="text-coral-500 ml-0.5">*</span>}
                      </label>
                      <input
                        type={field === "phone" ? "tel" : "text"}
                        value={shippingForm[field]}
                        onChange={(e) => setShippingForm((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="w-full rounded-lg border border-cream-400 bg-cream-50 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        placeholder={field === "postal" ? "e.g. SW1A 1AA" : ""}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-navy-500 mb-1">
                      Shipping method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["STANDARD", "EXPRESS"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setShippingForm((p) => ({ ...p, method: m }))}
                          className={`py-2 px-3 rounded-lg border text-sm font-semibold transition ${shippingForm.method === m ? "border-brand-700 bg-brand-50 text-brand-700" : "border-cream-400 text-navy-600 hover:border-brand-400"}`}
                        >
                          {m === "STANDARD" ? "Standard (+€5)" : "Express (+€15)"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="px-6 py-5 border-t border-cream-300 bg-cream-100">
              {/* Coupon */}
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

              {/* Totals */}
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
              {hasPhysical && needsShipping && (
                <div className="flex items-center justify-between mb-1 text-navy-500 text-sm">
                  <span>Shipping ({shippingForm.method})</span>
                  <span>+€{shippingForm.method === "EXPRESS" ? "15.00" : "5.00"}</span>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="text-navy-500 font-semibold">Total</span>
                <span className="text-2xl font-bold text-navy-900">€{discountedTotal.toFixed(2)}</span>
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
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                ) : needsShipping && hasPhysical ? (
                  <><Check className="h-4 w-4" /> Place order</>
                ) : (
                  <><ChevronRight className="h-4 w-4" /> {hasPhysical ? "Enter shipping details" : "Checkout"}</>
                )}
              </button>

              <Link href="/portfolio" className="block text-center mt-3 text-sm text-navy-500 hover:text-navy-900">
                Continue browsing
              </Link>
            </footer>
          </aside>
        </div>
      )}
    </>
  );
}

// ── Product grid sub-component ──────────────────────────────────────────────

function ProductGrid({
  products,
  items,
  add,
  dec,
}: {
  products: ShopProduct[];
  items: CartItem[];
  add: (key: string, size?: string, option?: string) => void;
  dec: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((p) => {
        const inCart = items.find((i) => i.productKey === p.productKey)?.qty || 0;
        const initials = p.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
        const categoryBadge = p.category.replace(/_/g, " ");

        return (
          <div
            key={p.id}
            className="relative bg-white rounded-2xl ring-1 ring-cream-300 shadow-card hover:shadow-lift transition flex flex-col overflow-hidden"
          >
            {/* Featured badge */}
            {p.isFeatured && (
              <span className="absolute top-3 right-3 z-10 bg-gold-500 text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full shadow-card">
                Popular
              </span>
            )}

            {/* Mockup / placeholder area */}
            <Link href={`/shop/${p.productKey}`} className="block">
              {p.mockupUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.mockupUrl}
                  alt={p.name}
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-100 via-brand-200 to-coral-100 flex flex-col items-center justify-center text-brand-700">
                  <span className="font-display text-4xl opacity-60">{initials}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40 mt-1">
                    {categoryBadge}
                  </span>
                </div>
              )}
            </Link>

            <div className="p-5 flex flex-col flex-1">
              {/* Category badge */}
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-600 mb-1.5">
                {categoryBadge}
              </span>
              <Link href={`/shop/${p.productKey}`}>
                <h3 className="font-display text-lg text-navy-900 leading-tight hover:text-brand-700 transition">
                  {p.name}
                </h3>
              </Link>
              <p className="text-navy-500 text-sm mt-1.5 leading-snug flex-1 line-clamp-2">
                {p.description}
              </p>
              {p.turnaround && (
                <p className="text-xs text-navy-400 mt-1.5">⏱ {p.turnaround}</p>
              )}

              <div className="flex items-end justify-between mt-4 pt-4 border-t border-cream-200">
                <div>
                  <div className="text-xs text-navy-400 mb-0.5">from</div>
                  <div className="text-2xl font-bold text-navy-900">
                    €{p.retailPrice.toFixed(p.retailPrice % 1 ? 2 : 0)}
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
          </div>
        );
      })}
    </div>
  );
}
