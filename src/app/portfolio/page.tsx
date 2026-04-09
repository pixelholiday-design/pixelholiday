import Link from "next/link";
import { prisma } from "@/lib/db";
import { cleanUrl, photoRef } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pixelvo — Portfolio",
  description:
    "Pixelvo captures unforgettable moments at the world's best resorts, water parks, and attractions. Browse our work and book your session today.",
  openGraph: {
    title: "Pixelvo — Portfolio",
    description: "Memories worth keeping. Photography at the resorts you love.",
  },
};

type ShowcasePhoto = {
  id: string;
  s3Key_highRes: string;
  cloudinaryId: string | null;
};

type ShowcaseLocation = {
  id: string;
  name: string;
  type: string;
  coverPhoto: ShowcasePhoto | null;
  galleryCount: number;
};

const TESTIMONIALS = [
  {
    quote:
      "We went home with photos that feel like real memories, not phone snaps. The whole family is on the wall now.",
    author: "Marie & Olivier",
    location: "Hilton Monastir",
  },
  {
    quote:
      "The kids were laughing in every shot. The photographer made it feel like part of the holiday, not a chore.",
    author: "The Hassan family",
    location: "AquaSplash Water Park",
  },
  {
    quote:
      "Booked the digital pass before we even arrived. Best 100 EUR I've spent on a trip.",
    author: "Priya R.",
    location: "Hilton Monastir",
  },
];

async function loadShowcase() {
  // Featured photos: pull from PAID and PREVIEW_ECOM galleries, prefer hook images
  const galleries = await prisma.gallery.findMany({
    where: { status: { in: ["PAID", "PREVIEW_ECOM", "PARTIAL_PAID"] } },
    include: {
      photos: { orderBy: { isHookImage: "desc" }, take: 6 },
      location: { select: { id: true, name: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const photos: ShowcasePhoto[] = [];
  const seen = new Set<string>();
  for (const g of galleries) {
    for (const p of g.photos) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      photos.push({ id: p.id, s3Key_highRes: p.s3Key_highRes, cloudinaryId: p.cloudinaryId });
      if (photos.length >= 24) break;
    }
    if (photos.length >= 24) break;
  }

  // Locations: dedupe by name (seed left some duplicates)
  const locMap = new Map<string, ShowcaseLocation>();
  for (const g of galleries) {
    if (!g.location) continue;
    const key = g.location.name;
    if (!locMap.has(key)) {
      locMap.set(key, {
        id: g.location.id,
        name: g.location.name,
        type: g.location.type,
        coverPhoto: g.photos[0] ?? null,
        galleryCount: 1,
      });
    } else {
      const existing = locMap.get(key)!;
      existing.galleryCount += 1;
      if (!existing.coverPhoto && g.photos[0]) existing.coverPhoto = g.photos[0];
    }
  }

  return { photos, locations: Array.from(locMap.values()) };
}

function locationLabel(type: string) {
  switch (type) {
    case "HOTEL":
      return "Resort & Hotel";
    case "WATER_PARK":
      return "Water Park";
    case "ATTRACTION":
      return "Attraction";
    case "SELF_SERVICE":
      return "Self-Service Studio";
    default:
      return type;
  }
}

export default async function PortfolioPage() {
  const { photos, locations } = await loadShowcase();

  return (
    <div className="min-h-screen bg-cream-100 text-navy-900">
      {/* ── Top nav ────────────────────────────────────── */}
      <nav className="absolute top-0 inset-x-0 z-20 px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-white font-display text-2xl tracking-tight">
          Pixelvo
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/shop"
            className="text-white/90 hover:text-white px-3 py-2 transition"
          >
            Shop
          </Link>
          <Link
            href="/book"
            className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-full font-semibold shadow-card transition"
          >
            Book a session
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <header className="relative h-[70vh] min-h-[480px] overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300">
        {photos[0] && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cleanUrl(photoRef(photos[0]), 2000)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/30 to-transparent" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-brand-100 uppercase tracking-[0.3em] text-xs font-semibold mb-4">
            Resort photography, reimagined
          </p>
          <h1 className="text-white font-display text-5xl md:text-7xl leading-tight max-w-4xl">
            Capturing moments that last forever
          </h1>
          <p className="text-white/85 text-lg md:text-xl mt-6 max-w-2xl">
            Professional photography at the resorts and parks you love — delivered
            instantly to your phone, ready to share before you even leave the lobby.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link
              href="/book"
              className="bg-coral-500 hover:bg-coral-600 text-white px-7 py-3.5 rounded-full font-semibold shadow-lift transition"
            >
              Book your session
            </Link>
            <Link
              href="/shop"
              className="bg-white/10 backdrop-blur hover:bg-white/20 text-white px-7 py-3.5 rounded-full font-semibold border border-white/30 transition"
            >
              Browse the shop
            </Link>
          </div>
        </div>
      </header>

      {/* ── Featured photos ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-brand-700 uppercase tracking-[0.25em] text-xs font-semibold">
            The work
          </p>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-navy-900">
            Real moments, captured by real photographers
          </h2>
          <p className="text-navy-500 mt-4 max-w-2xl mx-auto">
            Every photo below was taken on assignment at one of our partner
            destinations. No stock. No filters. Just light, timing, and people having
            a great time.
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-20 text-navy-500">
            Our portfolio is being curated — check back soon.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {photos.map((p) => (
              <div
                key={p.id}
                className="mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-cream-200 ring-1 ring-cream-300 shadow-card hover:shadow-lift transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cleanUrl(photoRef(p), 1200)}
                  alt=""
                  loading="lazy"
                  className="w-full block transition duration-500 hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Destinations ───────────────────────────────── */}
      {locations.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-brand-700 uppercase tracking-[0.25em] text-xs font-semibold">
                Where we shoot
              </p>
              <h2 className="font-display text-4xl md:text-5xl mt-3 text-navy-900">
                Destinations we cover
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="group rounded-2xl overflow-hidden bg-cream-100 ring-1 ring-cream-300 shadow-card hover:shadow-lift transition"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-700 to-brand-300 overflow-hidden">
                    {loc.coverPhoto && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cleanUrl(photoRef(loc.coverPhoto), 1000)}
                        alt={loc.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-brand-700 text-xs uppercase tracking-wider font-semibold">
                      {locationLabel(loc.type)}
                    </p>
                    <h3 className="font-display text-2xl mt-1 text-navy-900">
                      {loc.name}
                    </h3>
                    <p className="text-navy-500 text-sm mt-2">
                      {loc.galleryCount}{" "}
                      {loc.galleryCount === 1 ? "session" : "sessions"} captured
                    </p>
                    <Link
                      href="/book"
                      className="inline-flex items-center text-brand-700 font-semibold mt-4 hover:text-brand-500 transition"
                    >
                      Book here →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-brand-700 uppercase tracking-[0.25em] text-xs font-semibold">
            What guests say
          </p>
          <h2 className="font-display text-4xl md:text-5xl mt-3 text-navy-900">
            Loved at every stop
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="bg-white rounded-2xl p-8 ring-1 ring-cream-300 shadow-card"
            >
              <div className="text-brand-400 text-5xl font-display leading-none mb-4">
                &ldquo;
              </div>
              <blockquote className="text-navy-700 leading-relaxed">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-semibold text-navy-900">{t.author}</div>
                <div className="text-navy-500">{t.location}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-white">
            Ready for your shoot?
          </h2>
          <p className="text-brand-100 mt-4 text-lg">
            Pick a date, choose a destination, and let us take care of the rest.
          </p>
          <Link
            href="/book"
            className="inline-block mt-8 bg-white hover:bg-cream-100 text-brand-700 px-8 py-4 rounded-full font-bold text-lg shadow-lift transition"
          >
            Book your session today
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="bg-navy-900 text-navy-300 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Pixelvo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/shop" className="hover:text-white transition">
              Shop
            </Link>
            <Link href="/book" className="hover:text-white transition">
              Book
            </Link>
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
          </div>
          <div className="text-xs text-navy-400">
            © {new Date().getFullYear()} Pixelvo
          </div>
        </div>
      </footer>
    </div>
  );
}
