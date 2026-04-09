import { Metadata } from "next";
import {
  Camera,
  QrCode,
  Monitor,
  Gift,
  Users,
  CalendarDays,
  TreePine,
  Fish,
  Landmark,
  Mountain,
  Snowflake,
  Zap,
  ShieldCheck,
  BarChart3,
  Check,
  Cpu,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Fotiqo for Attractions — Automated Photo Sales for Zoos, Theme Parks & Aquariums",
  description:
    "Turn every visitor into a photo buyer. Automated camera stations, QR delivery, and self-service kiosks for zoos, theme parks, aquariums, museums, safari lodges, and ski resorts.",
  openGraph: {
    title: "Fotiqo for Attractions",
    description:
      "Automated photo capture and sales for zoos, theme parks, aquariums, and more. No photographer needed at every station.",
  },
};

/* ─────────── data ─────────── */

const steps = [
  {
    icon: Camera,
    title: "Capture at key spots",
    description:
      "Install camera stations at roller coaster exits, animal encounters, aquarium tunnels, and scenic viewpoints. Photos are taken automatically or by roaming photographers.",
  },
  {
    icon: QrCode,
    title: "Visitor scans QR",
    description:
      "At the exit or throughout the park, visitors scan a QR code on their wristband, ticket, or a printed sign. They instantly see their photos in a private gallery.",
  },
  {
    icon: Monitor,
    title: "Browse & buy at the gift shop",
    description:
      "Self-service kiosks in the gift shop let visitors browse, select favorites, and purchase prints, magnets, and digital downloads before they leave.",
  },
];

const kioskFeatures = [
  "Browse all photos from the day",
  "Select favorites with one tap",
  "Pay by card or contactless",
  "Print souvenirs on the spot",
  "Email digital gallery link",
  "Upsell bundles automatically",
];

const souvenirProducts = [
  { name: "Photo magnets", description: "Fridge magnets printed in seconds. The number one impulse buy at gift shops." },
  { name: "Keychains", description: "Custom photo keychains that visitors take home and show to everyone." },
  { name: "Snow globes", description: "Premium keepsake with the visitor's photo embedded inside. High-margin upsell." },
  { name: "Mugs & bottles", description: "Sublimation-printed mugs and water bottles ready in under a minute." },
  { name: "Canvas prints", description: "Gallery-quality canvas prints shipped to the visitor's home after the visit." },
  { name: "Photo books", description: "AI-compiled highlight books from the full day's adventure. Shipped globally." },
];

const useCases = [
  {
    icon: TreePine,
    title: "Zoos",
    description: "Animal encounter stations, feeding experiences, and entry archway photos. Families love reliving the moment they met the giraffes.",
  },
  {
    icon: Zap,
    title: "Theme parks",
    description: "Ride exit cameras, character meet-and-greets, and splash zone shots. Capture the scream, sell the memory.",
  },
  {
    icon: Fish,
    title: "Aquariums",
    description: "Tunnel walkthrough cameras, touch pool stations, and shark tank selfie spots. The blue glow makes every photo magical.",
  },
  {
    icon: Landmark,
    title: "Museums",
    description: "Exhibit photo stations, interactive display captures, and guided tour group shots. Culture meets commerce.",
  },
  {
    icon: Mountain,
    title: "Safari lodges",
    description: "Game drive cameras mounted on vehicles, watering hole stations, and bush dinner captures. Once-in-a-lifetime moments, sold instantly.",
  },
  {
    icon: Snowflake,
    title: "Ski resorts",
    description: "Slope action cameras, chairlift stations, and apr\u00e8s-ski portrait spots. Powder turns look incredible on a fridge magnet.",
  },
];

const cameraStationFeatures = [
  {
    icon: Cpu,
    title: "Raspberry Pi + DSLR",
    description: "Low-cost Raspberry Pi units paired with DSLRs or high-quality fixed cameras at viewing points. Fully automated trigger via motion sensor or manual button.",
  },
  {
    icon: Zap,
    title: "Instant upload",
    description: "Photos transfer to the cloud within seconds over Wi-Fi or local network. Visitors see their images before they reach the gift shop.",
  },
  {
    icon: ShieldCheck,
    title: "No photographer needed",
    description: "Automated stations run 24/7 during operating hours. No staffing costs at fixed locations. Reserve your photographers for roaming and premium experiences.",
  },
  {
    icon: BarChart3,
    title: "Analytics per station",
    description: "Track captures, views, and conversion rates per camera station. Know which spots generate the most revenue and optimize placement.",
  },
];

/* ─────────── page ─────────── */

export default function AttractionsPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-navy-900 pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-brand-400/10 blur-[160px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <SectionFadeIn>
            <span className="inline-block rounded-full bg-brand-400/15 px-4 py-1.5 text-sm font-medium text-brand-300 mb-6">
              For Zoos, Theme Parks, Aquariums & More
            </span>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-balance">
              Every visitor is a photographer.{" "}
              <span className="text-brand-300">Make every photo a sale.</span>
            </h1>
          </SectionFadeIn>

          <SectionFadeIn delay={200}>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Automated camera stations, QR-based delivery, and self-service kiosks
              that turn foot traffic into photo revenue — without adding headcount.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary href="/contact">Book a Demo for Your Attraction</CTAPrimary>
              <CTAGhost href="#how-it-works">See How It Works</CTAGhost>
            </div>
          </SectionFadeIn>

          {/* trust badges */}
          <SectionFadeIn delay={400}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-300" /> No upfront hardware costs</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-300" /> Works with existing cameras</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-brand-300" /> Revenue from day one</span>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">The visitor journey</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              How it works at attractions
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-16">
              Three touchpoints, zero friction. From the moment a visitor enters to the moment they leave with a souvenir in hand.
            </p>
          </SectionFadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <SectionFadeIn key={step.title} delay={i * 120}>
                <div className="relative bg-white rounded-2xl p-8 shadow-card h-full">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-brand-400/10 text-brand-400 mb-6">
                    <step.icon className="w-7 h-7" />
                  </div>
                  <span className="absolute top-6 right-6 text-5xl font-display font-bold text-navy-100/60">{i + 1}</span>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                  <p className="text-navy-400 leading-relaxed">{step.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMERA STATION SETUP ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Hardware</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Camera station setup
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-8">
                Deploy low-cost camera stations at your highest-traffic spots. A Raspberry Pi controller paired with a DSLR or fixed camera captures every visitor automatically — triggered by motion sensors, timed intervals, or a simple button press. No photographer needed at fixed stations.
              </p>
              <p className="text-navy-400 leading-relaxed">
                Roller coaster exits, aquarium tunnel walkways, animal encounter zones, and scenic overlooks become automated revenue generators. Each station uploads photos to the cloud instantly, tagging them with a timestamp and station ID for easy visitor matching.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="grid sm:grid-cols-2 gap-5">
                {cameraStationFeatures.map((f) => (
                  <div key={f.title} className="bg-cream-100 rounded-xl p-6">
                    <f.icon className="w-6 h-6 text-brand-400 mb-3" />
                    <h4 className="font-bold text-navy-900 mb-1.5">{f.title}</h4>
                    <p className="text-sm text-navy-400 leading-relaxed">{f.description}</p>
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── QR-BASED PHOTO DELIVERY ── */}
      <section className="bg-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn delay={100}>
              <div className="relative bg-navy-800 rounded-2xl p-10 border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand-400/15 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-brand-300" />
                  </div>
                  <div>
                    <p className="text-sm text-brand-300 font-medium">Scan to view your photos</p>
                    <p className="text-white/50 text-sm">Station #12 — Shark Tunnel</p>
                  </div>
                </div>
                {/* simulated gallery preview */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg bg-gradient-to-br from-brand-400/20 to-navy-700" />
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="flex-1 bg-coral-500 rounded-lg py-3 text-center text-white font-semibold text-sm">Buy All  6 Photos</div>
                  <div className="flex-1 bg-white/10 rounded-lg py-3 text-center text-white/70 text-sm">Select Favorites</div>
                </div>
              </div>
            </SectionFadeIn>

            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-300 mb-3">Delivery</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                QR-based photo delivery
              </h2>
              <p className="text-lg text-white/60 leading-relaxed mb-6">
                Visitors scan a QR code on their wristband, ticket, or a sign at the exit. They enter their email address and instantly receive a link to their private photo gallery — no app download, no account creation, no friction.
              </p>
              <ul className="space-y-4">
                {[
                  "Works with existing tickets, wristbands, or printed QR signs",
                  "Gallery link delivered by email and SMS within 30 seconds",
                  "Watermarked previews drive purchases — no freebies leak out",
                  "Visitors can share the gallery link with their group",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/70">
                    <Check className="w-5 h-5 text-brand-300 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── SELF-SERVICE KIOSK ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Gift shop</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Self-service kiosk at the gift shop
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-8">
                Place a touchscreen kiosk near the exit or in the gift shop. Visitors scan their wristband or enter their code, browse all their photos from the day, select favorites, and pay by card or contactless. Prints are produced on the spot. Digital galleries are emailed instantly.
              </p>
              <p className="text-navy-400 leading-relaxed">
                The kiosk handles everything: photo browsing, favorite selection, product configuration, payment, and receipt — all without staff involvement. Your team focuses on premium roaming photography while the kiosk handles volume.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <h4 className="font-bold text-navy-900 mb-5">Kiosk capabilities</h4>
                <div className="grid grid-cols-2 gap-4">
                  {kioskFeatures.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-navy-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── SOUVENIR PRODUCTS ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Merchandise</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              Souvenir products
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-16">
              Turn photos into physical keepsakes. Printed on-site for instant gratification, or shipped globally for premium products. Every item is pure profit margin.
            </p>
          </SectionFadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {souvenirProducts.map((product, i) => (
              <SectionFadeIn key={product.name} delay={i * 80}>
                <div className="bg-cream-100 rounded-xl p-7 h-full">
                  <Gift className="w-6 h-6 text-coral-500 mb-4" />
                  <h4 className="font-bold text-navy-900 mb-2">{product.name}</h4>
                  <p className="text-sm text-navy-400 leading-relaxed">{product.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── GROUP & SCHOOL PACKAGES ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn delay={100}>
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <Users className="w-8 h-8 text-brand-400 mb-5" />
                <h4 className="font-bold text-navy-900 text-lg mb-3">Example: School field trip</h4>
                <div className="space-y-3 text-sm text-navy-500">
                  <div className="flex justify-between py-2 border-b border-navy-100">
                    <span>Group size</span>
                    <span className="font-medium text-navy-900">32 students + 4 teachers</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-navy-100">
                    <span>Photos captured</span>
                    <span className="font-medium text-navy-900">240 photos</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-navy-100">
                    <span>Gallery access</span>
                    <span className="font-medium text-navy-900">1 shared link to teacher</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-navy-100">
                    <span>Pricing</span>
                    <span className="font-medium text-navy-900">Bulk rate per student</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Parents can</span>
                    <span className="font-medium text-navy-900">Buy individual photos from link</span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>

            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Groups</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Group & school packages
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                School field trips, corporate outings, birthday parties, and tour groups all get a single shared gallery. The organizer receives the link and distributes it to the group. Parents or participants can then browse and purchase their own photos individually.
              </p>
              <ul className="space-y-3">
                {[
                  "One gallery per group — no confusion, no overlap",
                  "Bulk pricing with automatic discounts for large groups",
                  "Teacher or organizer receives the master gallery link",
                  "Individual parents buy their child's photos from the shared gallery",
                  "Corporate groups get branded digital downloads",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-navy-500">
                    <Check className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── ANNUAL PASS INTEGRATION ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Loyalty</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Annual pass integration
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                Regular visitors with annual passes accumulate photos across every visit. Their personal gallery grows over the year, becoming a visual diary of every trip. At the end of the year, Fotiqo generates an AI-compiled highlight reel — a &quot;Year in Review&quot; video and photo book that annual pass holders love.
              </p>
              <ul className="space-y-3">
                {[
                  "Photos from every visit, automatically linked to the same account",
                  "Persistent gallery that grows with each trip",
                  "\"Year in Review\" AI highlight reel — video + photo book",
                  "Exclusive discounts for annual pass holders on prints and products",
                  "Automated birthday and anniversary photo reminders",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-navy-500">
                    <Check className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="bg-gradient-to-br from-brand-400/10 to-brand-400/5 rounded-2xl p-8 border border-brand-200">
                <CalendarDays className="w-8 h-8 text-brand-400 mb-5" />
                <h4 className="font-bold text-navy-900 text-lg mb-4">Year in Review</h4>
                <p className="text-navy-400 text-sm leading-relaxed mb-6">
                  At the end of the membership year, every annual pass holder receives a personalized AI-generated highlight reel compiled from their best photos across all visits.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-2xl font-display font-bold text-navy-900">12</p>
                    <p className="text-xs text-navy-400 mt-1">Visits</p>
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-2xl font-display font-bold text-navy-900">847</p>
                    <p className="text-xs text-navy-400 mt-1">Photos</p>
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 text-center shadow-sm">
                    <p className="text-2xl font-display font-bold text-navy-900">1</p>
                    <p className="text-xs text-navy-400 mt-1">Highlight reel</p>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── USE CASES GRID ── */}
      <section className="bg-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300 mb-3 text-center">Built for every venue</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              One platform, every attraction
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto text-center mb-16">
              Whether you run a zoo, theme park, aquarium, or ski resort — Fotiqo adapts to your venue and your visitors.
            </p>
          </SectionFadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc, i) => (
              <SectionFadeIn key={uc.title} delay={i * 80}>
                <div className="bg-navy-800 rounded-xl p-7 border border-white/5 h-full hover:border-brand-400/30 transition-colors">
                  <uc.icon className="w-7 h-7 text-brand-300 mb-4" />
                  <h4 className="font-bold text-white mb-2">{uc.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{uc.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVENUE MODEL ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Zero risk, pure upside
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto mb-12">
              No monthly fees. No hardware costs. Fotiqo takes a small commission on each sale. You only pay when you make money.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={150}>
            <div className="bg-white rounded-2xl shadow-card p-10 max-w-lg mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="text-5xl font-display font-bold text-navy-900">2%</span>
                <span className="text-left text-navy-400 text-sm leading-tight">commission<br/>per sale</span>
              </div>
              <div className="space-y-3 text-left">
                {[
                  "No setup fees — we help you get started",
                  "No monthly subscription",
                  "Hardware provided or use your own",
                  "We handle all software, hosting, and updates",
                  "Cancel anytime — no lock-in contracts",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-navy-600">
                    <Check className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Turn every visitor into a customer
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
              Join zoos, theme parks, aquariums, and attractions worldwide that use Fotiqo to capture memories and generate revenue automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary href="/contact">Book a Demo for Your Attraction</CTAPrimary>
              <CTAGhost href="/pricing">See Pricing</CTAGhost>
            </div>
            <p className="mt-8 text-sm text-white/40">
              Free setup. No monthly fees. Revenue from day one.
            </p>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
