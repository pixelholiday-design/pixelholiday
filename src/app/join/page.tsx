"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, Loader2, Check, Camera, MapPin, Star, DollarSign } from "lucide-react";

const SPECIALTIES = ["Wedding", "Portrait", "Family", "Event", "Commercial", "Newborn", "Travel", "Sports", "Other"];

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", specialty: "", city: "", country: "", hourlyRate: "", bio: "", portfolioUrl: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) { setErr("Password must be at least 8 characters"); return; }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/marketplace/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hourlyRate: parseFloat(form.hourlyRate) || null }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || "Signup failed"); setLoading(false); return; }
      // Auto sign in
      const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      setLoading(false);
      if (signInRes?.ok) { setDone(true); setTimeout(() => router.push("/marketplace/dashboard"), 1500); }
      else { setDone(true); }
    } catch { setErr("Network error"); setLoading(false); }
  }

  if (done) return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
      <div className="text-center animate-slide-up"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"><Check className="h-8 w-8 text-green-600" /></div><h1 className="font-display text-3xl text-navy-900 mb-2">Welcome to the marketplace!</h1><p className="text-navy-500">Redirecting to your dashboard...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="px-6 py-5 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
          <span className="font-display text-xl text-navy-900">Fotiqo</span>
        </Link>
        <Link href="/login" className="text-sm text-navy-400 hover:text-brand-500">Already have an account? Sign in</Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 rounded-full px-3 py-1 text-xs font-semibold mb-4"><Search className="h-3 w-3" /> 100% free to join</div>
          <h1 className="font-display text-3xl text-navy-900 mb-2">Join the Fotiqo Marketplace</h1>
          <p className="text-navy-500">Get discovered by clients. Accept bookings. Get paid. You only pay 10% when you earn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-xs block mb-1">Full name *</label><input className="input" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
            <div><label className="label-xs block mb-1">Specialty *</label><select className="input" required value={form.specialty} onChange={(e) => setForm({...form, specialty: e.target.value})}><option value="">Select...</option>{SPECIALTIES.map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="label-xs block mb-1">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
          <div><label className="label-xs block mb-1">Password *</label><input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Min 8 characters" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label-xs block mb-1">City *</label><input className="input" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
            <div><label className="label-xs block mb-1">Country *</label><input className="input" required value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
          </div>
          <div><label className="label-xs block mb-1">Hourly rate (EUR)</label><input className="input" type="number" value={form.hourlyRate} onChange={(e) => setForm({...form, hourlyRate: e.target.value})} placeholder="80" /></div>
          <div><label className="label-xs block mb-1">Short bio</label><textarea className="input !h-20" maxLength={300} value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="Tell clients about your style..." /></div>
          <div><label className="label-xs block mb-1">Portfolio link (optional)</label><input className="input" value={form.portfolioUrl} onChange={(e) => setForm({...form, portfolioUrl: e.target.value})} placeholder="instagram.com/you or yourwebsite.com" /></div>

          {err && <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">{err}</div>}

          <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base transition disabled:opacity-60">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating profile...</> : <>Join the Marketplace <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="mt-6 text-xs text-navy-400 text-center">
          Want galleries, website, and store too? <Link href="/signup/photographer" className="text-brand-500 hover:text-brand-700">Sign up for Fotiqo Studio</Link>
        </p>
      </main>
    </div>
  );
}
