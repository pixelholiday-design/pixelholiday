"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown, Camera, Hotel, BarChart3, Search } from "lucide-react";

const NAV_LINKS = [
  {
    label: "Product",
    children: [
      { href: "/features", label: "All Features" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    label: "Solutions",
    children: [
      { href: "/for/resort-photography", label: "Resort & Hotel Photography" },
      { href: "/for/water-parks", label: "Water Parks & Attractions" },
      { href: "/for/wedding-photographers", label: "Wedding Photographers" },
      { href: "/for/freelance-photographers", label: "Freelance Photographers" },
      { href: "/for/studios", label: "Studios & Businesses" },
      { href: "/for/booking-packages", label: "Booking System" },
    ],
  },
  { href: "/find-photographer", label: "Marketplace" },
  { href: "/about", label: "About" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-cream-300/60">
      <nav className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
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
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 hover:text-brand-500 transition">
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {dropdownOpen === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lift border border-cream-300/60 py-2 animate-fade-in">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition"
                      >
                        {child.label}
                      </Link>
                    ))}
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
            <button className="text-sm font-medium text-navy-700 hover:text-brand-500 transition px-3 py-2 flex items-center gap-1">
              Sign In <ChevronDown className="w-3 h-3" />
            </button>
            {loginOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-lift border border-cream-300/60 py-2 animate-fade-in">
                <Link href="/login/photographer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Camera className="h-4 w-4 text-brand-500" /> Photographer
                </Link>
                <Link href="/login/staff" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Hotel className="h-4 w-4 text-navy-500" /> Resort Staff
                </Link>
                <Link href="/login/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <BarChart3 className="h-4 w-4 text-coral-500" /> Operations Admin
                </Link>
                <hr className="my-1 border-cream-200" />
                <Link href="/my-photos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-brand-50 hover:text-brand-600 transition">
                  <Search className="h-4 w-4 text-gold-500" /> Find my photos
                </Link>
              </div>
            )}
          </div>
          <Link href="/signup/photographer" className="btn-primary text-sm !py-2 !px-4">
            Get Started Free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-navy-700">
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
              <Link href="/login/photographer" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <Camera className="h-4 w-4 text-brand-500" /> Photographer
              </Link>
              <Link href="/login/staff" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <Hotel className="h-4 w-4 text-navy-500" /> Resort Staff
              </Link>
              <Link href="/login/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-navy-700">
                <BarChart3 className="h-4 w-4 text-coral-500" /> Operations Admin
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
