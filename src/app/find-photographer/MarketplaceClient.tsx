"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Filter,
  SlidersHorizontal,
  Camera,
  Heart,
  ChevronDown,
  Globe,
  Clock,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */

interface PhotographerService {
  id: string;
  name: string;
  startingAt: number | null;
  currency: string;
  duration: string | null;
}

interface Photographer {
  id: string;
  userId: string;
  username: string;
  businessName: string | null;
  tagline: string | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  specialties: string[];
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  averageRating: number;
  totalReviews: number;
  completedSessions: number;
  responseTime: string | null;
  languages: string[];
  user: { name: string; id: string };
  services: PhotographerService[];
}

interface MarketplaceClientProps {
  photographers: Photographer[];
  total: number;
  page: number;
  perPage: number;
  specialties: string[];
  languages: string[];
  cities: string[];
  searchParams: Record<string, string | undefined>;
}

/* ── Helpers ───────────────────────────────────────── */

const SPECIALTY_OPTIONS = [
  "portrait",
  "wedding",
  "event",
  "resort",
  "family",
  "maternity",
  "commercial",
  "landscape",
  "fashion",
  "food",
];

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill =
          rating >= i ? "text-[#D4A853]" : rating >= i - 0.5 ? "text-[#D4A853]/50" : "text-gray-300";
        return (
          <Star
            key={i}
            size={size}
            className={`${fill} shrink-0`}
            fill={rating >= i ? "#D4A853" : rating >= i - 0.5 ? "#D4A853" : "none"}
          />
        );
      })}
    </span>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ── Main Component ────────────────────────────────── */

export default function MarketplaceClient({
  photographers,
  total,
  page,
  perPage,
  specialties: availableSpecialties,
  languages: availableLanguages,
  cities,
  searchParams: sp,
}: MarketplaceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);

  /* Local filter state */
  const [showFilters, setShowFilters] = useState(false);
  const [locationInput, setLocationInput] = useState(sp.location ?? "");
  const [dateInput, setDateInput] = useState(sp.date ?? "");
  const [specialtyInput, setSpecialtyInput] = useState(sp.specialty ?? "");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    sp.specialty ? [sp.specialty] : []
  );
  const [minPrice, setMinPrice] = useState(sp.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.maxPrice ?? "");
  const [minRating, setMinRating] = useState(sp.minRating ?? "");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    sp.language ? [sp.language] : []
  );
  const [sortValue, setSortValue] = useState(sp.sort ?? "rating");

  /* Navigate with updated params */
  const navigate = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      const merged = { ...sp, ...overrides };
      Object.entries(merged).forEach(([k, v]) => {
        if (v && v !== "") params.set(k, v);
      });
      router.push(`/find-photographer?${params.toString()}`);
    },
    [sp, router]
  );

  /* Search bar submit */
  const handleSearch = () => {
    navigate({
      location: locationInput || undefined,
      date: dateInput || undefined,
      specialty: specialtyInput || undefined,
      page: undefined,
    });
  };

  /* Apply sidebar filters */
  const applyFilters = () => {
    navigate({
      specialty: selectedSpecialties[0] || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      language: selectedLanguages[0] || undefined,
      page: undefined,
    });
  };

  /* Clear all filters */
  const clearFilters = () => {
    setSelectedSpecialties([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setSelectedLanguages([]);
    router.push("/find-photographer");
  };

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleLanguage = (l: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );
  };

  const hasActiveFilters =
    selectedSpecialties.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "" ||
    selectedLanguages.length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative bg-[#0C1829] overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#29ABE2]/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#E8593C]/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Find Your Perfect{" "}
            <span className="text-[#29ABE2]">Photographer</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Browse portfolios, read reviews, and book sessions with talented
            photographers
          </p>

          {/* Search Bar */}
          <div className="mt-10 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">
              {/* Location */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-[#29ABE2]/40">
                <MapPin size={20} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City or country..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm"
                />
              </div>

              {/* Date */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-[#29ABE2]/40">
                <Calendar size={20} className="text-gray-400 shrink-0" />
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none text-sm"
                />
              </div>

              {/* Session Type */}
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-[#29ABE2]/40">
                <Camera size={20} className="text-gray-400 shrink-0" />
                <select
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  className="w-full bg-transparent text-gray-800 outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value="">All session types</option>
                  {SPECIALTY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {capitalize(s)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center gap-2 bg-[#E8593C] hover:bg-[#d14830] text-white font-semibold px-8 py-3 rounded-xl transition-colors shrink-0"
              >
                <Search size={18} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-8 flex items-center justify-center gap-8 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5">
              <Users size={16} />
              {total} photographers
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {cities.length} cities
            </span>
            <span className="flex items-center gap-1.5">
              <Camera size={16} />
              {availableSpecialties.length} specialties
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#E8593C]" />
              )}
            </button>
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-[#0C1829]">{total}</span>{" "}
              photographer{total !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortValue}
              onChange={(e) => {
                setSortValue(e.target.value);
                navigate({ sort: e.target.value, page: undefined });
              }}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#29ABE2]/40 cursor-pointer"
            >
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar Filters ────────────────────── */}
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent" : "hidden lg:block"
            } lg:w-64 shrink-0`}
          >
            <div
              className={`${
                showFilters
                  ? "absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto"
                  : ""
              } lg:relative lg:w-full lg:shadow-none lg:p-0`}
            >
              {/* Mobile close */}
              {showFilters && (
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="text-lg font-semibold text-[#0C1829]">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              )}

              <div className="space-y-6 bg-white lg:rounded-xl lg:border lg:border-gray-200 lg:p-5">
                <div className="hidden lg:flex items-center gap-2 text-[#0C1829] font-semibold">
                  <Filter size={18} />
                  Filters
                </div>

                {/* Specialty */}
                <div>
                  <h4 className="text-sm font-semibold text-[#0C1829] mb-3">
                    Specialty
                  </h4>
                  <div className="space-y-2">
                    {SPECIALTY_OPTIONS.map((s) => (
                      <label
                        key={s}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(s)}
                          onChange={() => toggleSpecialty(s)}
                          className="w-4 h-4 rounded border-gray-300 text-[#29ABE2] focus:ring-[#29ABE2]/40"
                        />
                        <span className="group-hover:text-[#0C1829] transition-colors">
                          {capitalize(s)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-[#0C1829] mb-3">
                    Price Range (EUR/hour)
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29ABE2]/40"
                    />
                    <span className="text-gray-400">&ndash;</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29ABE2]/40"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-semibold text-[#0C1829] mb-3">
                    Minimum Rating
                  </h4>
                  <div className="flex gap-2">
                    {["4", "4.5"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(minRating === r ? "" : r)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          minRating === r
                            ? "bg-[#D4A853]/10 border-[#D4A853] text-[#D4A853]"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Star size={14} fill={minRating === r ? "#D4A853" : "none"} className={minRating === r ? "text-[#D4A853]" : "text-gray-400"} />
                        {r}+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {availableLanguages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-[#0C1829] mb-3">
                      Language
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableLanguages.map((l) => (
                        <label
                          key={l}
                          className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(l)}
                            onChange={() => toggleLanguage(l)}
                            className="w-4 h-4 rounded border-gray-300 text-[#29ABE2] focus:ring-[#29ABE2]/40"
                          />
                          <span className="group-hover:text-[#0C1829] transition-colors">
                            {l}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                    className="w-full bg-[#29ABE2] hover:bg-[#1e96c9] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full text-sm text-gray-500 hover:text-[#E8593C] transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Results Grid ───────────────────────── */}
          <main className="flex-1 min-w-0">
            {photographers.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <Camera size={40} className="text-gray-300" />
                </div>
                <h3
                  className="text-2xl font-bold text-[#0C1829] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  No photographers found
                </h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Try adjusting your search criteria or clearing some filters to
                  see more results.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#29ABE2] hover:bg-[#1e96c9] text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {photographers.map((p) => (
                    <PhotographerCard key={p.id} photographer={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      disabled={page <= 1}
                      onClick={() =>
                        navigate({ page: String(page - 1) })
                      }
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() =>
                        navigate({ page: String(page + 1) })
                      }
                      className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Photographer Card ─────────────────────────────── */

function PhotographerCard({ photographer: p }: { photographer: Photographer }) {
  const displayName = p.businessName || p.user.name;
  const isTopRated = p.averageRating >= 4.8 && p.totalReviews >= 5;
  const lowestPrice =
    p.hourlyRate ??
    p.services.reduce<number | null>((min, s) => {
      if (s.startingAt == null) return min;
      return min == null ? s.startingAt : Math.min(min, s.startingAt);
    }, null);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Cover image */}
      <div className="relative h-40 overflow-hidden">
        {p.coverPhotoUrl ? (
          <img
            src={p.coverPhotoUrl}
            alt={`${displayName} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#29ABE2]/20 via-[#0C1829]/30 to-[#E8593C]/20 flex items-center justify-center">
            <Camera size={36} className="text-white/40" />
          </div>
        )}

        {/* Top-rated badge */}
        {isTopRated && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#D4A853] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            <Award size={12} />
            Top Rated
          </div>
        )}

        {/* Wishlist heart (decorative) */}
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label="Save photographer"
        >
          <Heart size={16} className="text-gray-500 hover:text-[#E8593C] transition-colors" />
        </button>
      </div>

      {/* Profile photo overlapping */}
      <div className="relative px-5 -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-md">
          {p.profilePhotoUrl ? (
            <img
              src={p.profilePhotoUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#29ABE2] to-[#0C1829] flex items-center justify-center text-white font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 pt-3 pb-5">
        {/* Name + tagline */}
        <h3 className="text-lg font-bold text-[#0C1829] leading-snug">
          {displayName}
        </h3>
        {p.tagline && (
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
            {p.tagline}
          </p>
        )}

        {/* Rating + location row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
          <span className="flex items-center gap-1">
            <Stars rating={p.averageRating} size={14} />
            <span className="font-semibold text-[#0C1829]">
              {p.averageRating.toFixed(1)}
            </span>
            <span className="text-gray-400">({p.totalReviews})</span>
          </span>
          {(p.city || p.country) && (
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin size={13} className="shrink-0" />
              {[p.city, p.country].filter(Boolean).join(", ")}
            </span>
          )}
        </div>

        {/* Price */}
        {lowestPrice != null && (
          <p className="mt-3 text-sm">
            <span className="text-gray-500">From </span>
            <span className="text-[#0C1829] font-bold text-base">
              &euro;{lowestPrice}
            </span>
            <span className="text-gray-500">/hour</span>
          </p>
        )}

        {/* Specialty tags */}
        {p.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {p.specialties.slice(0, 4).map((s) => (
              <span
                key={s}
                className="inline-block bg-[#29ABE2]/10 text-[#1e7fa8] text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {capitalize(s)}
              </span>
            ))}
            {p.specialties.length > 4 && (
              <span className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                +{p.specialties.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Response time */}
        {p.responseTime && (
          <p className="flex items-center gap-1 mt-3 text-xs text-gray-400">
            <Clock size={12} />
            Responds {p.responseTime.toLowerCase()}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Link
            href={`/p/${p.username}`}
            className="flex-1 text-center px-4 py-2.5 border border-gray-200 text-[#0C1829] font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            View Profile
          </Link>
          <Link
            href={`/p/${p.username}/book`}
            className="flex-1 text-center px-4 py-2.5 bg-[#E8593C] hover:bg-[#d14830] text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
