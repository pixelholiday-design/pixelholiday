"use client";

import { useState, useMemo } from "react";
import { X, Check, Shuffle, ChevronLeft, ChevronRight, BookOpen, ShoppingBag } from "lucide-react";
import { photoRef, cleanUrl, watermarkedUrl } from "@/lib/cloudinary";
import type { CartItem } from "@/components/gallery/ShopCart";

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isPurchased?: boolean;
};

type BookType = {
  key: string;
  name: string;
  price: number;
  description: string;
  badge?: string;
  covers: string[];
  sizes: string[];
};

const BOOK_TYPES: BookType[] = [
  {
    key: "book_softcover",
    name: "Softcover",
    price: 35,
    description: "Matte or gloss cover, lay-flat pages.",
    covers: ["Matte", "Gloss"],
    sizes: ['8"×8"', '8"×10"'],
  },
  {
    key: "book_hardcover",
    name: "Hardcover",
    price: 65,
    badge: "Popular",
    description: "Durable cover in linen or leather finish.",
    covers: ["Linen", "Leather"],
    sizes: ['8"×8"', '8"×10"', '10"×10"'],
  },
  {
    key: "book_layflat",
    name: "Premium Layflat",
    price: 129,
    badge: "Premium",
    description: "Ultra-thick pages, seamless spreads, silk or metallic cover.",
    covers: ["Silk", "Metallic"],
    sizes: ['10"×10"', '10"×12"', '12"×12"'],
  },
];

const PAGE_COUNTS = [20, 30, 40];
const MIN_PHOTOS = 10;

type Step = 1 | 2 | 3 | 4;

export default function BookBuilder({
  photos,
  isPaid,
  onClose,
  onAddToCart,
  initialProduct,
}: {
  photos: Photo[];
  isPaid: boolean;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  initialProduct?: { key: string; name: string; price: number } | null;
}) {
  const [step, setStep] = useState<Step>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bookTypeKey, setBookTypeKey] = useState<string>(
    initialProduct?.key ?? BOOK_TYPES[1].key
  );
  const [cover, setCover] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [pageCount, setPageCount] = useState(20);
  const [pageOrder, setPageOrder] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const selectedBook = BOOK_TYPES.find((b) => b.key === bookTypeKey) ?? BOOK_TYPES[1];

  // Init cover/size when book type changes
  function selectBook(key: string) {
    const b = BOOK_TYPES.find((bt) => bt.key === key);
    if (!b) return;
    setBookTypeKey(key);
    setCover(b.covers[0]);
    setSize(b.sizes[0]);
  }

  // When cover/size not set yet
  if (!cover && selectedBook.covers.length > 0) setCover(selectedBook.covers[0]);
  if (!size && selectedBook.sizes.length > 0) setSize(selectedBook.sizes[0]);

  const selectedPhotos = useMemo(
    () => photos.filter((p) => selectedIds.has(p.id)),
    [photos, selectedIds]
  );

  function togglePhoto(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(photos.map((p) => p.id)));
  }

  function autoBest() {
    // "Best" = first N photos (AI-culled ones would be filtered server-side already)
    const best = photos.slice(0, Math.min(pageCount, photos.length));
    setSelectedIds(new Set(best.map((p) => p.id)));
  }

  function initPageOrder(ids: string[]) {
    setPageOrder(ids);
  }

  function shuffle() {
    setPageOrder((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }

  function goToStep(s: Step) {
    if (s === 3 && pageOrder.length === 0) {
      initPageOrder(Array.from(selectedIds));
    }
    setStep(s);
  }

  const orderedPhotos = useMemo(() => {
    if (pageOrder.length === 0) return selectedPhotos;
    const byId = new Map(selectedPhotos.map((p) => [p.id, p]));
    return pageOrder.map((id) => byId.get(id)).filter(Boolean) as Photo[];
  }, [selectedPhotos, pageOrder]);

  const spreads = useMemo(() => {
    const result: [Photo | null, Photo | null][] = [];
    for (let i = 0; i < orderedPhotos.length; i += 2) {
      result.push([orderedPhotos[i] ?? null, orderedPhotos[i + 1] ?? null]);
    }
    return result;
  }, [orderedPhotos]);

  const [previewSpread, setPreviewSpread] = useState(0);

  function handleAddToCart() {
    onAddToCart({
      productKey: selectedBook.key,
      productName: selectedBook.name,
      price: selectedBook.price,
      currency: "EUR",
      qty: 1,
      size: size || undefined,
      option: cover || undefined,
      isBook: true,
      bookConfig: {
        type: selectedBook.name,
        cover: cover,
        pageCount,
        photoCount: selectedPhotos.length,
      },
      photo: selectedPhotos[0] ?? undefined,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  }

  const canProceed1 = selectedIds.size >= MIN_PHOTOS;
  const canProceed2 = !!bookTypeKey && !!cover && !!size;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300 bg-white">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-brand-500" />
          <h2 className="font-display text-xl text-navy-900">Photo Book Builder</h2>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-cream-100 transition"
        >
          <X className="h-5 w-5 text-navy-600" />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 px-6 py-3 border-b border-cream-200 bg-cream-50">
        {(["1", "2", "3", "4"] as const).map((s, i) => {
          const labels = ["Select Photos", "Choose Book", "Preview", "Order"];
          const n = i + 1 as Step;
          const active = step === n;
          const done = step > n;
          return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    done ? "bg-green-500 text-white" :
                    active ? "bg-navy-900 text-white" :
                    "bg-cream-200 text-navy-400"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={`text-xs hidden sm:block ${active ? "text-navy-900 font-semibold" : "text-navy-400"}`}>
                  {labels[i]}
                </span>
              </div>
              {i < 3 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${done ? "bg-green-500" : "bg-cream-300"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">

        {/* ── STEP 1: Select Photos ── */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h3 className="font-display text-xl text-navy-900">Choose your photos</h3>
                <p className="text-sm text-navy-400 mt-0.5">
                  Select at least {MIN_PHOTOS} photos · {selectedIds.size} selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={autoBest}
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-navy-700 transition"
                >
                  Auto-select best
                </button>
                <button
                  onClick={selectAll}
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-navy-700 transition"
                >
                  Select all
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {photos.map((p) => {
                const ref = photoRef(p);
                const src = isPaid || p.isPurchased ? cleanUrl(ref, 400) : watermarkedUrl(ref, 400);
                const sel = selectedIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePhoto(p.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                      sel ? "border-brand-400 shadow-md scale-[1.02]" : "border-transparent opacity-80 hover:opacity-100 hover:border-cream-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {sel && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-400 rounded-full flex items-center justify-center shadow">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Choose Book ── */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
            <div>
              <h3 className="font-display text-xl text-navy-900 mb-1">Choose your book type</h3>
              <p className="text-sm text-navy-400">{selectedIds.size} photos selected</p>
            </div>

            {/* Book type cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {BOOK_TYPES.map((b) => (
                <button
                  key={b.key}
                  onClick={() => selectBook(b.key)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all ${
                    bookTypeKey === b.key
                      ? "border-navy-900 bg-navy-50 shadow-card"
                      : "border-cream-300 bg-white hover:border-navy-300"
                  }`}
                >
                  {b.badge && (
                    <span className="absolute top-3 right-3 text-xs font-bold text-gold-600 bg-gold-400/15 rounded-full px-2 py-0.5">
                      {b.badge}
                    </span>
                  )}
                  <p className="font-display text-xl text-navy-900 mb-1">{b.name}</p>
                  <p className="text-sm text-navy-500 mb-3">{b.description}</p>
                  <p className="font-display text-2xl text-navy-900">€{b.price}</p>
                </button>
              ))}
            </div>

            {/* Size */}
            <div>
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {selectedBook.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      size === s ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-700 border-cream-300 hover:border-navy-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover */}
            <div>
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Cover finish</p>
              <div className="flex flex-wrap gap-2">
                {selectedBook.covers.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCover(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      cover === c ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-700 border-cream-300 hover:border-navy-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Page count */}
            <div>
              <p className="text-xs font-semibold text-navy-600 uppercase tracking-wide mb-2">Pages</p>
              <div className="flex flex-wrap gap-2">
                {PAGE_COUNTS.map((pc) => (
                  <button
                    key={pc}
                    onClick={() => setPageCount(pc)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      pageCount === pc ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-700 border-cream-300 hover:border-navy-300"
                    }`}
                  >
                    {pc} pages
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview Layout ── */}
        {step === 3 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display text-xl text-navy-900">Preview your layout</h3>
                <p className="text-sm text-navy-400">
                  {orderedPhotos.length} photos · {Math.ceil(orderedPhotos.length / 2)} spreads
                </p>
              </div>
              <button
                onClick={shuffle}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-navy-700 text-sm font-semibold transition"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle order
              </button>
            </div>

            {/* Current spread preview */}
            {spreads.length > 0 && (
              <div className="relative">
                <div className="bg-cream-100 rounded-2xl overflow-hidden">
                  {/* Book spine line */}
                  <div className="relative flex h-64 sm:h-80">
                    {/* Left page */}
                    <div className="w-1/2 p-4 flex items-center justify-center border-r border-cream-300/50">
                      {spreads[previewSpread]?.[0] ? (
                        <div className="w-full h-full overflow-hidden rounded">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={isPaid || spreads[previewSpread][0]?.isPurchased
                              ? cleanUrl(photoRef(spreads[previewSpread][0]!), 600)
                              : watermarkedUrl(photoRef(spreads[previewSpread][0]!), 600)}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-cream-200 rounded flex items-center justify-center text-cream-300">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    {/* Right page */}
                    <div className="w-1/2 p-4 flex items-center justify-center">
                      {spreads[previewSpread]?.[1] ? (
                        <div className="w-full h-full overflow-hidden rounded">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={isPaid || spreads[previewSpread][1]?.isPurchased
                              ? cleanUrl(photoRef(spreads[previewSpread][1]!), 600)
                              : watermarkedUrl(photoRef(spreads[previewSpread][1]!), 600)}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-cream-200 rounded flex items-center justify-center text-cream-300">
                          <BookOpen className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spread navigation */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setPreviewSpread((s) => Math.max(0, s - 1))}
                    disabled={previewSpread === 0}
                    className="w-8 h-8 rounded-xl bg-white border border-cream-300 flex items-center justify-center disabled:opacity-30 transition hover:bg-cream-100"
                  >
                    <ChevronLeft className="h-4 w-4 text-navy-600" />
                  </button>
                  <span className="text-sm text-navy-500">
                    Spread {previewSpread + 1} of {spreads.length}
                  </span>
                  <button
                    onClick={() => setPreviewSpread((s) => Math.min(spreads.length - 1, s + 1))}
                    disabled={previewSpread === spreads.length - 1}
                    className="w-8 h-8 rounded-xl bg-white border border-cream-300 flex items-center justify-center disabled:opacity-30 transition hover:bg-cream-100"
                  >
                    <ChevronRight className="h-4 w-4 text-navy-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {orderedPhotos.map((p, i) => {
                const ref = photoRef(p);
                const src = isPaid || p.isPurchased ? cleanUrl(ref, 200) : watermarkedUrl(ref, 200);
                const spreadIdx = Math.floor(i / 2);
                return (
                  <button
                    key={p.id}
                    onClick={() => setPreviewSpread(spreadIdx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                      spreadIdx === previewSpread ? "border-brand-400" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>

            {/* Price tag */}
            <div className="bg-cream-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-navy-800">{selectedBook.name} · {size} · {cover}</p>
                <p className="text-sm text-navy-500">{pageCount} pages · {orderedPhotos.length} photos</p>
              </div>
              <p className="font-display text-2xl text-navy-900">€{selectedBook.price}</p>
            </div>
          </div>
        )}

        {/* ── STEP 4: Summary & Order ── */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <h3 className="font-display text-xl text-navy-900">Your photo book</h3>

            {/* Cover preview */}
            {selectedPhotos[0] && (
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-lg shadow-lift"
                  style={{ width: 180, height: 230, transform: "perspective(600px) rotateY(-10deg)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isPaid || selectedPhotos[0].isPurchased
                      ? cleanUrl(photoRef(selectedPhotos[0]), 600)
                      : watermarkedUrl(photoRef(selectedPhotos[0]), 600)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white font-display text-sm">{selectedBook.name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary table */}
            <div className="bg-cream-100 rounded-2xl divide-y divide-cream-200 overflow-hidden">
              {[
                ["Book type", selectedBook.name],
                ["Size", size],
                ["Cover finish", cover],
                ["Pages", `${pageCount} pages`],
                ["Photos", `${selectedPhotos.length} photos`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-navy-500">{label}</span>
                  <span className="text-sm font-semibold text-navy-900">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4 bg-white">
                <span className="font-semibold text-navy-800">Total</span>
                <span className="font-display text-2xl text-navy-900">€{selectedBook.price}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={added}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-base transition-all duration-200 ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : "bg-navy-900 hover:bg-navy-800 text-white hover:scale-[1.01]"
              }`}
            >
              {added ? (
                "Added to cart!"
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Add to cart · €{selectedBook.price}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="border-t border-cream-300 px-6 py-4 bg-white flex items-center justify-between gap-4">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-cream-300 text-navy-700 text-sm font-semibold hover:bg-cream-100 disabled:opacity-40 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-sm text-navy-400">Step {step} of 4</div>

        {step < 4 ? (
          <button
            onClick={() => goToStep((step + 1) as Step)}
            disabled={
              (step === 1 && !canProceed1) ||
              (step === 2 && !canProceed2)
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold disabled:opacity-40 transition"
          >
            {step === 1 ? `Next (${selectedIds.size} selected)` : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
