"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Camera, Hotel, BarChart3, Search, Globe, ShoppingBag, Calendar, Smartphone } from "lucide-react";

const NAV_LINKS = [
  {
    label: "Products",
    children: [
      { href: "/products/client-gallery", label: "Client Gallery", desc: "Deliver photos beautifully", icon: Camera },
      { href: "/products/website-builder", label: "Website Builder", desc: "Build your portfolio site", icon: Globe },
      { href: "/products/online-store", label: "Online Store", desc: "Sell prints and products", icon: ShoppingBag },
      { href: "/products/studio-manager", label: "Studio Manager", desc: "Bookings, contracts, invoices", icon: Calendar },
      { href: "/products/marketplace", label: "Marketplace", desc: "Get discovered by clients", icon: Search },
      { href: "/products/mobile-gallery", label: "Mobile Gallery", desc: "Branded app for clients", icon: Smartphone },
    ],
  },
  { href: "/pricing", label: "Pricing" },
  { href: "/find-photographer", label: "Marketplace" },
  { href: "/for/attractions-and-resorts", label: "For Attractions & Resorts" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cream-300/60">
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/fotiqo-icon.svg" alt="Fotiqo" width={32} height={32} className="w-8 h-8" />
          <span className="font-display text-xl font-bold text-navy-900">
            Foti<span className="text-brand-400">qo</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) =>
            "children" in item && item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(item.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:text-brand-500 transition" aria-haspopup="true" aria-expanded={dropdownOpen === item.label}>
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lift border border-cream-300/60 py-2 animate-fade-in">
                    {item.children.map((child: any) => {
                      const Icon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-start gap-3 px-4 py-3 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition"
                        >
                          {Icon && <Icon className="h-4 w-4 mt-0.5 text-brand-400 flex-shrink-0" />}
                          <div>
                            <div className="font-medium">{child.label}</div>
                            {child.desc && <div className="text-xs text-navy-400 mt-0.5">{child.desc}</div>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className="px-3 py-2 text-sm font-medium text-navy-700 hover:text-brand-500 transition"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Login dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLoginOpen(true)}
            onMouseLeave={() => setLoginOpen(false)}
          >
            <button className="text-sm font-medium text-navy-700 hover:text-brand-500 transition px-3 py-2 flex items-center gap-1" aria-haspopup="true" aria-expanded={loginOpen}>
              Sign In <ChevronDown className="w-3 h-3" />
            </button>
            {loginOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lift border border-cream-300/60 py-2 animate-fade-in">
                <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Camera className="h-4 w-4 text-brand-500" /> User Login
                </Link>
                <Link href="/login/staff" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Hotel className="h-4 w-4 text-navy-500" /> Staff Portal
                </Link>
                <hr className="my-1 border-cream-200" />
                <Link href="/my-photos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Search className="h-4 w-4 text-gold-500" /> Find my photos
                </Link>
              </div>
            )}
          </div>
          <Link href="/signup/photographer" className="text-sm font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl px-4 py-2 transition">
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-navy-700" aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-b border-cream-300/60 animate-slide-up">
          <div className="px-6 py-4 space-y-1">
            {NAV_LINKS.map((item) =>
              "children" in item && item.children ? (
                <div key={item.label} className="space-y-1">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 text-sm text-navy-700 hover:text-brand-500"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-navy-700 hover:text-brand-500"
                >
                  {item.label}
                </Link>
              ),
            )}

            {/* Login options */}
            <div className="space-y-1 pt-3 border-t border-cream-200">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-navy-400">Sign In</p>
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <Camera className="h-4 w-4 text-brand-500" /> User Login
              </Link>
              <Link href="/login/staff" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <Hotel className="h-4 w-4 text-navy-500" /> Staff Portal
              </Link>
              <Link href="/my-photos" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <Search className="h-4 w-4 text-gold-500" /> Find my photos
              </Link>
            </div>

            <div className="pt-3 flex flex-col gap-2">
              <Link href="/signup/photographer" className="btn-primary text-center" onClick={() => setOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
