"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera, ArrowRight, ArrowLeft, Check, Loader2, Mail, Lock, User,
  Building2, MapPin, Heart, ImageIcon, Palette, ShoppingBag,
  Calendar, Star, Printer, Sparkles,
} from "lucide-react";

const SPECIALTIES = [
  { key: "wedding", label: "Wedding & Events", icon: Heart },
  { key: "portrait", label: "Portrait & Family", icon: User },
  { key: "newborn", label: "Newborn & Maternity", icon: Sparkles },
  { key: "commercial", label: "Commercial & Product", icon: ShoppingBag },
  { key: "real_estate", label: "Real Estate", icon: Building2 },
  { key: "sports", label: "Sports & Action", icon: Star },
  { key: "travel", label: "Travel & Landscape", icon: MapPin },
  { key: "other", label: "Other", icon: Camera },
];

const FEATURES = [
  { icon: ImageIcon, label: "Client galleries", desc: "deliver photos beautifully" },
  { icon: ShoppingBag, label: "Online store", desc: "sell prints, canvas, albums (150+ products)" },
  { icon: Palette, label: "Portfolio website", desc: "6 themes, custom domain" },
  { icon: Calendar, label: "Booking system", desc: "let clients book instantly" },
  { icon: Star, label: "Marketplace", desc: "get discovered by new clients" },
  { icon: Printer, label: "Print fulfillment", desc: "auto-ship via Prodigi & Printful" },
];

type Step = 1 | 2 | 3;

export default function PhotographerSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [specialty, setSpecialty] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", city: "", country: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSignup() {
    if (!form.name || !form.email || !form.password) {
      setErr("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setErr("");

    try {
      const res = await fetch("/api/saas/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tier: "STARTER",
          specialty,
          orgType: "INDEPENDENT",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto sign-in after signup
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      setLoading(false);

      if (signInRes?.ok) {
        setStep(3);
      } else {
        // Signup succeeded but auto-login failed — go to step 3 anyway
        setStep(3);
      }
    } catch {
      setLoading(false);
      setErr("Network error. Please try again.");
    }
  }

  // ── Step 1: Specialty ────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl animate-slide-up">
            <StepIndicator current={1} />
            <h1 className="heading text-3xl text-center mb-2">What kind of photography do you do?</h1>
            <p className="text-navy-400 text-center mb-8">This helps us personalize your experience</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {SPECIALTIES.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSpecialty(s.key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                      specialty === s.key
                        ? "border-brand-400 bg-brand-50 shadow-card"
                        : "border-cream-300 bg-white hover:border-brand-200"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${specialty === s.key ? "text-brand-500" : "text-navy-400"}`} />
                    <span className="text-sm font-medium text-navy-800">{s.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!specialty}
              className="btn-primary w-full !py-3.5 text-base"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-6 text-sm text-navy-400 text-center">
              Already have an account?{" "}
              <Link href="/login/photographer" className="text-brand-500 hover:text-brand-700 font-medium">Sign in</Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Step 2: Account details ──────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-slide-up">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-sm text-navy-400 hover:text-brand-500 mb-4 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <StepIndicator current={2} />
            <h1 className="heading text-3xl mb-2">Create your account</h1>
            <p className="text-navy-400 mb-6">Free forever — only a small commission when you sell</p>

            <div className="space-y-4">
              <Field icon={User} label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Jane Smith" required autoComplete="name" />
              <Field icon={Building2} label="Business name" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} placeholder="Jane Smith Photography" autoComplete="organization" />
              <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="jane@studio.com" required autoComplete="email" />
              <Field icon={Lock} label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Min. 8 characters" required autoComplete="new-password" />
              <div className="grid grid-cols-2 gap-3">
                <Field icon={MapPin} label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="London" />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} placeholder="United Kingdom" />
              </div>
            </div>

            {err && <div className="mt-4 rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">{err}</div>}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="btn-primary w-full !py-3.5 text-base mt-6"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</> : <>Create my studio <ArrowRight className="h-4 w-4" /></>}
            </button>

            <p className="mt-4 text-xs text-navy-300 text-center">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline">Terms</Link> and{" "}
              <Link href="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Step 3: Welcome / Success ────────────────────────
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
          </div>
          <h1 className="heading text-3xl mb-2">You're in!</h1>
          <p className="text-navy-500 mb-8">Here's what's ready for you:</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="bg-white rounded-xl border border-cream-300 p-4 text-left">
                  <Icon className="h-5 w-5 text-brand-500 mb-2" />
                  <div className="text-sm font-semibold text-navy-900">{f.label}</div>
                  <div className="text-xs text-navy-400 mt-0.5">{f.desc}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 text-sm text-brand-700 mb-6">
            No monthly fees. No credit card needed. You pay only when you earn.
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="btn-primary !py-3.5 text-base w-full sm:w-auto sm:px-12"
          >
            Go to my dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Shared sub-components ───────────────────────────────

function Header() {
  return (
    <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
        <span className="font-display text-xl text-navy-900">Fotiqo</span>
      </Link>
    </header>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
            s < current ? "bg-green-500 text-white" : s === current ? "bg-navy-900 text-white" : "bg-cream-300 text-navy-400"
          }`}>
            {s < current ? <Check className="h-3.5 w-3.5" /> : s}
          </div>
          {s < 3 && <div className={`w-8 h-0.5 ${s < current ? "bg-green-500" : "bg-cream-300"}`} />}
        </div>
      ))}
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", value, onChange, placeholder, required, autoComplete }: {
  icon?: any; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label className="label-xs block mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />}
        <input
          className={`input ${Icon ? "pl-10" : ""}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
      </div>
    </div>
  );
}
