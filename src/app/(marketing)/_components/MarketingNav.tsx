"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

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
      { href: "/for/water-parks", label: "Water Parks" },
      { href: "/for/attractions", label: "Attractions & Theme Parks" },
      { href: "/for/wedding-photographers", label: "Wedding Photographers" },
      { href: "/for/freelance-photographers", label: "Freelance Photographers" },
      { href: "/for/studios", label: "Studios & Businesses" },
      { href: "/for/booking-packages", label: "Booking System" },
      { href: "/for/photographer-marketplace", label: "Photographer Marketplace" },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

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
          <Link href="/login" className="text-sm font-medium text-navy-700 hover:text-brand-500 transition">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary text-sm !py-2 !px-4">
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
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/login" className="btn-secondary text-center">Sign In</Link>
              <Link href="/signup" className="btn-primary text-center">Get Started Free</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
