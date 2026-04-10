"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, ArrowRight, Hash } from "lucide-react";

export default function CompanyLoginPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"pin" | "email">("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${slug}`)
      .then((r) => r.json())
      .then((d) => setCompany(d.company || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const primaryColor = company?.brandPrimaryColor || "#0EA5A5";
  const companyName = company?.brandName || company?.name || "Company";
  const companyLogo = company?.brandLogo || company?.logoUrl;
  const showPowered = company?.showPoweredByFotiqo !== false;

  async function loginWithPin() {
    if (pin.length !== 4) return;
    setSubmitting(true);
    setErr("");
    try {
      const lookup = await fetch("/api/auth/pin-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      }).then((r) => r.json());
      if (!lookup.ok) { setErr(lookup.error || "Invalid PIN"); setSubmitting(false); return; }
      const res = await signIn("credentials", { email: lookup.email, password: "pin:" + pin, redirect: false });
      if (res?.error) { setErr("Authentication failed"); setSubmitting(false); return; }
      router.push(`/v/${slug}/dashboard`);
    } catch { setErr("Connection error"); setSubmitting(false); }
  }

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);
    if (res?.error) { setErr("Invalid credentials"); return; }
    router.push(`/v/${slug}/dashboard`);
  }

  function addDigit(d: string) { if (pin.length < 4) setPin(pin + d); }
  function clearPin() { setPin(""); }

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/40" /></div>;
  if (!company) return <div className="min-h-screen bg-navy-900 flex items-center justify-center text-white"><div className="text-center"><h1 className="font-display text-3xl mb-2">Company not found</h1><p className="text-white/60">Check your portal URL and try again.</p></div></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${primaryColor}22 0%, #0C2E3D 50%, #0a1f2d 100%)` }}>
      <div className="w-full max-w-sm animate-slide-up">
        {/* Company branding */}
        <div className="text-center mb-8">
          {companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={companyLogo} alt={companyName} className="h-16 mx-auto mb-3" />
          ) : (
            <div className="h-16 w-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-display text-2xl" style={{ background: primaryColor }}>
              {companyName.charAt(0)}
            </div>
          )}
          <h1 className="font-display text-2xl text-white">{companyName}</h1>
          {showPowered && <p className="text-[10px] text-white/30 mt-1">Powered by Fotiqo</p>}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-white/10 rounded-xl p-1 mb-6">
          <button onClick={() => { setMode("pin"); setErr(""); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${mode === "pin" ? "bg-white text-navy-900" : "text-white/70"}`}><Hash className="h-3.5 w-3.5" /> PIN</button>
          <button onClick={() => { setMode("email"); setErr(""); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${mode === "email" ? "bg-white text-navy-900" : "text-white/70"}`}><Mail className="h-3.5 w-3.5" /> Email</button>
        </div>

        {mode === "pin" ? (
          <div>
            {/* PIN display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0,1,2,3].map((i) => (
                <div key={i} className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-mono ${pin.length > i ? "bg-white text-navy-900" : "bg-white/10 text-white/30"}`}>
                  {pin.length > i ? "*" : ""}
                </div>
              ))}
            </div>
            {/* PIN pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {["1","2","3","4","5","6","7","8","9"].map((d) => (
                <button key={d} onClick={() => addDigit(d)} className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xl font-semibold transition">{d}</button>
              ))}
              <button onClick={clearPin} className="h-14 rounded-xl bg-white/5 text-white/50 text-sm font-medium">Clear</button>
              <button onClick={() => addDigit("0")} className="h-14 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xl font-semibold transition">0</button>
              <button onClick={loginWithPin} disabled={pin.length !== 4 || submitting} className="h-14 rounded-xl text-white text-sm font-semibold transition disabled:opacity-40" style={{ background: primaryColor }}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <ArrowRight className="h-5 w-5 mx-auto" />}
              </button>
            </div>
            <p className="text-center text-xs text-white/30 mt-4">Enter your 4-digit staff PIN</p>
          </div>
        ) : (
          <form onSubmit={loginWithEmail} className="space-y-4">
            <div>
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": primaryColor } as any} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required />
            </div>
            <div>
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-xl text-white font-semibold transition" style={{ background: primaryColor }}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Sign in"}
            </button>
          </form>
        )}

        {err && <div className="mt-4 bg-coral-500/20 border border-coral-500/30 text-coral-200 rounded-xl px-4 py-2 text-sm text-center">{err}</div>}
      </div>
    </div>
  );
}
