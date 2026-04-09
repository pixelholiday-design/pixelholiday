import type { Metadata } from "next";
import {
  Camera,
  Smartphone,
  Monitor,
  CreditCard,
  Wifi,
  WifiOff,
  Moon,
  Users,
  BarChart3,
  TrendingUp,
  Building2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  Palette,
  Award,
  Target,
  DollarSign,
  MapPin,
  Send,
  MessageSquare,
  QrCode,
  CalendarCheck,
  Zap,
  Trophy,
  Gauge,
  RefreshCw,
  Globe,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Resort Photography Solution | Fotiqo",
  description:
    "Turn your resort into a photo destination. Fotiqo powers on-site photography at hotels, beach resorts, and luxury properties worldwide with kiosk POS, WhatsApp delivery, and automated revenue recovery.",
  keywords: [
    "resort photography",
    "hotel photography solution",
    "on-site photo sales",
    "kiosk POS photography",
    "guest photography platform",
    "resort photo delivery",
  ],
  openGraph: {
    title: "Resort Photography Solution | Fotiqo",
    description:
      "Turn your resort into a photo destination. Kiosk POS, WhatsApp delivery, and automated revenue recovery for hotels and resorts.",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Tiny helper: numbered step circle                                 */
/* ------------------------------------------------------------------ */
function StepCircle({ n }: { n: number }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white font-bold text-lg shadow-lg">
      {n}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature card (dark)                                               */
/* ------------------------------------------------------------------ */
function DarkCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-navy-800/80 border border-navy-700/60 p-6 backdrop-blur-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-400/15 text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-display text-lg font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm leading-relaxed text-navy-300">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Light feature card                                                */
/* ------------------------------------------------------------------ */
function LightCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-400/10 text-brand-400">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="font-display text-lg font-semibold text-navy-900 mb-1">{title}</h4>
      <p className="text-sm leading-relaxed text-navy-500">{desc}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat block                                                        */
/* ------------------------------------------------------------------ */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-4xl md:text-5xl font-bold text-brand-400">{value}</p>
      <p className="mt-1 text-sm text-navy-400">{label}</p>
    </div>
  );
}

/* ================================================================== */
/*  PAGE                                                              */
/* ================================================================== */
export default function ResortPhotographyPage() {
  return (
    <>
      {/* ──────────────── HERO ──────────────── */}
      <section className="relative overflow-hidden bg-navy-900">
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-900/95 to-navy-800" />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-400/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-coral-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36 lg:py-44 text-center">
          <SectionFadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300 mb-6">
              <Building2 className="h-3.5 w-3.5" /> For Hotels &amp; Resorts
            </span>
          </SectionFadeIn>

          <SectionFadeIn delay={80}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] text-white">
              Turn your resort into a{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                photo destination
              </span>
            </h1>
          </SectionFadeIn>

          <SectionFadeIn delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-navy-300">
              Fotiqo powers on-site photography at hotels, beach resorts, and luxury
              properties worldwide. From the first shutter click to the last automated follow-up,
              every moment is a revenue opportunity.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={240}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAPrimary href="/demo">Book a Demo for Your Resort</CTAPrimary>
              <CTAGhost href="#how-it-works">See How It Works</CTAGhost>
            </div>
          </SectionFadeIn>

          {/* Trust row */}
          <SectionFadeIn delay={320}>
            <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-navy-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> No upfront hardware costs</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> Works offline at kiosks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> WhatsApp delivery built-in</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> Revenue in 48 hours</span>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ──────────────── */}
      <section id="how-it-works" className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">The Guest Journey</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              How it works at a hotel
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              From the moment a photographer spots your guest by the pool to months after checkout,
              Fotiqo keeps the revenue engine running. Here is the five-step flow that has
              generated millions in photo sales across resort properties on three continents.
            </p>
          </SectionFadeIn>

          {/* Steps */}
          <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-6">
            {[
              {
                n: 1,
                title: "Photographer captures guests",
                desc: "Your on-site photographer moves through the property -- pool deck, beach, restaurants, activities. Every interaction is an opportunity. Photos upload directly to the cloud or local kiosk via the Fotiqo app, no cables required.",
              },
              {
                n: 2,
                title: "WhatsApp hook sent with preview",
                desc: "Within minutes, the guest receives a WhatsApp message containing a single stunning preview image -- watermarked and irresistible. This is the hook: a taste of their vacation captured professionally, designed to drive action.",
              },
              {
                n: 3,
                title: "Guest visits kiosk or opens gallery",
                desc: "The guest taps the link to view their full gallery online, or strolls to the elegant kiosk near the lobby. The kiosk displays their photos on a large retina screen with no watermarks, creating an immediate emotional connection.",
              },
              {
                n: 4,
                title: "Purchase at kiosk or online",
                desc: "At the kiosk, guests pay by card (Stripe Terminal) or cash. Online, they complete a seamless Stripe checkout. Individual photos, full galleries, printed albums, or video add-ons -- all available at the point of maximum excitement.",
              },
              {
                n: 5,
                title: "Instant delivery + sleeping money",
                desc: "Purchased photos are delivered instantly via WhatsApp and email. But the story does not end at checkout. Our automated sequences recover 30-40% of abandoned galleries over the following weeks with smart discounting.",
              },
            ].map((step) => (
              <SectionFadeIn key={step.n} delay={step.n * 80}>
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <StepCircle n={step.n} />
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.desc}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>

          {/* Connecting line (desktop) */}
          <div className="hidden lg:block mt-[-180px] mb-24 mx-auto max-w-[90%]">
            <div className="h-0.5 bg-gradient-to-r from-brand-400/0 via-brand-400/30 to-brand-400/0" />
          </div>
        </div>
      </section>

      {/* ──────────────── KIOSK POS ──────────────── */}
      <section className="bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Copy */}
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Point of Sale</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Kiosk POS System
              </h2>
              <p className="mt-4 text-navy-300 leading-relaxed">
                The Fotiqo kiosk is where browsing guests become paying customers. A sleek
                touchscreen experience that presents their photos in gallery-quality resolution,
                handles payments securely, and works even when the hotel Wi-Fi goes down. It is
                your 24/7 sales associate that never takes a break.
              </p>
              <p className="mt-4 text-navy-300 leading-relaxed">
                Each kiosk connects to a local network with the photographer&apos;s workstation and
                optional customer-facing TV displays. Photos transfer from camera to screen in
                seconds. Staff log in with a secure PIN, select the guest&apos;s gallery, and the
                customer takes it from there -- tapping through their memories, favoriting the ones
                they love, and paying on the spot.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: CreditCard, text: "Card + cash payments" },
                  { icon: Shield, text: "Staff PIN login" },
                  { icon: Monitor, text: "Customer-facing display" },
                  { icon: WifiOff, text: "Full offline mode" },
                  { icon: Moon, text: "Night sync to cloud" },
                  { icon: Users, text: "Multi-screen support" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5 text-sm text-navy-200">
                    <f.icon className="h-4 w-4 text-brand-400 shrink-0" />
                    {f.text}
                  </div>
                ))}
              </div>
            </SectionFadeIn>

            {/* Mockup placeholder */}
            <SectionFadeIn delay={120}>
              <div className="relative mx-auto w-full max-w-md">
                <div className="aspect-[4/3] rounded-2xl bg-navy-800 border border-navy-700/60 shadow-lift overflow-hidden flex flex-col">
                  {/* Title bar */}
                  <div className="flex items-center justify-between bg-navy-700/60 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-coral-500" />
                      <div className="h-3 w-3 rounded-full bg-gold-500" />
                      <div className="h-3 w-3 rounded-full bg-brand-400" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider text-navy-400 uppercase">Kiosk View</span>
                  </div>
                  {/* Content area */}
                  <div className="flex-1 p-5 grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-lg bg-navy-700/50 animate-pulse" />
                    ))}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between bg-navy-700/60 px-5 py-3">
                    <span className="text-xs text-navy-400">6 photos selected</span>
                    <span className="rounded-lg bg-brand-400 px-4 py-1.5 text-xs font-semibold text-white">Pay Now</span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── HOTEL CHECK-IN INTEGRATION ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Guest Onboarding</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              Hotel check-in integration
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              The revenue journey starts the moment your guest walks through the door. Fotiqo
              embeds into the arrival experience so every guest becomes a potential customer before
              they even reach their room.
            </p>
          </SectionFadeIn>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Camera,
                title: "Welcome photo at arrival",
                desc: "A photographer greets families at the Welcome Archway -- a beautifully branded photo station near reception. A professional portrait is captured in the first five minutes of their stay, creating an emotional anchor that drives purchases all week long.",
              },
              {
                icon: QrCode,
                title: "QR code handed to guest",
                desc: "Immediately after the welcome photo, the guest receives a branded QR card. Scanning it opens their personal gallery with the welcome image and a booking link for additional photo sessions during their stay. Receptionists earn a 5% commission on every booking generated through their QR.",
              },
              {
                icon: CalendarCheck,
                title: "Session booking link",
                desc: "The QR gallery page features a prominent booking calendar. Guests select a time slot and preferred photo type -- pool portraits, sunset sessions, or activity shots. The system dispatches the highest-rated available photographer automatically.",
              },
              {
                icon: Zap,
                title: "Instant gallery creation",
                desc: "The moment the photographer finishes shooting, photos upload directly from their device to the guest's gallery. The guest receives a WhatsApp notification within minutes. No waiting, no front desk visits, no friction between capture and purchase.",
              },
            ].map((item, i) => (
              <SectionFadeIn key={item.title} delay={i * 80}>
                <LightCard icon={item.icon} title={item.title} desc={item.desc} />
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PRE-ARRIVAL DIGITAL PASS ──────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Pre-Arrival Revenue</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
                Pre-arrival Digital Pass
              </h2>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Why wait until check-in to start selling? Two hours after a guest completes their
                hotel booking, Fotiqo sends an automated WhatsApp or email offering the
                Unlimited Digital Pass. The guest pays once and receives every single photo taken
                during their stay -- delivered in real time, no kiosk visit required.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Hotels love it because it removes purchase friction and increases per-guest revenue
                by up to 60%. Guests love it because they can relax and enjoy their holiday knowing
                every moment is being captured and delivered automatically. Photographers love it
                because they can focus on shooting instead of selling.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  { title: "Basic Pass", desc: "Pre-paid package of up to 20 professional photos during the stay." },
                  { title: "Unlimited Pass", desc: "Every photo from every session, delivered via WhatsApp the moment the photographer uploads." },
                  { title: "VIP Pass", desc: "Unlimited photos plus priority booking for sunset sessions, private portraits, and activity coverage." },
                ].map((pass) => (
                  <div key={pass.title} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-500">
                      <Star className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">{pass.title}</p>
                      <p className="text-sm text-navy-500">{pass.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionFadeIn>

            <SectionFadeIn delay={100}>
              <div className="rounded-2xl bg-gradient-to-br from-brand-400/5 to-gold-500/5 border border-cream-200 p-8 md:p-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-6">How it flows</p>
                <ol className="space-y-6">
                  {[
                    "Guest books hotel room through any channel.",
                    "2 hours later, automated WhatsApp message offers Digital Pass.",
                    "Guest taps link, selects pass tier, pays via Stripe.",
                    "On arrival, guest receives QR wristband linked to their pass.",
                    "Every photo taken of the guest is delivered instantly to their phone.",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white text-xs font-bold">{i + 1}</span>
                      <p className="text-sm text-navy-600 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── REVENUE DASHBOARD ──────────────── */}
      <section className="bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Business Intelligence</p>
            <h2 className="text-center font-display text-3xl md:text-4xl font-bold text-white">
              Revenue dashboard
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-300">
              Your general manager sees everything that matters in real time. Revenue per location,
              per photographer, per time period. Conversion rates from gallery views to purchases.
              Sleeping money recovered. Staff performance. All in one screen, updated live.
            </p>
          </SectionFadeIn>

          {/* Stats row */}
          <SectionFadeIn delay={100}>
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="12.4x" label="Average ROI for resort partners" />
              <Stat value="73%" label="Gallery view-to-purchase rate at kiosk" />
              <Stat value="37%" label="Sleeping money recovery rate" />
              <Stat value="4 min" label="Average upload-to-delivery time" />
            </div>
          </SectionFadeIn>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BarChart3, title: "Revenue by location", desc: "Compare photo revenue across all your properties. See which hotels outperform and identify opportunities to increase volume at underperforming locations." },
              { icon: Users, title: "Per-photographer metrics", desc: "Track individual photographer performance: galleries uploaded, conversion rates, average order value, customer ratings, and total commissions earned." },
              { icon: TrendingUp, title: "Conversion funnel", desc: "Visualize the full guest journey from gallery creation to purchase. Identify drop-off points and optimize pricing, timing, and follow-up sequences." },
              { icon: DollarSign, title: "Sleeping money tracking", desc: "See exactly how much revenue your automated sequences recover after guests leave. Track abandoned cart reminders, 7-day sweep-ups, and final-chance offers." },
              { icon: Clock, title: "Real-time sales feed", desc: "Watch transactions come in as they happen. Every kiosk sale, every online purchase, every digital pass activation appears instantly on the dashboard." },
              { icon: Target, title: "Commission payroll", desc: "Automatic commission calculations for every staff member. Photo sales, digital pass sales, QR referral bonuses, and sleeping money shares -- all computed and ready for monthly payroll." },
            ].map((card, i) => (
              <SectionFadeIn key={card.title} delay={i * 60}>
                <DarkCard icon={card.icon} title={card.title} desc={card.desc} />
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── SLEEPING MONEY ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-coral-500 mb-3 text-center">Automated Revenue</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              Sleeping money recovery
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              Most photography operations lose the sale the moment the guest walks away from the
              kiosk. Fotiqo does not. Our automated messaging sequences continue selling for
              weeks after checkout, recovering revenue that would otherwise be lost forever. We
              call it sleeping money -- and it typically adds 30-40% to your total photo revenue.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="mx-auto mt-14 max-w-3xl rounded-2xl bg-white border border-cream-200 shadow-card overflow-hidden">
              {[
                {
                  day: "Day 3",
                  title: "Gentle reminder",
                  desc: "Guest receives a WhatsApp message with one of their best photos and a friendly nudge: 'Your vacation photos are waiting.' No discount yet -- just the emotional trigger of seeing their memories.",
                  color: "bg-brand-400",
                },
                {
                  day: "Day 7",
                  title: "Discount offer",
                  desc: "If the guest bought only some photos at the kiosk, they receive an offer to unlock the remaining gallery at 50% off. If they never purchased, a 15% early-bird discount is applied. Urgency increases with a countdown timer.",
                  color: "bg-gold-500",
                },
                {
                  day: "Day 14",
                  title: "Last chance",
                  desc: "A final message warns that the gallery will expire soon. The discount deepens. The FOMO timer counts down. This stage alone converts 8-12% of remaining holdouts, adding pure profit with zero additional photography cost.",
                  color: "bg-coral-500",
                },
              ].map((step, i) => (
                <div key={step.day} className={`flex items-start gap-5 p-6 md:p-8 ${i > 0 ? "border-t border-cream-200" : ""}`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.color} text-white font-bold text-sm`}>
                    {step.day}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-navy-900">{step.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-navy-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={200}>
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <Stat value="30-40%" label="Of abandoned galleries recovered" />
              <Stat value="€0" label="Additional photography cost" />
              <Stat value="3x" label="ROI on automated sequences" />
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── MULTI-DESTINATION ──────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Scale</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
                Multi-destination management
              </h2>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Whether you manage two beach hotels or twenty international resorts, Fotiqo
                gives you a single dashboard to oversee every property. Compare performance across
                locations, transfer staff between sites, track equipment assignments, and monitor
                revenue -- all without logging into separate systems.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Each location operates independently with its own kiosk network, photographer team,
                and local storage. But the data flows upward in real time, giving headquarters a
                complete picture of the entire operation. Regional managers see their territory.
                The CEO sees everything.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, title: "20+ locations", desc: "Manage all properties from one login." },
                  { icon: RefreshCw, title: "Staff transfers", desc: "Move photographers between resorts with full history." },
                  { icon: Gauge, title: "Equipment tracking", desc: "Cameras, lenses, iPads -- know who has what." },
                  { icon: BarChart3, title: "Cross-property analytics", desc: "Compare conversion rates, revenue, and staff costs." },
                ].map((item) => (
                  <LightCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── STAFF MANAGEMENT ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Your Team</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              Staff management built for hospitality
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              Resort photography teams are seasonal, mobile, and competitive. Fotiqo gives
              you the tools to recruit, train, schedule, motivate, and retain the best photographers
              in the industry.
            </p>
          </SectionFadeIn>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Trophy, title: "Gamification & XP", desc: "Daily targets, weekly leaderboards, and milestone badges keep photographers motivated. 'Top Closer', 'Upload King', and 'Booking Machine' badges create healthy competition that directly increases revenue." },
              { icon: Award, title: "AI coaching", desc: "The system analyzes each photographer's performance and provides personalized coaching. Low conversion rate? The AI suggests sales training modules. High customer ratings? It recommends promotion to supervisor." },
              { icon: Clock, title: "Shift scheduling", desc: "Build weekly schedules by location, assign photographers to zones, and track attendance. The system considers photographer ratings and guest density to optimize coverage during peak hours." },
              { icon: TrendingUp, title: "Performance leaderboard", desc: "Real-time rankings by sales closed, galleries uploaded, conversion rate, and customer ratings. Seasonal staff who return get a loyalty bonus of up to 1,500 EUR over multiple seasons." },
              { icon: DollarSign, title: "Commission tracking", desc: "Every sale generates automatic commission calculations. Photo sales, digital pass sales, appointment bookings, QR referrals, and sleeping money shares are all tracked and ready for monthly payroll." },
              { icon: Building2, title: "Housing & costs", desc: "Track staff accommodation costs, equipment assignments, and total cost per photographer. Compare profitability across team members and make data-driven staffing decisions." },
            ].map((card, i) => (
              <SectionFadeIn key={card.title} delay={i * 60}>
                <LightCard icon={card.icon} title={card.title} desc={card.desc} />
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── WHITE-LABEL ──────────────── */}
      <section className="bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-500 mb-3">Branding</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Your hotel brand, not ours
              </h2>
              <p className="mt-4 text-navy-300 leading-relaxed">
                Every guest touchpoint carries your resort&apos;s branding. The gallery page, the
                WhatsApp messages, the kiosk interface, the printed QR cards, the email receipts --
                all customized with your logo, colors, and messaging. Your guests never see the
                Fotiqo name unless you want them to.
              </p>
              <p className="mt-4 text-navy-300 leading-relaxed">
                This is not a generic overlay. We work with your marketing team to match the exact
                look and feel of your property. Luxury beachfront resort? The gallery reflects
                that. Family-friendly water park? The branding adapts. Boutique hotel? Every detail
                is refined. The photography experience becomes an extension of your hospitality.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Palette, title: "Custom gallery theme", desc: "Logo, colors, fonts, and layout matching your property." },
                  { icon: MessageSquare, title: "Branded messages", desc: "WhatsApp and email templates in your voice." },
                  { icon: Monitor, title: "Kiosk branding", desc: "Full-screen branded experience at the point of sale." },
                  { icon: Send, title: "Custom domain", desc: "gallery.yourresort.com -- fully white-labeled." },
                ].map((item) => (
                  <DarkCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIAL ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500/10">
              <Star className="h-7 w-7 text-gold-500" />
            </div>
            <blockquote className="font-display text-2xl md:text-3xl font-semibold text-navy-900 leading-snug">
              &ldquo;Fotiqo transformed our guest photography from a cost center into our
              most profitable ancillary revenue stream. The sleeping money feature alone paid for
              the entire operation within the first quarter.&rdquo;
            </blockquote>
            <div className="mt-8">
              <p className="font-semibold text-navy-900">Karim Belhaj</p>
              <p className="text-sm text-navy-500">General Manager, Hilton Monastir Beach Resort</p>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="relative overflow-hidden bg-navy-900 py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-400/5 to-coral-500/5" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
              Ready to turn your resort into a photo revenue powerhouse?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-navy-300">
              Join the growing network of hotels and resorts using Fotiqo to capture guests,
              close sales, and recover sleeping money. Setup takes less than a week.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAPrimary href="/demo">Book a Demo for Your Resort</CTAPrimary>
              <CTAGhost href="/pricing">View Pricing</CTAGhost>
            </div>
            <p className="mt-6 text-xs text-navy-500">
              No contracts. No upfront hardware costs. Revenue share model means we only win when you do.
            </p>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
