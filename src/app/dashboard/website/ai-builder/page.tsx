"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle, ArrowRight, Palette, RotateCcw, ExternalLink, Pencil } from "lucide-react";

type Step = 1 | 2 | 3;

const SPECIALTIES = [
  "Wedding",
  "Portrait",
  "Family",
  "Event",
  "Commercial",
  "Newborn",
  "Other",
] as const;

const STYLES = [
  "Light & Airy",
  "Dark & Moody",
  "Classic & Timeless",
  "Bold & Colorful",
  "Film-inspired",
  "Minimalist",
] as const;

interface FormData {
  name: string;
  businessName: string;
  specialty: string;
  style: string;
  city: string;
  country: string;
  tagline: string;
  colorPreference: "auto" | "custom";
  customColor: string;
}

export default function AIBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    name: "",
    businessName: "",
    specialty: "Wedding",
    style: "Light & Airy",
    city: "",
    country: "",
    tagline: "",
    colorPreference: "auto",
    customColor: "#0EA5A5",
  });
  const [error, setError] = useState("");
  const [resultUsername, setResultUsername] = useState("");

  const update = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleBuild() {
    if (!form.name.trim() || !form.businessName.trim()) {
      setError("Name and business name are required.");
      return;
    }
    setError("");
    setStep(2);

    try {
      const res = await fetch("/api/dashboard/website/ai-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          businessName: form.businessName,
          specialty: form.specialty,
          style: form.style,
          location: { city: form.city, country: form.country },
          tagline: form.tagline,
          colorPreference:
            form.colorPreference === "custom" ? form.customColor : "auto",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to build website");
      }

      const data = await res.json();
      setResultUsername(data.username || "");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStep(1);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI Website Builder
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {step === 1 && "Tell us about your photography business"}
            {step === 2 && "AI is building your website..."}
            {step === 3 && "Your website is ready!"}
          </h1>
          <p className="text-gray-500 mt-2">
            {step === 1 && "Answer a few questions and we'll create a beautiful website for you."}
            {step === 2 && "Hang tight, this will only take a moment."}
            {step === 3 && "Preview it, customize it, or publish it right away."}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-8 bg-teal-600"
                  : s < step
                  ? "w-8 bg-teal-400"
                  : "w-8 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Form */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Jane Smith Photography"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialty
                </label>
                <select
                  value={form.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <select
                  value={form.style}
                  onChange={(e) => update("style", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="Los Angeles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  placeholder="United States"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline (optional)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                placeholder="Capturing your most beautiful moments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Preference
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorPref"
                    checked={form.colorPreference === "auto"}
                    onChange={() => update("colorPreference", "auto")}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Auto (based on style)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorPref"
                    checked={form.colorPreference === "custom"}
                    onChange={() => update("colorPreference", "custom")}
                    className="text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Custom</span>
                  <Palette className="w-4 h-4 text-gray-400" />
                </label>
              </div>
              {form.colorPreference === "custom" && (
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={form.customColor}
                    onChange={(e) => update("customColor", e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">{form.customColor}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleBuild}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Build My Website
            </button>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-6" />
            <p className="text-lg font-medium text-gray-700">
              Creating your hero section...
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Setting up gallery, services, and more
            </p>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-teal-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Website Created Successfully
              </h2>
              <p className="text-gray-500 mt-1">
                Your photography website has been generated with all the essentials.
              </p>
            </div>

            <div className="space-y-3">
              {resultUsername && (
                <a
                  href={`/p/${resultUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Preview Website
                </a>
              )}

              <button
                onClick={() => router.push("/dashboard/website/editor")}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Pencil className="w-5 h-5" />
                Edit in Block Editor
              </button>

              <button
                onClick={async () => {
                  await fetch("/api/dashboard/website/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isPublicProfile: true }),
                  });
                  if (resultUsername) {
                    window.open(`/p/${resultUsername}`, "_blank");
                  }
                }}
                className="w-full py-3 px-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <ArrowRight className="w-5 h-5" />
                Publish Now
              </button>

              <button
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
