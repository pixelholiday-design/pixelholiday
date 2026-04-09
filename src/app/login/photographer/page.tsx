"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PhotographerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setErr("Invalid credentials — check your email and password.");
      return;
    }
    // Fetch role to determine redirect
    try {
      const me = await fetch("/api/me").then((r) => r.json());
      if (me.user?.role === "CEO" || me.user?.role === "OPERATIONS_MANAGER") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-400">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <path d="M0,300 Q200,240 400,300 T800,300 L800,600 L0,600 Z" fill="white" />
        </svg>
        <div className="relative z-10 flex items-center gap-3 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-11 w-11 rounded-xl bg-white p-1 shadow-lift" />
          <span className="font-display text-2xl tracking-tight">Fotiqo</span>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-display text-4xl xl:text-5xl leading-tight mb-4">
            Your studio,<br />everywhere.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Deliver galleries, sell prints, build your website, get bookings — all from one platform.
          </p>
        </div>
        <div />
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-navy-400 hover:text-brand-500 mb-6 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> All sign-in options
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Camera className="h-6 w-6 text-brand-500" />
            <h1 className="heading text-3xl">Photographer sign in</h1>
          </div>
          <p className="text-navy-400 mb-8">Access your studio dashboard</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-xs block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input className="input pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" autoComplete="email" required />
              </div>
            </div>
            <div>
              <label className="label-xs block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input className="input pl-10" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required />
              </div>
            </div>
            {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">{err}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-sm text-navy-400 text-center">
            Don't have an account?{" "}
            <Link href="/signup/photographer" className="text-brand-500 hover:text-brand-700 font-medium">Sign up free</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
