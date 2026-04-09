"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, ShoppingBag, ArrowLeft, Upload, Loader2, Check } from "lucide-react";

type ShopProduct = {
  id: string;
  productKey: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  retailPrice: number;
  fulfillmentType: string;
  turnaround?: string;
  mockupUrl?: string;
  isFeatured: boolean;
  sizes?: string; // JSON string
  options?: string; // JSON string
  defaultSize?: string;
  defaultOption?: string;
};

type CartItem = { productKey: string; qty: number; size?: string; option?: string };
const STORAGE_KEY = "pixelvo.cart.v2";

function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  function addItem(productKey: string, qty: number, size?: string, option?: string) {
    setItems((prev) => {
      const found = prev.find((p) => p.productKey === productKey);
      const updated = found
        ? prev.map((p) => (p.productKey === productKey ? { ...p, qty: p.qty + qty, size, option } : p))
        : [...prev, { productKey, qty, size, option }];
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }

  return { items, addItem };
}

export default function ProductDetailPage() {
  const params = useParams();
  const productKey = params?.productKey as string;

  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [related, setRelated] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    if (!productKey) return;
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d) => {
        const all: ShopProduct[] = d.products ?? [];
        const found = all.find((p) => p.productKey === productKey);
        if (!found) {
          setError("Product not found.");
        } else {
          setProduct(found);
          // Set defaults
          const sizes = parseSizes(found.sizes);
          const opts = parseOptions(found.options);
          setSelectedSize(found.defaultSize ?? (sizes[0]?.key ?? null));
          setSelectedOption(found.defaultOption ?? (opts[0]?.key ?? null));
          // Related = same subcategory first, then same category, up to 4
          const sameSubcat = found.subcategory
            ? all.filter(
                (p) =>
                  p.productKey !== found.productKey &&
                  p.category === found.category &&
                  p.subcategory === found.subcategory
              )
            : [];
          if (sameSubcat.length >= 4) {
            setRelated(sameSubcat.slice(0, 4));
          } else {
            const sameCat = all.filter(
              (p) =>
                p.productKey !== found.productKey &&
                p.category === found.category &&
                !sameSubcat.some((s) => s.productKey === p.productKey)
            );
            setRelated([...sameSubcat, ...sameCat].slice(0, 4));
          }
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [productKey]);

  function parseSizes(json?: string | null): { key: string; label: string }[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }
  function parseOptions(json?: string | null): { key: string; label: string }[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, []);

  function handleAddToCart() {
    if (!product) return;
    addItem(product.productKey, qty, selectedSize ?? undefined, selectedOption ?? undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-4">
        <p className="text-navy-500 text-center">{error || "Product not found."}</p>
        <Link href="/shop" className="mt-4 text-brand-700 font-semibold hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const sizes = parseSizes(product.sizes);
  const opts = parseOptions(product.options);
  const isPhysical = product.fulfillmentType !== "DIGITAL";
  const initials = product.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-cream-100 text-navy-900">
      {/* Nav */}
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-card">
        <Link href="/portfolio" className="font-display text-2xl text-navy-900 tracking-tight">
          Pixelvo
        </Link>
        <Link href="/shop" className="text-navy-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1 transition">
          <ShoppingBag className="h-4 w-4" /> Shop
        </Link>
      </nav>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 pt-6">
        <ol className="flex items-center flex-wrap gap-1 text-sm text-navy-500">
          <li>
            <Link href="/shop" className="hover:text-navy-900 transition font-medium">
              Shop
            </Link>
          </li>
          {product && (
            <>
              <li className="text-navy-300" aria-hidden>›</li>
              <li>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hover:text-navy-900 transition font-medium capitalize"
                >
                  {product.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </Link>
              </li>
              <li className="text-navy-300" aria-hidden>›</li>
              <li className="text-navy-900 font-semibold truncate max-w-[200px] sm:max-w-none">
                {product.name}
              </li>
            </>
          )}
          {!product && loading && (
            <>
              <li className="text-navy-300" aria-hidden>›</li>
              <li className="text-navy-300">…</li>
            </>
          )}
        </ol>
        <Link href="/shop" className="inline-flex items-center gap-1 text-sm text-navy-400 hover:text-navy-900 transition mt-2">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </nav>

      {/* Product detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: mockup */}
          <div>
            {product.mockupUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.mockupUrl}
                alt={product.name}
                className="w-full rounded-2xl shadow-lift object-cover aspect-square"
              />
            ) : (
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-100 via-brand-200 to-coral-100 flex flex-col items-center justify-center shadow-lift">
                <span className="font-display text-8xl opacity-40 text-brand-700">{initials}</span>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] opacity-30 text-brand-700 mt-3">
                  {product.category.replace(/_/g, " ")}
                </span>
              </div>
            )}
          </div>

          {/* Right: details */}
          <div>
            <span className="label-xs">
              {product.category.replace(/_/g, " ")}
            </span>
            <h1 className="heading text-4xl mt-1">{product.name}</h1>
            <p className="text-navy-500 mt-3 text-base leading-relaxed">{product.description}</p>

            {product.turnaround && (
              <div className="mt-4 inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-4 py-2 text-sm font-semibold">
                ⏱ {product.turnaround}
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedSize(s.key)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                        selectedSize === s.key
                          ? "border-brand-700 bg-brand-50 text-brand-700"
                          : "border-cream-400 text-navy-600 hover:border-brand-400"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Option selector */}
            {opts.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                  Finish
                </p>
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setSelectedOption(o.key)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                        selectedOption === o.key
                          ? "border-brand-700 bg-brand-50 text-brand-700"
                          : "border-cream-400 text-navy-600 hover:border-brand-400"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-navy-500 mb-2">
                Quantity
              </p>
              <div className="inline-flex items-center gap-3 bg-cream-200 rounded-full px-2 py-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full hover:bg-white flex items-center justify-center transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold w-8 text-center text-lg">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="h-8 w-8 rounded-full hover:bg-white flex items-center justify-center transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-end gap-3">
              <div>
                <div className="text-xs text-navy-400 mb-0.5">Total</div>
                <div className="font-display text-4xl text-navy-900">
                  €{(product.retailPrice * qty).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold text-base transition ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-coral-500 hover:bg-coral-600 text-white shadow-lift"
              }`}
            >
              {added ? (
                <><Check className="h-5 w-5" /> Added to cart!</>
              ) : (
                <><ShoppingBag className="h-5 w-5" /> Add to cart</>
              )}
            </button>
            {added && (
              <Link
                href="/shop"
                className="mt-3 block text-center text-sm text-brand-700 hover:underline font-semibold"
              >
                View cart & checkout →
              </Link>
            )}

            {/* Photo upload section */}
            {isPhysical && (
              <div className="mt-8 p-5 bg-brand-50 border border-brand-200 rounded-2xl">
                <h3 className="font-semibold text-navy-900 mb-1">Upload your photo</h3>
                <p className="text-sm text-navy-500 mb-3">
                  Attach the photo you want printed. Our lab will use the highest resolution version from your gallery if you leave this blank.
                </p>
                <label className="flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-xl p-6 transition bg-white">
                  <Upload className="h-8 w-8 text-brand-400" />
                  <span className="text-sm text-navy-500">
                    {photoFile ? photoFile.name : "Click to select a photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                </label>
                {photoPreview && (
                  <div className="mt-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="heading text-2xl mb-6">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p) => {
                const rel_initials = p.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.productKey}`}
                    className="group bg-white rounded-2xl ring-1 ring-cream-300 shadow-card hover:shadow-lift transition overflow-hidden"
                  >
                    {p.mockupUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.mockupUrl} alt={p.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="aspect-square bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-brand-700">
                        <span className="font-display text-3xl opacity-50">{rel_initials}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-navy-900 text-sm group-hover:text-brand-700 transition leading-tight">
                        {p.name}
                      </h3>
                      <div className="text-sm font-bold text-navy-900 mt-1">€{p.retailPrice.toFixed(2)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-300 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Pixelvo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
          <div className="text-xs text-navy-400">© {new Date().getFullYear()} Pixelvo</div>
        </div>
      </footer>
    </div>
  );
}
