import { Metadata } from "next";
import {
  Search,
  MapPin,
  CalendarCheck,
  CreditCard,
  Star,
  Images,
  MessageSquare,
  Shield,
  DollarSign,
  Clock,
  TrendingUp,
  Printer,
  Heart,
  Camera,
  Users,
  Globe,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Filter,
  ThumbsUp,
  Wallet,
  Eye,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Photographer Marketplace | Fotiqo",
  description:
    "Find the perfect photographer anywhere in the world. Search by location, date, specialty, and budget. Book instantly, pay securely, get your photos in a personal gallery.",
};

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-brand-900 to-navy-900" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-28 pb-20">
        <SectionFadeIn>
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-4">
            Photographer Marketplace
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 text-balance">
            Find the perfect photographer{" "}
            <span className="text-gold-400">anywhere in the world</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Search by location, date, specialty, and budget. Browse portfolios, read reviews, and book instantly. Your photos arrive in a personal gallery with prints available worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <CTAPrimary href="/marketplace">Find a Photographer</CTAPrimary>
            <CTAGhost href="/signup">Join as a Photographer</CTAGhost>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/60 text-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
              ))}
            </div>
            <span>500+ photographers across 40+ countries</span>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SEARCH PREVIEW (visual)                                            */
/* ------------------------------------------------------------------ */
function SearchPreview() {
  const photographers = [
    { name: "Sarah Chen", loc: "Bali, Indonesia", specialty: "Couple & Wedding", rating: 4.9, reviews: 127, price: "From EUR 79" },
    { name: "Marco Rossi", loc: "Amalfi Coast, Italy", specialty: "Family & Portrait", rating: 4.8, reviews: 94, price: "From EUR 99" },
    { name: "Aisha Kaddour", loc: "Marrakech, Morocco", specialty: "Travel & Lifestyle", rating: 5.0, reviews: 63, price: "From EUR 59" },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Discover</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Browse photographers for any occasion
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Search by destination, date, photography style, and budget. Every photographer has a portfolio, verified reviews, and instant booking.
          </p>
        </SectionFadeIn>

        {/* Fake search bar */}
        <SectionFadeIn delay={60}>
          <div className="card p-4 flex flex-col sm:flex-row items-center gap-3 max-w-3xl mx-auto mb-12">
            <div className="flex items-center gap-2 flex-1 w-full px-3 py-2 rounded-lg bg-cream-100">
              <MapPin className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-500">Bali, Indonesia</span>
            </div>
            <div className="flex items-center gap-2 flex-1 w-full px-3 py-2 rounded-lg bg-cream-100">
              <CalendarCheck className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-500">May 15, 2026</span>
            </div>
            <div className="flex items-center gap-2 flex-1 w-full px-3 py-2 rounded-lg bg-cream-100">
              <Filter className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-500">Couple shoot</span>
            </div>
            <div className="h-10 px-5 rounded-lg bg-coral-500 text-white text-sm font-semibold flex items-center justify-center shrink-0">
              Search
            </div>
          </div>
        </SectionFadeIn>

        {/* Photographer cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {photographers.map((p, i) => (
            <SectionFadeIn key={p.name} delay={i * 100}>
              <div className="card overflow-hidden h-full">
                {/* Placeholder portfolio image */}
                <div className="aspect-[3/2] bg-gradient-to-br from-brand-100 to-brand-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-brand-400/40" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-navy-900">{p.name}</h3>
                      <p className="text-sm text-navy-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {p.loc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                      <span className="font-semibold text-navy-900">{p.rating}</span>
                      <span className="text-navy-400">({p.reviews})</span>
                    </div>
                  </div>
                  <p className="text-xs text-brand-600 font-medium bg-brand-50 inline-block px-2 py-0.5 rounded-full mb-3">
                    {p.specialty}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-navy-900">{p.price}</span>
                    <span className="text-sm font-semibold text-coral-500 flex items-center gap-1">
                      View profile <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOR CUSTOMERS                                                      */
/* ------------------------------------------------------------------ */
function ForCustomers() {
  const steps = [
    { icon: Search, title: "Search and discover", desc: "Find photographers by location, date, specialty, and budget. Browse portfolios and read verified reviews from real clients." },
    { icon: Eye, title: "Browse portfolios", desc: "Every photographer has a full portfolio with their best work, session types, pricing, and availability calendar." },
    { icon: CalendarCheck, title: "Book instantly", desc: "Pick your date, choose add-ons, and confirm. No email back-and-forth. Your booking is confirmed in seconds." },
    { icon: CreditCard, title: "Pay securely", desc: "Stripe-powered checkout with credit cards, Apple Pay, and Google Pay. Your payment is protected and only released after your session." },
    { icon: Images, title: "Get your photos", desc: "Receive your photos in a personal gallery. Browse, favorite, and download. Print any photo on 150+ products." },
    { icon: Star, title: "Rate and review", desc: "Share your experience to help future clients. Your review helps great photographers get discovered." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-coral-500 uppercase tracking-wider mb-3">For Customers</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Professional photos, wherever you are
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Whether you are on holiday, celebrating a milestone, or need professional headshots, the Fotiqo marketplace connects you with vetted photographers instantly.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <SectionFadeIn key={s.title} delay={i * 80}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-coral-50 flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5 text-coral-500" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-navy-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </SectionFadeIn>
          ))}
        </div>

        <SectionFadeIn className="text-center mt-12" delay={200}>
          <CTAPrimary href="/marketplace">Find a Photographer</CTAPrimary>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOR PHOTOGRAPHERS                                                  */
/* ------------------------------------------------------------------ */
function ForPhotographers() {
  const benefits = [
    { icon: Globe, title: "Get discovered", desc: "Your profile appears in search results when clients look for photographers in your area. No advertising costs, no marketing overhead." },
    { icon: DollarSign, title: "Set your prices", desc: "You control your rates, packages, add-ons, and minimum booking requirements. No price caps, no mandatory discounts." },
    { icon: CalendarCheck, title: "Accept bookings automatically", desc: "Clients book directly from your profile. You get WhatsApp and email notifications instantly. No approval delays unless you choose manual mode." },
    { icon: Wallet, title: "Get paid weekly", desc: "You keep 90% of every marketplace booking. Payments processed via Stripe with automatic weekly payouts to your bank account." },
    { icon: ThumbsUp, title: "Build your reputation", desc: "Verified client reviews help you stand out. Higher ratings mean higher placement in search results and more bookings." },
    { icon: Images, title: "Gallery delivery handled", desc: "Upload photos after the session. Your client gets a stunning watermarked gallery with checkout, downloads, and print sales built in." },
  ];

  return (
    <section className="py-24 bg-navy-900">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-3">For Photographers</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Grow your business on your terms
          </h2>
          <p className="text-lg text-brand-100/70 max-w-2xl mx-auto">
            Join a marketplace that works for you. Set your own prices, keep 90% of every booking, and let us handle discovery, payments, and gallery delivery.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <SectionFadeIn key={b.title} delay={i * 80}>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-5">
                  <b.icon className="w-6 h-6 text-brand-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{b.title}</h3>
                <p className="text-brand-100/70 leading-relaxed">{b.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>

        <SectionFadeIn className="text-center mt-12" delay={200}>
          <CTAPrimary href="/signup">Join as a Photographer</CTAPrimary>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  EARNINGS BREAKDOWN                                                 */
/* ------------------------------------------------------------------ */
function EarningsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Earnings</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            You shoot. We handle the rest.
          </h2>
        </SectionFadeIn>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <SectionFadeIn>
            <div className="card p-8 text-center h-full">
              <div className="text-4xl font-bold text-brand-500 mb-2">90%</div>
              <h3 className="font-display text-lg font-bold text-navy-900 mb-3">Booking revenue</h3>
              <p className="text-sm text-navy-600">You keep 90% of every marketplace booking. We take 10% to cover discovery, payments, and platform operations.</p>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="card p-8 text-center h-full">
              <div className="text-4xl font-bold text-coral-500 mb-2">100%</div>
              <h3 className="font-display text-lg font-bold text-navy-900 mb-3">Print markups</h3>
              <p className="text-sm text-navy-600">Set your own markup on 150+ print products. You decide the price. You keep the difference between retail and production cost.</p>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={200}>
            <div className="card p-8 text-center h-full">
              <div className="text-4xl font-bold text-gold-500 mb-2">Weekly</div>
              <h3 className="font-display text-lg font-bold text-navy-900 mb-3">Payouts</h3>
              <p className="text-sm text-navy-600">Automatic weekly payouts to your bank account via Stripe. No invoicing, no chasing payments, no minimum thresholds.</p>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TRUST SIGNALS                                                      */
/* ------------------------------------------------------------------ */
function TrustSection() {
  const signals = [
    { icon: Shield, title: "Secure payments", desc: "All transactions processed by Stripe with PCI-compliant security. Customer payments held safely until the session is completed." },
    { icon: Star, title: "Verified reviews", desc: "Only clients who completed a booking can leave a review. No fake reviews, no self-promotion. Honest feedback you can trust." },
    { icon: Heart, title: "Satisfaction guarantee", desc: "Every marketplace booking comes with a quality promise. If something goes wrong, our support team steps in to make it right." },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Trust and Safety</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Book with confidence
          </h2>
        </SectionFadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {signals.map((s, i) => (
            <SectionFadeIn key={s.title} delay={i * 100}>
              <div className="card p-8 text-center h-full">
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
                  <s.icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-3">{s.title}</h3>
                <p className="text-navy-600 leading-relaxed">{s.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SPLIT CTA                                                          */
/* ------------------------------------------------------------------ */
function SplitCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden rounded-3xl shadow-lift">
          {/* Customer side */}
          <SectionFadeIn>
            <div className="bg-gradient-to-br from-coral-500 to-coral-700 p-12 md:p-16 text-center h-full flex flex-col items-center justify-center">
              <Search className="w-10 h-10 text-white/80 mb-5" />
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Looking for a photographer?
              </h3>
              <p className="text-white/70 mb-8 max-w-sm">
                Search by location, date, and style. Browse portfolios, read reviews, and book the perfect photographer for your moment.
              </p>
              <CTAPrimary href="/marketplace">Find a Photographer</CTAPrimary>
            </div>
          </SectionFadeIn>

          {/* Photographer side */}
          <SectionFadeIn delay={100}>
            <div className="bg-gradient-to-br from-navy-800 to-brand-900 p-12 md:p-16 text-center h-full flex flex-col items-center justify-center">
              <Camera className="w-10 h-10 text-white/80 mb-5" />
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-4">
                Want to grow your business?
              </h3>
              <p className="text-white/70 mb-8 max-w-sm">
                Join the marketplace, get discovered by clients worldwide, and keep 90% of every booking. Free to join, no monthly fees.
              </p>
              <CTAPrimary href="/signup">Join as a Photographer</CTAPrimary>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function PhotographerMarketplacePage() {
  return (
    <>
      <Hero />
      <SearchPreview />
      <ForCustomers />
      <ForPhotographers />
      <EarningsSection />
      <TrustSection />
      <SplitCTA />
    </>
  );
}
