"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Loader2,
  CreditCard,
  Image as ImageIcon,
  Type,
  Eye,
  ShoppingCart,
} from "lucide-react";
import {
  CARD_TYPES,
  CARD_TEMPLATES,
  CARD_PRICING,
  getTemplatesByType,
  getTemplateById,
  type CardType,
  type CardTemplate,
  type CardQuantity,
} from "@/lib/card-templates";
import { photoRef } from "@/lib/cloudinary";

/* ────────────────────────────────────────────── */
/*  Types                                         */
/* ────────────────────────────────────────────── */

type Photo = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
  isHookImage: boolean;
};

type StepId = "type" | "template" | "photo" | "text" | "preview" | "checkout";

const STEPS: { id: StepId; label: string; icon: React.ReactNode }[] = [
  { id: "type", label: "Card Type", icon: <CreditCard className="h-4 w-4" /> },
  { id: "template", label: "Template", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "photo", label: "Photo", icon: <ImageIcon className="h-4 w-4" /> },
  { id: "text", label: "Message", icon: <Type className="h-4 w-4" /> },
  { id: "preview", label: "Preview", icon: <Eye className="h-4 w-4" /> },
  { id: "checkout", label: "Order", icon: <ShoppingCart className="h-4 w-4" /> },
];

/* ────────────────────────────────────────────── */
/*  Component                                     */
/* ────────────────────────────────────────────── */

export default function CardDesignerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.magicLinkToken as string;

  // Wizard state
  const [step, setStep] = useState<StepId>("type");
  const [cardType, setCardType] = useState<CardType | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [quantity, setQuantity] = useState<CardQuantity>(10);
  const [showBack, setShowBack] = useState(false);

  // Data
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery photos
  useEffect(() => {
    fetch(`/api/gallery/${token}`)
      .then((r) => r.json())
      .then((data) => {
        const g = data.gallery || data;
        setPhotos(g.photos || []);
      })
      .catch(() => setPhotos([]))
      .finally(() => setLoadingPhotos(false));
  }, [token]);

  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const template = templateId ? getTemplateById(templateId) : null;
  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);
  const photoUrl = selectedPhoto ? photoRef(selectedPhoto) : "";

  const availableTemplates = useMemo(
    () => (cardType ? getTemplatesByType(cardType) : []),
    [cardType],
  );

  /* ── Navigation ── */

  function canProceed(): boolean {
    switch (step) {
      case "type": return cardType !== null;
      case "template": return templateId !== null;
      case "photo": return selectedPhotoId !== null;
      case "text": return true;
      case "preview": return true;
      case "checkout": return true;
      default: return false;
    }
  }

  function goNext() {
    const idx = stepIdx;
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
  }

  function goBack() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1].id);
  }

  function goToStep(s: StepId) {
    const target = STEPS.findIndex((x) => x.id === s);
    if (target <= stepIdx) setStep(s);
  }

  /* ── Checkout ── */

  async function handleCheckout() {
    if (!cardType || !templateId || !selectedPhotoId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/gallery/${token}/card-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardType, templateId, photoId: selectedPhotoId, frontText, backText, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order failed");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Card Preview Component ── */

  function CardPreview({ side, compact }: { side: "front" | "back"; compact?: boolean }) {
    if (!template) return null;
    const aspect = compact ? "aspect-[5/7]" : "aspect-[5/7]";
    const fontSize = compact ? "text-xs" : "text-base";
    const fontFamily =
      template.fontStyle === "serif"
        ? "font-serif"
        : template.fontStyle === "script"
          ? "font-serif italic"
          : "font-sans";

    if (side === "front") {
      return (
        <div
          className={`relative ${aspect} rounded-xl overflow-hidden shadow-lg ${template.decorations}`}
          style={{ borderColor: template.borderColor, backgroundColor: template.bgColor }}
        >
          {template.photoPosition === "top" && (
            <>
              <div className="h-[60%] overflow-hidden">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-cream-200 flex items-center justify-center text-navy-300">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className={`h-[40%] flex items-center justify-center px-4 ${fontFamily} ${fontSize}`} style={{ color: template.textColor }}>
                <p className="text-center leading-relaxed">{frontText || "Your message here"}</p>
              </div>
            </>
          )}
          {template.photoPosition === "center" && (
            <div className="relative w-full h-full">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="w-full h-full object-cover" draggable={false} />
              ) : (
                <div className="w-full h-full bg-cream-200 flex items-center justify-center text-navy-300">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className={`text-white text-center ${fontFamily} ${fontSize} leading-relaxed drop-shadow-lg`}>
                  {frontText || "Your message here"}
                </p>
              </div>
            </div>
          )}
          {template.photoPosition === "left" && (
            <div className="flex w-full h-full">
              <div className="w-[45%] overflow-hidden">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <div className="w-full h-full bg-cream-200 flex items-center justify-center text-navy-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className={`w-[55%] flex items-center justify-center px-3 ${fontFamily} ${fontSize}`} style={{ color: template.textColor }}>
                <p className="text-center leading-relaxed">{frontText || "Your message here"}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Back side
    return (
      <div
        className={`relative ${aspect} rounded-xl overflow-hidden shadow-lg border-2 flex items-center justify-center p-6`}
        style={{ borderColor: template.borderColor, backgroundColor: template.bgColor }}
      >
        <div className={`text-center ${fontFamily} ${fontSize}`} style={{ color: template.textColor }}>
          <p className="leading-relaxed">{backText || "Back of card"}</p>
          <div className="mt-4 pt-4 border-t opacity-40 text-[10px] uppercase tracking-widest" style={{ borderColor: template.borderColor }}>
            Fotiqo
          </div>
        </div>
      </div>
    );
  }

  /* ── Render Steps ── */

  function renderStep() {
    switch (step) {
      case "type":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900">Choose your card type</h2>
            <p className="text-navy-500 text-sm">What kind of card would you like to create?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {CARD_TYPES.map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => {
                    setCardType(ct.key);
                    setTemplateId(null);
                  }}
                  className={`p-6 rounded-2xl border-2 text-left transition group ${
                    cardType === ct.key
                      ? "border-coral-500 bg-coral-50 shadow-md"
                      : "border-cream-300 bg-white hover:border-coral-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-3">{ct.icon}</div>
                  <div className="font-display text-lg text-navy-900">{ct.label}</div>
                  <div className="text-navy-400 text-sm mt-1">{ct.description}</div>
                  {cardType === ct.key && (
                    <div className="mt-3 inline-flex items-center gap-1 text-coral-600 text-xs font-semibold">
                      <Check className="h-3.5 w-3.5" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case "template":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900">Pick a template</h2>
            <p className="text-navy-500 text-sm">Choose a design for your {cardType?.replace("_", " ")} card.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {availableTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplateId(t.id)}
                  className={`rounded-2xl border-2 overflow-hidden transition ${
                    templateId === t.id
                      ? "border-coral-500 shadow-lg ring-2 ring-coral-500/30"
                      : "border-cream-300 hover:border-coral-300 hover:shadow-md"
                  }`}
                >
                  {/* Mini card preview */}
                  <div className="p-4">
                    <div
                      className={`aspect-[5/7] rounded-lg ${t.decorations} flex items-center justify-center`}
                      style={{ borderColor: t.borderColor, backgroundColor: t.bgColor }}
                    >
                      <div className="space-y-2 p-3 text-center">
                        <div
                          className="h-16 w-20 mx-auto rounded bg-cream-200 flex items-center justify-center"
                        >
                          <ImageIcon className="h-5 w-5 text-navy-300" />
                        </div>
                        <div
                          className={`text-xs ${
                            t.fontStyle === "serif" ? "font-serif" : t.fontStyle === "script" ? "font-serif italic" : "font-sans"
                          }`}
                          style={{ color: t.textColor }}
                        >
                          {t.name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="font-semibold text-navy-900 text-sm">{t.name}</div>
                    <div className="text-navy-400 text-xs capitalize">{t.fontStyle} font</div>
                    {templateId === t.id && (
                      <div className="mt-2 inline-flex items-center gap-1 text-coral-600 text-xs font-semibold">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-navy-900">Choose a photo</h2>
            <p className="text-navy-500 text-sm">Select the photo to feature on your card.</p>
            {loadingPhotos ? (
              <div className="flex items-center gap-2 text-navy-400 py-12 justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading photos...
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12 text-navy-400">No photos available.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-6">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPhotoId(p.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden ring-2 transition ${
                      selectedPhotoId === p.id
                        ? "ring-coral-500 shadow-lg"
                        : "ring-transparent hover:ring-coral-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoRef(p)}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {selectedPhotoId === p.id && (
                      <div className="absolute inset-0 bg-coral-500/20 flex items-center justify-center">
                        <div className="bg-coral-500 text-white rounded-full h-8 w-8 flex items-center justify-center">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* Live preview aside */}
            {selectedPhotoId && template && (
              <div className="mt-8 flex justify-center">
                <div className="w-48">
                  <div className="text-xs uppercase tracking-wider font-semibold text-navy-400 mb-2 text-center">
                    Preview
                  </div>
                  <CardPreview side="front" compact />
                </div>
              </div>
            )}
          </div>
        );

      case "text":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-navy-900">Add your message</h2>
            <p className="text-navy-500 text-sm">Personalize your card with a message on the front and back.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">Front Message</label>
                  <textarea
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Greetings from paradise!"
                    className="w-full rounded-xl border border-cream-300 px-4 py-3 text-navy-900 placeholder:text-navy-300 focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition resize-none"
                  />
                  <div className="text-xs text-navy-300 mt-1 text-right">{frontText.length}/200</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-1.5">Back Message</label>
                  <textarea
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="We had the most amazing vacation in Tunisia. Wish you were here with us!"
                    className="w-full rounded-xl border border-cream-300 px-4 py-3 text-navy-900 placeholder:text-navy-300 focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition resize-none"
                  />
                  <div className="text-xs text-navy-300 mt-1 text-right">{backText.length}/300</div>
                </div>
              </div>
              {/* Live preview */}
              {template && (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-xs uppercase tracking-wider font-semibold text-navy-400">Live Preview</div>
                  <div className="w-56">
                    <CardPreview side="front" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "preview":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-navy-900">Preview your card</h2>
            <p className="text-navy-500 text-sm">Flip between front and back to review your design.</p>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setShowBack(false)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  !showBack ? "bg-coral-500 text-white" : "bg-cream-200 text-navy-600 hover:bg-cream-300"
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setShowBack(true)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  showBack ? "bg-coral-500 text-white" : "bg-cream-200 text-navy-600 hover:bg-cream-300"
                }`}
              >
                Back
              </button>
            </div>
            <div className="flex justify-center mt-4">
              <div className="w-72 transition-all duration-300">
                <CardPreview side={showBack ? "back" : "front"} />
              </div>
            </div>
            {template && (
              <div className="text-center text-navy-400 text-sm mt-4">
                Template: <span className="font-semibold text-navy-600">{template.name}</span>
              </div>
            )}
          </div>
        );

      case "checkout":
        return (
          <div className="space-y-6">
            <h2 className="font-display text-2xl text-navy-900">Place your order</h2>
            <p className="text-navy-500 text-sm">Choose your quantity and complete your order.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-lg mx-auto">
              {([10, 20] as CardQuantity[]).map((qty) => {
                const priceEur = CARD_PRICING[qty] / 100;
                const perCard = (priceEur / qty).toFixed(2);
                return (
                  <button
                    key={qty}
                    onClick={() => setQuantity(qty)}
                    className={`p-6 rounded-2xl border-2 text-center transition ${
                      quantity === qty
                        ? "border-coral-500 bg-coral-50 shadow-md"
                        : "border-cream-300 bg-white hover:border-coral-300"
                    }`}
                  >
                    <div className="font-display text-3xl text-navy-900">{qty}</div>
                    <div className="text-navy-500 text-sm">cards</div>
                    <div className="mt-3 font-display text-2xl text-coral-600">&euro;{priceEur}</div>
                    <div className="text-navy-400 text-xs">&euro;{perCard} per card</div>
                    {quantity === qty && (
                      <div className="mt-2 inline-flex items-center gap-1 text-coral-600 text-xs font-semibold">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Order summary */}
            <div className="max-w-lg mx-auto mt-8 bg-cream-50 rounded-2xl p-6 border border-cream-300">
              <div className="text-xs uppercase tracking-wider font-semibold text-navy-400 mb-4">Order Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-500">Card type</span>
                  <span className="text-navy-900 font-medium capitalize">{cardType?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Template</span>
                  <span className="text-navy-900 font-medium">{template?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-navy-500">Quantity</span>
                  <span className="text-navy-900 font-medium">{quantity} cards</span>
                </div>
                <div className="border-t border-cream-300 my-2" />
                <div className="flex justify-between text-base font-display">
                  <span className="text-navy-900">Total</span>
                  <span className="text-coral-600">&euro;{(CARD_PRICING[quantity] / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="max-w-lg mx-auto bg-coral-50 border border-coral-200 text-coral-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex justify-center mt-6">
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="bg-coral-500 hover:bg-coral-600 disabled:bg-cream-300 disabled:text-navy-400 text-white font-semibold px-8 py-3 rounded-full transition inline-flex items-center gap-2 text-lg"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {submitting ? "Processing..." : `Order ${quantity} cards for \u20AC${(CARD_PRICING[quantity] / 100).toFixed(2)}`}
              </button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top bar */}
      <header className="bg-white border-b border-cream-300 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push(`/gallery/${token}`)}
            className="inline-flex items-center gap-1.5 text-navy-500 hover:text-navy-900 text-sm transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Gallery
          </button>
          <div className="text-xs uppercase tracking-widest text-navy-400 font-semibold">
            Card Designer
          </div>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="bg-white border-b border-cream-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isCurrent = s.id === step;
              const isPast = i < stepIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(s.id)}
                  disabled={i > stepIdx}
                  className={`flex flex-col items-center gap-1.5 transition group ${
                    i > stepIdx ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition ${
                      isCurrent
                        ? "bg-coral-500 text-white shadow-md"
                        : isPast
                          ? "bg-coral-100 text-coral-600"
                          : "bg-cream-200 text-navy-400"
                    }`}
                  >
                    {isPast ? <Check className="h-4 w-4" /> : s.icon}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold hidden sm:block ${
                      isCurrent ? "text-coral-600" : isPast ? "text-navy-600" : "text-navy-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-coral-500 rounded-full transition-all duration-500"
              style={{ width: `${((stepIdx + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderStep()}
      </main>

      {/* Navigation footer */}
      {step !== "checkout" && (
        <footer className="sticky bottom-0 bg-white border-t border-cream-300 py-4 z-20">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1.5 text-navy-500 hover:text-navy-900 disabled:opacity-30 disabled:cursor-not-allowed transition font-medium"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="bg-coral-500 hover:bg-coral-600 disabled:bg-cream-300 disabled:text-navy-400 text-white font-semibold px-6 py-2.5 rounded-full transition inline-flex items-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
