"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Hotel, Loader2, Mail, Lock, ArrowRight, ArrowLeft, Hash } from "lucide-react";
import Link from "next/link";

const ROLE_REDIRECTS: Record<string, string> = {
  CEO: "/admin/dashboard",
  OPERATIONS_MANAGER: "/admin/dashboard",
  SUPERVISOR: "/admin/dashboard",
  PHOTOGRAPHER: "/my-dashboard",
  SALES_STAFF: "/kiosk/sale-point",
  RECEPTIONIST: "/admin/bookings",
  ACADEMY_TRAINEE: "/admin/academy",
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "pin">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setErr("Invalid credentials."); return; }
    redirectByRole();
  }

  async function onSubmitPin(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) { setErr("Enter a 4-digit PIN."); return; }
    setLoading(true);
    setErr("");
    // PIN login: look up user by PIN, then sign in with their email
    try {
      const lookup = await fetch("/api/auth/pin-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      }).then((r) => r.json());
      if (!lookup.ok) { setErr(lookup.error || "Invalid PIN."); setLoading(false); return; }
      const res = await signIn("credentials", { email: lookup.email, password: "pin:" + pin, redirect: false });
      setLoading(false);
      if (res?.error) { setErr("PIN authentication failed."); return; }
      redirectByRole();
    } catch {
      setLoading(false);
      setErr("Connection error. Try again.");
    }
  }

  async function redirectByRole() {
    try {
      const me = await fetch("/api/me").then((r) => r.json());
      const role = me.user?.role || "PHOTOGRAPHER";
      router.push(ROLE_REDIRECTS[role] || "/my-dashboard");
    } catch {
      router.push("/my-dashboard");
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-navy-800 via-navy-700 to-navy-600">
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          <path d="M0,300 Q200,240 400,300 T800,300 L800,600 L0,600 Z" fill="white" />
        </svg>
        <div className="relative z-10 flex items-center gap-3 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-11 w-11 rounded-xl bg-white p-1 shadow-lift" />
          <span className="font-display text-2xl tracking-tight">Fotiqo</span>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-display text-4xl xl:text-5xl leading-tight mb-4">Resort staff login</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Access your kiosk, upload photos, manage bookings, and track your performance.
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
            <Hotel className="h-6 w-6 text-navy-600" />
            <h1 className="heading text-3xl">Staff sign in</h1>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-cream-200 rounded-xl p-1 mt-4 mb-6">
            <button onClick={() => { setMode("email"); setErr(""); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${mode === "email" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"}`}>
              Email & Password
            </button>
            <button onClick={() => { setMode("pin"); setErr(""); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${mode === "pin" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"}`}>
              Quick PIN
            </button>
          </div>

          {mode === "email" ? (
            <form onSubmit={onSubmitEmail} className="space-y-5">
              <div>
                <label className="label-xs block mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                  <input className="input pl-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@fotiqo.local" autoComplete="email" required />
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
          ) : (
            <form onSubmit={onSubmitPin} className="space-y-5">
              <div>
                <label className="label-xs block mb-1.5">4-digit PIN</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                  <input
                    className="input pl-10 text-center text-2xl tracking-[0.5em] font-mono"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="• • • •"
                    autoComplete="off"
                    required
                  />
                </div>
                <p className="text-xs text-navy-400 mt-2">Ask your supervisor for your kiosk PIN</p>
              </div>
              {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">{err}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in with PIN <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
