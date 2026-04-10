import { Camera, Heart, Globe, Users, MapPin, Rocket, Calendar } from "lucide-react";
import SectionFadeIn from "../_components/SectionFadeIn";
import { CTAPrimary, CTADark } from "../_components/CTAButton";

export const metadata = {
  title: "About Fotiqo  — Our Story & Mission",
  description:
    "We built the all-in-one photography platform we wished existed. Learn about our mission, our team, and why 500+ photographers trust Fotiqo.",
};

/* ── Hero ────────────────────────────────────── */
function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 pt-32 pb-24 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(41,171,226,0.12),transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <p className="label-xs mb-4 text-brand-300 tracking-widest uppercase">About Us</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-balance">
            We believe every photo deserves to be seen
          </h1>
          <p className="text-lg text-navy-300 max-w-xl mx-auto leading-relaxed">
            Fotiqo is the platform photographers use to deliver, sell, and grow
            &mdash; without juggling five different tools.
          </p>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ── Story ───────────────────────────────────── */
function StorySection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-6">
            Our Story
          </h2>
          <div className="space-y-5 text-navy-600 text-lg leading-relaxed">
            <p>
              We started Fotiqo because we saw photographers struggling with five
              different tools to run their business. Gallery delivery on one platform.
              Print sales on another. Bookings somewhere else. Website on a fourth.
              Invoicing on a fifth.
            </p>
            <p>
              We built the all-in-one platform we wished existed.
            </p>
            <p>
              Today, Fotiqo powers resort photographers across three continents,
              freelancers delivering wedding galleries, and studios managing teams of
              50+. One login. Every tool you need.
            </p>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ── Values ──────────────────────────────────── */
const values = [
  {
    icon: Camera,
    title: "Photographer First",
    body: "Every feature we build starts with one question: does this make photographers' lives easier?",
  },
  {
    icon: Heart,
    title: "Fair Revenue",
    body: "No monthly fees. We only succeed when you succeed. Our commission model means we're always aligned with your growth.",
  },
  {
    icon: Globe,
    title: "Global Reach, Local Touch",
    body: "From resort photography in Tunisia to wedding shoots in London   — our platform adapts to every market and workflow.",
  },
];

function ValuesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-6xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 text-center mb-4">
            What drives us
          </h2>
          <p className="text-navy-500 text-center max-w-xl mx-auto mb-14">
            Three principles that guide every line of code we write.
          </p>
        </SectionFadeIn>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <SectionFadeIn key={v.title} delay={i * 120}>
              <div className="card p-8 text-center h-full">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-3">
                  {v.title}
                </h3>
                <p className="text-navy-500 leading-relaxed">{v.body}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ───────────────────────────────────── */
const stats = [
  { value: "500+", label: "Photographers" },
  { value: "12", label: "Countries" },
  { value: "1M+", label: "Photos Delivered" },
  { value: "€2M+", label: "In Sales Processed" },
];

function StatsSection() {
  return (
    <section className="py-20 bg-navy-900">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <SectionFadeIn key={s.label} delay={i * 100}>
              <div className="text-center">
                <p className="font-display text-4xl md:text-5xl font-bold text-brand-300 mb-1">
                  {s.value}
                </p>
                <p className="text-sm text-navy-400 tracking-wide uppercase">{s.label}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Team ────────────────────────────────────── */
const team = [
  {
    initials: "AK",
    name: "Adam Kerrouche",
    role: "Founder & CEO",
    bio: "The vision behind Fotiqo. Obsessed with turning resort photography from a side hustle into a scalable business.",
    color: "bg-brand-400",
  },
  {
    initials: "MH",
    name: "Mehdi Haddad",
    role: "CTO",
    bio: "Built the platform from the ground up. Formerly engineering at Cloudinary and Vercel. Loves fast uploads and faster deploys.",
    color: "bg-coral-500",
  },
  {
    initials: "SB",
    name: "Sophie Belkhir",
    role: "Head of Photography",
    bio: "20 years of resort photography experience across Europe, North Africa, and the Caribbean. Knows the workflows inside out.",
    color: "bg-gold-500",
  },
  {
    initials: "YT",
    name: "Youssef Trabelsi",
    role: "Head of Growth",
    bio: "Drives partnerships and marketing. Previously grew two marketplace startups from zero to seven figures.",
    color: "bg-navy-600",
  },
];

function TeamSection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-6xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 text-center mb-4">
            Meet the team
          </h2>
          <p className="text-navy-500 text-center max-w-xl mx-auto mb-14">
            A small, focused team building the future of photography delivery.
          </p>
        </SectionFadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((t, i) => (
            <SectionFadeIn key={t.name} delay={i * 100}>
              <div className="card p-6 text-center h-full">
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white font-display text-xl font-bold ${t.color}`}
                >
                  {t.initials}
                </div>
                <h3 className="font-display text-lg font-bold text-navy-900">{t.name}</h3>
                <p className="text-sm text-brand-500 font-medium mb-3">{t.role}</p>
                <p className="text-sm text-navy-500 leading-relaxed">{t.bio}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Timeline ────────────────────────────────── */
const milestones = [
  { year: "2024", icon: Rocket, title: "Founded", body: "Fotiqo incorporated with a mission to unify photography workflows." },
  { year: "2025", icon: MapPin, title: "First resort partner", body: "Signed our first hotel in Monastir, Tunisia and proved the model." },
  { year: "2025", icon: Users, title: "Marketplace launch", body: "Opened the photographer marketplace, connecting talent with venues worldwide." },
  { year: "2026", icon: Calendar, title: "500+ photographers", body: "Crossed 500 active photographers across 12 countries and counting." },
];

function TimelineSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 text-center mb-14">
            Our Journey
          </h2>
        </SectionFadeIn>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-cream-300 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-5 top-0 bottom-0 w-px bg-cream-300 md:hidden" />

          <div className="space-y-12">
            {milestones.map((m, i) => (
              <SectionFadeIn key={`${m.year}-${m.title}`} delay={i * 120}>
                <div className="relative flex items-start gap-6 md:gap-0">
                  {/* Mobile icon */}
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 border-4 border-white md:hidden z-10">
                    <m.icon className="h-4 w-4" />
                  </div>

                  {/* Desktop layout */}
                  <div
                    className={`md:flex md:items-center md:w-full ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`hidden md:flex md:w-[calc(50%-24px)] ${i % 2 === 0 ? "justify-end pr-8" : "justify-start pl-8"}`}>
                      <div className="max-w-xs">
                        <p className="font-display text-sm font-bold text-brand-500 mb-1">{m.year}</p>
                        <h3 className="font-display text-lg font-bold text-navy-900 mb-1">{m.title}</h3>
                        <p className="text-sm text-navy-500 leading-relaxed">{m.body}</p>
                      </div>
                    </div>
                    {/* Center dot (desktop) */}
                    <div className="hidden md:flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500 border-4 border-white z-10">
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div className="md:w-[calc(50%-24px)]" />
                  </div>

                  {/* Mobile text */}
                  <div className="md:hidden">
                    <p className="font-display text-sm font-bold text-brand-500 mb-1">{m.year}</p>
                    <h3 className="font-display text-lg font-bold text-navy-900 mb-1">{m.title}</h3>
                    <p className="text-sm text-navy-500 leading-relaxed">{m.body}</p>
                  </div>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ───────────────────────────────── */
function AboutCTA() {
  return (
    <section className="py-24 bg-navy-900 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <SectionFadeIn>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify your photography business?
          </h2>
          <p className="text-lg text-navy-300 mb-10">
            Join 500+ photographers who deliver, sell, and grow with Fotiqo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAPrimary>Get Started Free</CTAPrimary>
            <CTADark href="/contact">Contact Us</CTADark>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────── */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <StatsSection />
      <TeamSection />
      <TimelineSection />
      <AboutCTA />
    </>
  );
}
