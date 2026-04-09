"use client";
import { useState } from "react";
import { Camera, Loader2, ArrowRight, Check, Mail, Lock, User, Building2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const res = await fetch("/api/saas/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tier: "STARTER" }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setStatus(data.error || "Signup failed");
      return;
    }

    setSuccess(true);
    setTimeout(() => { window.location.href = "/login"; }, 2000);
  }

  const features = [
    "Unlimited galleries & photos",
    "Magic link delivery via WhatsApp",
    "Server-side watermarking",
    "Stripe & cash payments",
    "Kiosk POS system",
    "AI photo culling",
    "Analytics dashboard",
    "Customer booking system",
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 to-brand-50 px-4">
        <div className="text-center animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-6">
            <Check className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Account created!</h1>
          <p className="text-navy-500 mb-4">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      {/* LEFT — Value prop */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <path d="M0,300 Q200,240 400,300 T800,300 L800,600 L0,600 Z" fill="white" />
          <path d="M0,400 Q200,340 400,400 T800,400 L800,600 L0,600 Z" fill="white" opacity="0.5" />
        </svg>
        <div className="relative z-10 flex items-center gap-3 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-11 w-11 rounded-xl bg-white p-1 shadow-lift" />
          <span className="font-display text-2xl tracking-tight">Fotiqo</span>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-display text-4xl xl:text-5xl leading-tight mb-4">
            100% free to start.<br />
            <span className="text-white/80">Pay only when you sell.</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed mb-8">
            No subscriptions. No monthly fees. We only take a small 2% commission when your customers purchase photos. Your success is our success.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-white/90">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-xl bg-white/10 backdrop-blur px-5 py-4">
            <div className="text-sm text-white/70 mb-1">Revenue model</div>
            <div className="font-display text-2xl">Free platform + 2% commission on sales</div>
            <div className="text-sm text-white/60 mt-1">No setup fees. No hidden costs. Cancel anytime.</div>
          </div>
        </div>
        <div />
      </aside>

      {/* RIGHT — Form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex items-center gap-2 lg:hidden mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
            <span className="font-display text-xl text-navy-900">Fotiqo</span>
          </div>

          <h1 className="heading text-4xl mb-2">Create your account</h1>
          <p className="text-navy-400 mb-8">Free forever — only 2% commission on sales</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-xs block mb-1.5">Your name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  placeholder="John Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="label-xs block mb-1.5">Business name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  placeholder="My Photography Studio"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label className="label-xs block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="you@studio.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label-xs block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {status && (
              <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">
                {status}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-navy-400 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-500 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>

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
