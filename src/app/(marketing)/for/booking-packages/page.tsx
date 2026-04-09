import { Metadata } from "next";
import {
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
  Sunrise,
  Hotel,
  QrCode,
  Code2,
  Globe,
  DollarSign,
  Plus,
  Shield,
  Mail,
  CalendarDays,
  Smartphone,
  Camera,
  Users,
  Sparkles,
  Timer,
  SunDim,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Booking Packages | Fotiqo",
  description:
    "Let customers book and pay instantly — like Bokun, but for photography. Create packages, accept deposits, confirm via WhatsApp, and manage availability in real time.",
};

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-brand-800 to-coral-900" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-28 pb-20">
        <SectionFadeIn>
          <p className="text-sm font-semibold text-coral-300 uppercase tracking-wider mb-4">
            Booking Packages
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6 text-balance">
            Let customers book and pay instantly{" "}
            <span className="text-brand-300">like Bokun, but for photography</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create photography packages with session types, durations, and add-ons. Clients browse, pick a date, pay online, and get instant confirmation via WhatsApp and email. No back-and-forth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <CTAPrimary href="/signup">Create Your First Package Free</CTAPrimary>
            <CTAGhost href="#how-it-works">See How It Works</CTAGhost>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Instant confirmation</span>
            <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Secure payments</span>
            <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> WhatsApp + Email</span>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS — 5 STEPS                                             */
/* ------------------------------------------------------------------ */
function HowItWorks() {
  const steps = [
    {
      num: "1",
      icon: Plus,
      title: "Create your packages",
      desc: "Define session types (portrait, family, couple, event), durations, pricing, add-ons, and deposits. Set your availability calendar.",
    },
    {
      num: "2",
      icon: Globe,
      title: "Clients browse and discover",
      desc: "Your packages appear on your portfolio website and the Fotiqo marketplace. Clients search by location, date, specialty, and budget.",
    },
    {
      num: "3",
      icon: CalendarDays,
      title: "Pick a date and time",
      desc: "Clients see your real-time availability. They select a date, a time slot, and any add-ons. No emails, no phone calls, no friction.",
    },
    {
      num: "4",
      icon: CreditCard,
      title: "Pay securely online",
      desc: "Stripe-powered checkout with deposits or full payment. Credit cards, Apple Pay, Google Pay. Automatic invoicing and tax receipts.",
    },
    {
      num: "5",
      icon: CheckCircle2,
      title: "Instant confirmation",
      desc: "Both you and the client receive WhatsApp messages, email confirmations, and calendar invites. The booking appears on your dashboard immediately.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Five steps from discovery to confirmed booking
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            No email ping-pong. No manual invoicing. Your clients book and pay in under two minutes.
          </p>
        </SectionFadeIn>

        <div className="max-w-3xl mx-auto space-y-6">
          {steps.map((s, i) => (
            <SectionFadeIn key={s.num} delay={i * 80}>
              <div className="card p-6 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-brand-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">Step {s.num}</span>
                    <h3 className="font-display text-lg font-bold text-navy-900">{s.title}</h3>
                  </div>
                  <p className="text-navy-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 text-navy-200" />
                </div>
              )}
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOR RESORT OPERATORS                                               */
/* ------------------------------------------------------------------ */
function ResortSection() {
  const features = [
    { icon: Hotel, text: "Pre-built packages for hotels, water parks, and attractions" },
    { icon: QrCode, text: "QR codes for hotel rooms, reception desks, and lobby signs" },
    { icon: Sunrise, text: "Golden-hour and sunset session auto-scheduling" },
    { icon: Code2, text: "Embeddable booking widget for hotel websites" },
    { icon: Users, text: "Auto-dispatch to the highest-rated available photographer" },
    { icon: Smartphone, text: "Guest scans QR, picks a time, pays, done" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <SectionFadeIn className="flex-1">
            <p className="text-sm font-semibold text-coral-500 uppercase tracking-wider mb-3">For Resort Operators</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Pre-built packages for hospitality
            </h2>
            <p className="text-navy-600 leading-relaxed mb-8">
              If you run photography at a hotel, water park, or attraction, Fotiqo gives you ready-made booking packages. Place QR codes across the property. Guests scan, pick a time, and pay. Your photographers get dispatched automatically.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <f.icon className="w-5 h-5 text-coral-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-navy-700">{f.text}</span>
                </div>
              ))}
            </div>
          </SectionFadeIn>

          <SectionFadeIn className="flex-1 w-full max-w-md" delay={120}>
            <div className="card p-6 space-y-4">
              <h4 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">Sample Package</h4>
              <div className="rounded-xl bg-gradient-to-br from-coral-50 to-brand-50 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Sunrise className="w-5 h-5 text-coral-500" />
                  <span className="font-display font-bold text-navy-900">Sunset Beach Session</span>
                </div>
                <p className="text-sm text-navy-600 mb-4">45-minute golden-hour couple shoot at the hotel beach. Includes 30 edited digital photos delivered within 24 hours.</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-navy-900">EUR 89</span>
                  <span className="text-sm text-navy-400">per session</span>
                </div>
                <div className="space-y-2 mb-4">
                  {["30 edited digital photos", "Online gallery with downloads", "Golden-hour timing guaranteed", "Print add-ons available"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-xs text-navy-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
                <div className="h-10 rounded-lg bg-coral-500/20 flex items-center justify-center text-sm font-semibold text-coral-600">
                  Book Now
                </div>
              </div>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FOR INDEPENDENT PHOTOGRAPHERS                                      */
/* ------------------------------------------------------------------ */
function IndependentSection() {
  const features = [
    { icon: Camera, text: "Create your own package types, pricing, and session durations" },
    { icon: Globe, text: "Packages appear on your portfolio website and the marketplace" },
    { icon: CalendarCheck, text: "Real-time availability calendar synced across platforms" },
    { icon: CreditCard, text: "Deposits or full payments collected at booking" },
    { icon: Shield, text: "0% commission for clients from your own website" },
    { icon: Star, text: "Client reviews build your reputation over time" },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
          <SectionFadeIn className="flex-1">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">For Independent Photographers</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Your packages, your site, your terms
            </h2>
            <p className="text-navy-600 leading-relaxed mb-8">
              Create custom packages for portraits, weddings, events, or any specialty. Embed the booking widget on your own website or let clients find you on the Fotiqo marketplace. You set the prices and the schedule.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <f.icon className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-navy-700">{f.text}</span>
                </div>
              ))}
            </div>
          </SectionFadeIn>

          <SectionFadeIn className="flex-1 w-full max-w-md" delay={120}>
            <div className="card p-6 space-y-4">
              <h4 className="text-sm font-semibold text-navy-400 uppercase tracking-wider">Your Availability</h4>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="text-navy-400 font-medium py-1">{d}</span>
                ))}
                {Array.from({ length: 28 }, (_, i) => {
                  const day = i + 1;
                  const isBooked = [3, 7, 12, 15, 21, 24].includes(day);
                  const isGolden = [5, 10, 18, 26].includes(day);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                        isBooked
                          ? "bg-coral-100 text-coral-600"
                          : isGolden
                          ? "bg-gold-50 text-gold-600 ring-1 ring-gold-200"
                          : "bg-brand-50/50 text-navy-600"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-navy-500 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-coral-100" /> Booked</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-gold-50 ring-1 ring-gold-200" /> Golden Hour</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand-50/50" /> Available</span>
              </div>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMMISSION MODEL                                                   */
/* ------------------------------------------------------------------ */
function CommissionSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Fair Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Simple, transparent commission
          </h2>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <SectionFadeIn>
            <div className="card p-8 border-2 border-brand-400">
              <h3 className="font-display text-xl font-bold text-navy-900 mb-2">Resort and direct bookings</h3>
              <div className="text-5xl font-bold text-brand-500 mb-2">0%</div>
              <p className="text-navy-500 mb-4">commission</p>
              <p className="text-sm text-navy-600 leading-relaxed">
                Bookings from your own website, QR codes at your resort, or direct links you share with clients. You keep one hundred percent of the revenue.
              </p>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="card p-8">
              <h3 className="font-display text-xl font-bold text-navy-900 mb-2">Marketplace bookings</h3>
              <div className="text-5xl font-bold text-coral-500 mb-2">3-10%</div>
              <p className="text-navy-500 mb-4">commission</p>
              <p className="text-sm text-navy-600 leading-relaxed">
                Clients who discover you through the Fotiqo marketplace. We handle all the marketing, discovery, and trust signals. Your commission rate decreases as your volume grows.
              </p>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ADD-ONS + CONFIRMATION + WIDGET + AVAILABILITY                     */
/* ------------------------------------------------------------------ */
function ExtrasSection() {
  const extras = [
    {
      icon: Plus,
      title: "Add-ons at checkout",
      desc: "Let clients add extra prints, video clips, album upgrades, or extended session time during booking. Increase your average order value without any extra effort.",
    },
    {
      icon: MessageSquare,
      title: "Instant confirmation",
      desc: "Both you and your client receive a WhatsApp message, an email with all details, and a calendar invite. No confirmation delays, no missed bookings.",
    },
    {
      icon: Code2,
      title: "Embeddable widget",
      desc: "Add the Fotiqo booking widget to any website with one line of code. It inherits your branding and shows your packages, calendar, and checkout inline.",
    },
    {
      icon: SunDim,
      title: "Availability engine",
      desc: "Real-time calendar with golden-hour detection. The system knows when sunset is at your location and highlights the best times for outdoor sessions automatically.",
    },
  ];

  return (
    <section className="py-24 bg-navy-900">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-3">Powerful Details</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Built for real photography operations
          </h2>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          {extras.map((e, i) => (
            <SectionFadeIn key={e.title} delay={i * 80}>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
                <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-5">
                  <e.icon className="w-6 h-6 text-brand-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{e.title}</h3>
                <p className="text-brand-100/70 leading-relaxed">{e.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  BOKUN COMPARISON                                                   */
/* ------------------------------------------------------------------ */
function ComparisonSection() {
  const rows = [
    { feature: "Tour and activity bookings", pixel: "Photography-focused", bokun: "General tours" },
    { feature: "Package builder", pixel: "Session types + add-ons", bokun: "Tour products" },
    { feature: "Photographer dispatch", pixel: "Auto-assign by rating", bokun: "Not available" },
    { feature: "Gallery delivery", pixel: "Built-in", bokun: "Not available" },
    { feature: "Print store", pixel: "150+ products", bokun: "Not available" },
    { feature: "WhatsApp confirmation", pixel: "Automatic", bokun: "Not included" },
    { feature: "Golden-hour detection", pixel: "Built-in", bokun: "Not available" },
    { feature: "Embeddable widget", pixel: "Yes", bokun: "Yes" },
    { feature: "Commission model", pixel: "0% direct, 3-10% marketplace", bokun: "Monthly fee + commission" },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-4xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Compare</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Bokun for tours. Fotiqo for photography.
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Bokun is great for tour operators. But photography has unique needs: gallery delivery, print sales, photographer dispatch, and golden-hour timing. That is what Fotiqo is built for.
          </p>
        </SectionFadeIn>

        <SectionFadeIn delay={80}>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-navy-100">
                    <th className="py-4 px-5 text-sm font-semibold text-navy-500">Feature</th>
                    <th className="py-4 px-5 text-sm font-semibold text-brand-500">Fotiqo</th>
                    <th className="py-4 px-5 text-sm font-semibold text-navy-400">Bokun / Generic</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.feature} className="border-b border-navy-50">
                      <td className="py-3.5 px-5 text-sm text-navy-700">{r.feature}</td>
                      <td className="py-3.5 px-5 text-sm font-medium text-brand-600">{r.pixel}</td>
                      <td className="py-3.5 px-5 text-sm text-navy-400">{r.bokun}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FINAL CTA                                                          */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-coral-600 to-coral-800">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionFadeIn>
          <CalendarCheck className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Start accepting bookings today
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Create your first photography package in minutes. No monthly fees, no setup costs. Free to start and free to use for direct bookings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAPrimary href="/signup">Create Your First Package Free</CTAPrimary>
            <CTAGhost href="/for/freelance-photographers">Learn More for Freelancers</CTAGhost>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function BookingPackagesPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ResortSection />
      <IndependentSection />
      <CommissionSection />
      <ExtrasSection />
      <ComparisonSection />
      <FinalCTA />
    </>
  );
}
