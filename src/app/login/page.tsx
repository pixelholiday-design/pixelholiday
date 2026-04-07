"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pixelholiday.local");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setErr("Invalid credentials — check your email and password.");
    else router.push("/admin/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream-100">
      {/* LEFT — Visual */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-resort-pattern">
        <div className="absolute inset-0 bg-navy-900/20" />
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl tracking-tight">PixelHoliday</span>
        </div>
        <div className="relative z-10 text-white max-w-md">
          <h2 className="font-display text-4xl xl:text-5xl leading-tight mb-4">
            Capture every moment of the escape.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            The complete studio platform for resort photographers — galleries, sales, kiosks, and insights in one elegant workspace.
          </p>
          <div className="mt-10 flex items-center gap-6 text-sm text-white/70">
            <div>
              <div className="font-display text-3xl text-white">100+</div>
              <div>Photographers</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <div className="font-display text-3xl text-white">10k</div>
              <div>Galleries / day</div>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <div className="font-display text-3xl text-white">23</div>
              <div>Modules</div>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT — Form */}
      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="flex items-center gap-2 text-coral-500 lg:hidden mb-6">
            <Camera className="h-5 w-5" />
            <span className="font-display text-xl text-navy-900">PixelHoliday</span>
          </div>
          <h1 className="heading text-4xl mb-2">Welcome back</h1>
          <p className="text-navy-400 mb-8">Sign in to your studio</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="label-xs block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-300" />
                <input
                  className="input pl-10"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {err && (
              <div className="rounded-xl bg-coral-50 border border-coral-200 px-4 py-2.5 text-sm text-coral-700">
                {err}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-navy-400 text-center">
            Protected by PixelHoliday · GDPR compliant
          </p>
        </div>
      </main>
    </div>
  );
}
