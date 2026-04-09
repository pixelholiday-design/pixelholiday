"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Camera,
  MessageCircle,
  Award,
  ExternalLink,
  Globe,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from "lucide-react";

/* Lucide doesn't include brand icons, so we define lightweight SVG components */
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PortfolioPhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  category: string | null;
  isFeatured: boolean;
  sortOrder: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  startingAt: number | null;
  currency: string;
  duration: string | null;
  sortOrder: number;
}

interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  rating: number;
  eventType: string | null;
  date: string | null;
  sortOrder: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title: string | null;
  comment: string;
  photoUrls: string[];
  response: string | null;
  respondedAt: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Profile {
  id: string;
  username: string;
  businessName: string | null;
  tagline: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  coverPhotoUrl: string | null;
  specialties: string[];
  experience: string | null;
  equipment: string[];
  languages: string[];
  city: string | null;
  country: string | null;
  priceRange: string | null;
  hourlyRate: number | null;
  totalReviews: number;
  averageRating: number;
  completedSessions: number;
  responseTime: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialWebsite: string | null;
  socialTiktok: string | null;
  user: { id: string; name: string; email: string };
  services: Service[];
  testimonials: Testimonial[];
  reviews: Review[];
  portfolioPhotos: PortfolioPhoto[];
  availability: Availability[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function StarRating({
  rating,
  size = 16,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "fill-[#D4A853] text-[#D4A853]"
              : "text-gray-300"
          }
        />
      ))}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function lowestPrice(services: Service[]): number | null {
  const prices = services
    .map((s) => s.startingAt)
    .filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function HeroSection({ profile }: { profile: Profile }) {
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const minPrice = lowestPrice(profile.services);

  return (
    <section className="relative">
      {/* Cover */}
      <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden bg-gradient-to-br from-[#0C2E3D] via-[#0EA5A5]/30 to-[#0C2E3D]">
        {profile.coverPhotoUrl ? (
          <Image
            src={profile.coverPhotoUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera size={64} className="text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile card */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="-mt-20 sm:-mt-24 flex-shrink-0">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                {profile.profilePhotoUrl ? (
                  <Image
                    src={profile.profilePhotoUrl}
                    alt={profile.user.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#0EA5A5]/10 text-[#0EA5A5]">
                    <Camera size={40} />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#0C2E3D]">
                {profile.user.name}
              </h1>
              {profile.businessName && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {profile.businessName}
                </p>
              )}
              {profile.tagline && (
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  {profile.tagline}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
                {profile.totalReviews > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <StarRating rating={profile.averageRating} />
                    <span className="font-medium text-[#0C2E3D]">
                      {profile.averageRating.toFixed(1)}
                    </span>
                    <span>({profile.totalReviews} reviews)</span>
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-[#0EA5A5]" />
                    {location}
                  </span>
                )}
                {profile.responseTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} className="text-[#0EA5A5]" />
                    {profile.responseTime}
                  </span>
                )}
                {profile.completedSessions > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Award size={14} className="text-[#0EA5A5]" />
                    {profile.completedSessions} sessions
                  </span>
                )}
              </div>

              {/* Socials */}
              <div className="flex items-center gap-3 mt-3">
                {profile.socialInstagram && (
                  <a
                    href={`https://instagram.com/${profile.socialInstagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E1306C] transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                )}
                {profile.socialFacebook && (
                  <a
                    href={profile.socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#1877F2] transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                )}
                {profile.socialWebsite && (
                  <a
                    href={profile.socialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#0EA5A5] transition-colors"
                    aria-label="Website"
                  >
                    <Globe size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 sm:self-start sm:mt-0">
              <Link
                href={`/find-photographer/${profile.username}/book`}
                className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#d14a2f] text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
              >
                <Calendar size={18} />
                Book This Photographer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Bio ---- */
function BioSection({ profile }: { profile: Profile }) {
  if (!profile.bio && !profile.experience && profile.languages.length === 0)
    return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
      <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D] mb-4">
        About
      </h2>

      {profile.bio && (
        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
          {profile.bio}
        </p>
      )}

      <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5">
        {profile.experience && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              <Award size={13} /> Experience
            </span>
            <p className="text-sm font-medium text-[#0C2E3D]">
              {profile.experience}
            </p>
          </div>
        )}
        {profile.languages.length > 0 && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              <MessageCircle size={13} /> Languages
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {profile.languages.map((l) => (
                <span
                  key={l}
                  className="px-2.5 py-0.5 rounded-full bg-[#0EA5A5]/10 text-[#0EA5A5] text-xs font-medium"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {profile.equipment.length > 0 && (
        <div className="mt-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <Camera size={13} /> Equipment
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.equipment.map((e) => (
              <span
                key={e}
                className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---- Portfolio ---- */
function PortfolioSection({ photos }: { photos: PortfolioPhoto[] }) {
  const categories = useMemo(() => {
    const cats = new Set<string>();
    photos.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ["All", ...Array.from(cats)];
  }, [photos]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? photos
        : photos.filter((p) => p.category === activeCategory),
    [photos, activeCategory]
  );

  if (photos.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D] mb-4">
          Portfolio
        </h2>
        <div className="py-12 text-center text-gray-400">
          <Camera size={40} className="mx-auto mb-3 opacity-50" />
          <p>No portfolio photos yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
      <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D] mb-4">
        Portfolio
      </h2>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#0C2E3D] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(idx)}
            className="relative group w-full break-inside-avoid overflow-hidden rounded-xl block"
          >
            <Image
              src={photo.thumbnailUrl || photo.url}
              alt={photo.caption || "Portfolio photo"}
              width={600}
              height={400}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              {photo.caption && (
                <span className="p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {photo.caption}
                </span>
              )}
            </div>
            {photo.isFeatured && (
              <span className="absolute top-2 right-2 bg-[#D4A853] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Featured
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            <X size={28} />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={36} />
            </button>
          )}
          {lightboxIndex < filtered.length - 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              aria-label="Next"
            >
              <ChevronRight size={36} />
            </button>
          )}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIndex].url}
              alt={filtered[lightboxIndex].caption || "Photo"}
              width={1200}
              height={800}
              className="max-h-[85vh] w-auto object-contain rounded-lg"
            />
            {filtered[lightboxIndex].caption && (
              <p className="text-center text-white/80 text-sm mt-3">
                {filtered[lightboxIndex].caption}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ---- Services ---- */
function ServicesSection({
  services,
  username,
}: {
  services: Service[];
  username: string;
}) {
  if (services.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
      <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D] mb-4">
        Services &amp; Pricing
      </h2>
      <div className="space-y-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#0EA5A5]/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#0C2E3D]">{s.name}</h3>
              {s.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                  {s.description}
                </p>
              )}
              {s.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Clock size={12} /> {s.duration}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {s.startingAt !== null && (
                <span className="text-lg font-bold text-[#0C2E3D]">
                  {s.currency === "EUR" ? "\u20ac" : s.currency}{" "}
                  {s.startingAt.toLocaleString()}
                </span>
              )}
              <Link
                href={`/find-photographer/${username}/book?service=${s.id}`}
                className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#d14a2f] text-white text-sm font-semibold transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Availability calendar ---- */
function AvailabilitySection({
  availability,
  username,
}: {
  availability: Availability[];
  username: string;
}) {
  const [monthOffset, setMonthOffset] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const currentMonth = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [today, monthOffset]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const availableDates = useMemo(() => {
    const set = new Set<string>();
    availability.forEach((a) => {
      const d = new Date(a.date);
      set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    return set;
  }, [availability]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
      <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D] mb-4">
        Availability
      </h2>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonthOffset((p) => Math.max(p - 1, 0))}
          disabled={monthOffset === 0}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-semibold text-[#0C2E3D]">{monthName}</span>
        <button
          onClick={() => setMonthOffset((p) => Math.min(p + 1, 2))}
          disabled={monthOffset >= 2}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null)
            return <span key={`empty-${i}`} className="h-9" />;

          const dateKey = `${year}-${month}-${day}`;
          const isPast =
            new Date(year, month, day) < today &&
            !(
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day
            );
          const isAvail = availableDates.has(dateKey);

          return (
            <span
              key={dateKey}
              className={`flex items-center justify-center h-9 rounded-lg text-sm transition-colors ${
                isPast
                  ? "text-gray-300"
                  : isAvail
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
          Available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-50 border border-gray-200" />
          Unavailable
        </span>
      </div>

      <div className="mt-5 text-center">
        <Link
          href={`/find-photographer/${username}/book`}
          className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#d14a2f] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Calendar size={18} />
          Book a Session
        </Link>
      </div>
    </section>
  );
}

/* ---- Reviews ---- */
function ReviewsSection({
  reviews,
  testimonials,
  averageRating,
  totalReviews,
  photographerName,
}: {
  reviews: Review[];
  testimonials: Testimonial[];
  averageRating: number;
  totalReviews: number;
  photographerName: string;
}) {
  if (reviews.length === 0 && testimonials.length === 0) return null;

  // Rating breakdown (from reviews only)
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    return { star, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#0C2E3D]">
          Reviews
        </h2>
        {totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size={18} />
            <span className="text-lg font-bold text-[#0C2E3D]">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400">
              ({totalReviews} reviews)
            </span>
          </div>
        )}
      </div>

      {/* Breakdown bars */}
      {reviews.length > 0 && (
        <div className="space-y-1.5 mb-8 max-w-sm">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-right text-gray-500">
                {b.star}
                <Star
                  size={10}
                  className="inline ml-0.5 fill-[#D4A853] text-[#D4A853]"
                />
              </span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#D4A853]"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span className="w-8 text-gray-400">{b.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Individual reviews */}
      <div className="space-y-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="border-t border-gray-100 pt-5 first:border-0 first:pt-0"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0C2E3D]">
                    {r.customerName}
                  </span>
                  {r.isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={r.rating} size={13} />
                  <span className="text-xs text-gray-400">
                    {formatDate(r.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            {r.title && (
              <p className="font-semibold text-[#0C2E3D] mt-2">{r.title}</p>
            )}
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              {r.comment}
            </p>

            {/* Review photos */}
            {r.photoUrls.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {r.photoUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={url}
                      alt={`Review photo ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Photographer response */}
            {r.response && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-[#0EA5A5]/30">
                <p className="text-xs font-semibold text-[#0EA5A5] mb-0.5">
                  Response from {photographerName}
                </p>
                <p className="text-sm text-gray-600">{r.response}</p>
              </div>
            )}
          </div>
        ))}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <>
            {reviews.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-[#0C2E3D] mb-4 text-sm uppercase tracking-wider">
                  Testimonials
                </h3>
              </div>
            )}
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="border-t border-gray-100 pt-5 first:border-0 first:pt-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0C2E3D]">
                    {t.clientName}
                  </span>
                  {t.eventType && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {t.eventType}
                    </span>
                  )}
                </div>
                <StarRating rating={t.rating} size={13} />
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {t.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function ProfileClient({ profile }: { profile: Profile }) {
  const minPrice = lowestPrice(profile.services);

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <HeroSection profile={profile} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <BioSection profile={profile} />
        <PortfolioSection photos={profile.portfolioPhotos} />
        <ServicesSection
          services={profile.services}
          username={profile.username}
        />
        <AvailabilitySection
          availability={profile.availability}
          username={profile.username}
        />
        <ReviewsSection
          reviews={profile.reviews}
          testimonials={profile.testimonials}
          averageRating={profile.averageRating}
          totalReviews={profile.totalReviews}
          photographerName={profile.user.name}
        />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-white border-t border-gray-200 px-4 py-3 safe-area-pb">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-[#0C2E3D] text-sm truncate">
              Book {profile.user.name}
            </p>
            {minPrice !== null && (
              <p className="text-xs text-gray-500">From &euro;{minPrice}</p>
            )}
          </div>
          <Link
            href={`/find-photographer/${profile.username}/book`}
            className="flex-shrink-0 bg-[#F97316] hover:bg-[#d14a2f] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Bottom spacer for sticky bar on mobile */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
