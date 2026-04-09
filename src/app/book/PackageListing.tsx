"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Clock, Camera, Users, Star, Search, MapPin } from "lucide-react";

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  category: string;
  duration: number;
  deliveredPhotos: number;
  price: number;
  currency: string;
  coverImage: string | null;
  isFeatured: boolean;
  maxGroupSize: number;
  addOns: AddOn[];
}

interface Location {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
}

const CATEGORIES = [
  { key: "ALL", label: "All Packages" },
  { key: "FAMILY", label: "Family" },
  { key: "COUPLE", label: "Couple" },
  { key: "SOLO", label: "Solo" },
  { key: "GROUP", label: "Group" },
  { key: "KIDS", label: "Kids" },
  { key: "EVENT", label: "Event" },
  { key: "SPECIALTY", label: "Specialty" },
];

const CATEGORY_COLORS: Record<string, string> = {
  FAMILY: "bg-blue-500",
  COUPLE: "bg-pink-500",
  SOLO: "bg-purple-500",
  GROUP: "bg-green-500",
  KIDS: "bg-yellow-500 text-navy-900",
  EVENT: "bg-red-500",
  SPECIALTY: "bg-indigo-500",
};

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function PackageListing({
  packages,
  locations,
}: {
  packages: Package[];
  locations: Location[];
}) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filtered = useMemo(() => {
    let result = packages;
    if (activeCategory !== "ALL") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.shortDescription || "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [packages, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-brand-400/30 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-3 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fotiqo-icon.svg" alt="Fotiqo" className="h-10 w-10 rounded-lg" />
            <span className="font-display text-xl">Fotiqo</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mb-4">
            Capture Your Perfect Moment
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8">
            Browse our photography packages, pick a date, and book instantly.
            Professional photographers, beautiful locations, unforgettable memories.
          </p>

          {/* Search + Location filter */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-navy-900 placeholder:text-navy-400 focus:ring-2 focus:ring-brand-400 outline-none"
              />
            </div>
            {locations.length > 0 && (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-400 pointer-events-none" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 rounded-xl bg-white text-navy-900 appearance-none cursor-pointer focus:ring-2 focus:ring-brand-400 outline-none"
                >
                  <option value="">All locations</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.key
                    ? "bg-brand-400 text-white"
                    : "bg-slate-100 text-navy-600 hover:bg-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Package grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="h-12 w-12 text-navy-300 mx-auto mb-4" />
            <h3 className="font-display text-xl text-navy-600 mb-2">No packages found</h3>
            <p className="text-navy-400 text-sm">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <Link
      href={`/book/${pkg.slug}`}
      className="group card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-400/20 to-navy-900/20">
        {pkg.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.coverImage}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-16 w-16 text-brand-400/40" />
          </div>
        )}
        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
            CATEGORY_COLORS[pkg.category] || "bg-brand-400"
          }`}
        >
          {pkg.category}
        </span>
        {pkg.isFeatured && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-gold-500 text-white flex items-center gap-1">
            <Star className="h-3 w-3" fill="currentColor" /> Popular
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-display text-lg text-navy-900 mb-1 group-hover:text-brand-400 transition-colors">
          {pkg.name}
        </h3>
        <p className="text-navy-500 text-sm line-clamp-2 mb-4 flex-1">
          {pkg.shortDescription || pkg.description}
        </p>

        {/* Info chips */}
        <div className="flex items-center gap-4 text-xs text-navy-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {formatDuration(pkg.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" /> {pkg.deliveredPhotos}+ photos
          </span>
          {pkg.maxGroupSize > 1 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Up to {pkg.maxGroupSize}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs text-navy-400">From</span>
            <span className="block text-xl font-bold text-coral-500">
              {formatPrice(pkg.price, pkg.currency)}
            </span>
          </div>
          <span className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-sm font-semibold group-hover:bg-coral-600 transition-colors">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
}
