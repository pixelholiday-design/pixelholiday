"use client";
import Link from "next/link";
import { Camera, Hotel, BarChart3, Search, ArrowRight, Globe } from "lucide-react";

const PATHS = [
  {
    title: "I'm a photographer",
    description: "Deliver galleries, sell prints, build your website, get bookings",
    icon: Camera,
    href: "/login/photographer",
    signupHref: "/signup/photographer",
    signupLabel: "New here? Create your free account",
    color: "from-brand-500 to-brand-400",
    iconBg: "bg-brand-100 text-brand-600",
  },
  {
    title: "I work at a resort",
    description: "Staff login for resort photography operations",
    icon: Hotel,
    href: "/login/staff",
    note: "Need your PIN? Ask your supervisor",
    color: "from-navy-800 to-navy-700",
    iconBg: "bg-navy-100 text-navy-600",
  },
  {
    title: "I manage operations",
    description: "Admin access for managers, supervisors, and operations",
    icon: BarChart3,
    href: "/login/admin",
    color: "from-coral-500 to-coral-400",
    iconBg: "bg-coral-100 text-coral-600",
  },
  {
    title: "I want to book a photographer",
    description: "Find a photographer, book a session, or view your gallery",
    icon: Search,
    href: "/find-photographer",
    isExternal: true,
    secondaryHref: "/my-photos",
    secondaryLabel: "Have a gallery link? Find your photos",
    color: "from-gold-500 to-gold-400",
    iconBg: "bg-gold-100 text-gold-700",
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 via-white to-cream-100 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-8 w-8" />
          <span className="font-display text-xl text-navy-900">Fotiqo</span>
        </Link>
        <Link href="/" className="text-sm text-navy-400 hover:text-brand-500 transition">
          Back to home
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl text-navy-900 mb-3">Welcome to Fotiqo</h1>
          <p className="text-navy-500 text-lg">Choose how you'd like to sign in</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl w-full animate-slide-up">
          {PATHS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group bg-white rounded-2xl border border-cream-300 hover:border-brand-300 hover:shadow-lift transition-all duration-200 p-6 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl ${p.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-navy-900 mb-1">{p.title}</h2>
                    <p className="text-sm text-navy-500 leading-relaxed">{p.description}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <Link
                    href={p.href}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 text-sm transition"
                  >
                    {p.isExternal ? "Browse photographers" : "Sign in"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  {p.signupHref && (
                    <Link
                      href={p.signupHref}
                      className="block text-center text-xs text-brand-500 hover:text-brand-700 font-medium py-1"
                    >
                      {p.signupLabel}
                    </Link>
                  )}
                  {p.secondaryHref && (
                    <Link
                      href={p.secondaryHref}
                      className="block text-center text-xs text-brand-500 hover:text-brand-700 font-medium py-1"
                    >
                      {p.secondaryLabel}
                    </Link>
                  )}
                  {p.note && (
                    <p className="text-center text-[11px] text-navy-400">{p.note}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="text-center text-xs text-navy-400 py-6">
        Protected by Fotiqo · GDPR compliant
      </footer>
    </div>
  );
}
