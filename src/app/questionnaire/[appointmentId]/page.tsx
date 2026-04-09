"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Camera, Sun, Check, Loader2, Users, Sparkles, Palette, Heart, Waves } from "lucide-react";

type FormData = {
  groupSize: number | "";
  specialOccasion: string;
  preferredStyle: string;
  comfortLevel: string;
  waterComfort: string;
  specialRequests: string;
};

const OCCASIONS = [
  { value: "none", label: "Just for fun" },
  { value: "anniversary", label: "Anniversary" },
  { value: "birthday", label: "Birthday" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family_reunion", label: "Family Reunion" },
];

const STYLES = [
  { value: "casual", label: "Casual & Natural", desc: "Relaxed, candid moments" },
  { value: "formal", label: "Formal & Posed", desc: "Classic portrait style" },
  { value: "fun", label: "Fun & Playful", desc: "Energetic, action shots" },
  { value: "romantic", label: "Romantic", desc: "Soft, intimate moments" },
  { value: "adventure", label: "Adventure", desc: "Bold, dramatic angles" },
];

const COMFORT_LEVELS = [
  { value: "very_comfortable", label: "Very comfortable", desc: "Love being in front of the camera" },
  { value: "a_bit_shy", label: "A bit shy", desc: "Could use some direction" },
  { value: "first_time", label: "First time", desc: "Never had a professional shoot" },
];

const WATER_LEVELS = [
  { value: "loves_water", label: "Loves water", desc: "Splash zones welcome!" },
  { value: "prefers_dry", label: "Prefers dry", desc: "Beach shots but no swimming" },
  { value: "cant_swim", label: "Can't swim", desc: "Stay on dry land please" },
];

export default function QuestionnairePage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [form, setForm] = useState<FormData>({
    groupSize: "",
    specialOccasion: "none",
    preferredStyle: "casual",
    comfortLevel: "very_comfortable",
    waterComfort: "loves_water",
    specialRequests: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    fetch(`/api/questionnaire/${appointmentId}`)
      .then((r) => r.json())
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
        } else if (res.data) {
          setForm({
            groupSize: res.data.groupSize ?? "",
            specialOccasion: res.data.specialOccasion ?? "none",
            preferredStyle: res.data.preferredStyle ?? "casual",
            comfortLevel: res.data.comfortLevel ?? "very_comfortable",
            waterComfort: res.data.waterComfort ?? "loves_water",
            specialRequests: res.data.specialRequests ?? "",
          });
          if (res.data.answeredAt) setSubmitted(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [appointmentId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        specialOccasion: form.specialOccasion,
        preferredStyle: form.preferredStyle,
        comfortLevel: form.comfortLevel,
        waterComfort: form.waterComfort,
        specialRequests: form.specialRequests || undefined,
      };
      if (form.groupSize !== "" && form.groupSize > 0) {
        payload.groupSize = Number(form.groupSize);
      }
      const res = await fetch(`/api/questionnaire/${appointmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed to submit");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-coral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-coral-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-coral-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Camera className="h-12 w-12 text-navy-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Appointment Not Found</h1>
          <p className="text-navy-400">This questionnaire link may have expired or is no longer valid.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-coral-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Thank You!</h1>
          <p className="text-navy-500">
            Your photographer will be prepared for your session. We can't wait to capture your amazing memories!
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-coral-500 text-sm">
            <Sun className="h-4 w-4" /> See you soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-coral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Camera className="h-6 w-6 text-coral-400" />
            <span className="text-coral-400 font-semibold text-sm tracking-wide uppercase">Fotiqo</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Pre-Session Questionnaire</h1>
          <p className="text-navy-300 text-sm max-w-md mx-auto">
            Help your photographer prepare for the perfect shoot. Takes just 2 minutes.
          </p>
        </div>
        <div className="h-1 bg-gradient-to-r from-coral-400 via-gold-400 to-coral-400" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Group Size */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-coral-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-coral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Group Size</h2>
              <p className="text-sm text-navy-400">How many people will be in the photos?</p>
            </div>
          </div>
          <input
            type="number"
            min={1}
            max={50}
            placeholder="e.g. 4"
            value={form.groupSize}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                groupSize: e.target.value ? parseInt(e.target.value) : "",
              }))
            }
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-navy-800 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent"
          />
        </section>

        {/* Special Occasion */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-gold-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Special Occasion</h2>
              <p className="text-sm text-navy-400">Are you celebrating something?</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OCCASIONS.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => setForm((f) => ({ ...f, specialOccasion: o.value }))}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                  form.specialOccasion === o.value
                    ? "border-coral-500 bg-coral-50 text-coral-700"
                    : "border-cream-200 text-navy-600 hover:border-cream-300 hover:bg-cream-50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </section>

        {/* Preferred Style */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Palette className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Preferred Style</h2>
              <p className="text-sm text-navy-400">What vibe are you going for?</p>
            </div>
          </div>
          <div className="space-y-2">
            {STYLES.map((s) => (
              <button
                type="button"
                key={s.value}
                onClick={() => setForm((f) => ({ ...f, preferredStyle: s.value }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                  form.preferredStyle === s.value
                    ? "border-coral-500 bg-coral-50"
                    : "border-cream-200 hover:border-cream-300 hover:bg-cream-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    form.preferredStyle === s.value
                      ? "border-coral-500 bg-coral-500"
                      : "border-cream-300"
                  }`}
                >
                  {form.preferredStyle === s.value && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-navy-800">{s.label}</div>
                  <div className="text-xs text-navy-400">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Comfort Level */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-coral-100 flex items-center justify-center">
              <Heart className="h-5 w-5 text-coral-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Comfort Level</h2>
              <p className="text-sm text-navy-400">How do you feel in front of a camera?</p>
            </div>
          </div>
          <div className="space-y-2">
            {COMFORT_LEVELS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setForm((f) => ({ ...f, comfortLevel: c.value }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                  form.comfortLevel === c.value
                    ? "border-coral-500 bg-coral-50"
                    : "border-cream-200 hover:border-cream-300 hover:bg-cream-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    form.comfortLevel === c.value
                      ? "border-coral-500 bg-coral-500"
                      : "border-cream-300"
                  }`}
                >
                  {form.comfortLevel === c.value && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-navy-800">{c.label}</div>
                  <div className="text-xs text-navy-400">{c.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Water Comfort */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
              <Waves className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Water Comfort</h2>
              <p className="text-sm text-navy-400">Are water photos on the table?</p>
            </div>
          </div>
          <div className="space-y-2">
            {WATER_LEVELS.map((w) => (
              <button
                type="button"
                key={w.value}
                onClick={() => setForm((f) => ({ ...f, waterComfort: w.value }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border ${
                  form.waterComfort === w.value
                    ? "border-coral-500 bg-coral-50"
                    : "border-cream-200 hover:border-cream-300 hover:bg-cream-50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                    form.waterComfort === w.value
                      ? "border-coral-500 bg-coral-500"
                      : "border-cream-300"
                  }`}
                >
                  {form.waterComfort === w.value && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-navy-800">{w.label}</div>
                  <div className="text-xs text-navy-400">{w.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Special Requests */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center">
              <Camera className="h-5 w-5 text-navy-500" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Special Requests</h2>
              <p className="text-sm text-navy-400">Anything else your photographer should know?</p>
            </div>
          </div>
          <textarea
            placeholder="e.g. We'd love photos at sunset, our daughter is shy, we have matching outfits..."
            value={form.specialRequests}
            onChange={(e) => setForm((f) => ({ ...f, specialRequests: e.target.value }))}
            maxLength={1000}
            rows={4}
            className="w-full rounded-xl border border-cream-300 px-4 py-3 text-navy-800 resize-y focus:outline-none focus:ring-2 focus:ring-coral-400 focus:border-transparent"
          />
          <div className="text-right text-xs text-navy-300 mt-1">{form.specialRequests.length}/1000</div>
        </section>

        {/* Submit */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 text-white font-semibold text-lg hover:from-coral-600 hover:to-coral-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-coral-500/20"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Check className="h-5 w-5" /> Submit Questionnaire
            </>
          )}
        </button>

        <p className="text-center text-xs text-navy-300 pb-8">
          Fotiqo Photography &middot; Your memories, our passion
        </p>
      </form>
    </div>
  );
}
