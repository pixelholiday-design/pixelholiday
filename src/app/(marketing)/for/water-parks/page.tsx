import type { Metadata } from "next";
import {
  Camera,
  Waves,
  Smartphone,
  Monitor,
  CreditCard,
  WifiOff,
  Users,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Shield,
  Zap,
  QrCode,
  Tv,
  DollarSign,
  MapPin,
  Eye,
  RefreshCw,
  Timer,
  ScanLine,
  ImageIcon,
  Target,
  Gauge,
  Moon,
  Repeat,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Water Park Photography Solution | Fotiqo",
  description:
    "Capture the splash. Sell the memory. Purpose-built photography system for water parks, splash pads, and aquatic attractions with wristband ID, self-service kiosks, and impulse pricing.",
  keywords: [
    "water park photography",
    "aquatic attraction photos",
    "splash photography system",
    "wristband photo identification",
    "water park kiosk",
    "theme park photography",
  ],
  openGraph: {
    title: "Water Park Photography Solution | Fotiqo",
    description:
      "Capture the splash. Sell the memory. Purpose-built for water parks with wristband ID, self-service kiosks, and impulse pricing.",
    type: "website",
  },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
function StepCircle({ n }: { n: number }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white font-bold text-lg shadow-lg">
      {n}
    </span>
  );
}

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
export default function WaterParksPage() {
  return (
    <>
      {/* ──────────────── HERO ──────────────── */}
      <section className="relative overflow-hidden bg-navy-900">
        {/* Gradient + wave pattern */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-900/95 to-brand-400/10" />
        {/* CSS wave shapes */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 opacity-[0.07]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 40 C360 80 720 0 1080 40 C1260 60 1380 50 1440 40 V100 H0Z" fill="#29ABE2" />
          </svg>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 h-20 opacity-[0.05]">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 30 C480 70 960 10 1440 50 V80 H0Z" fill="#29ABE2" />
          </svg>
        </div>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-400/5 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-0 h-96 w-96 rounded-full bg-brand-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36 lg:py-44 text-center">
          <SectionFadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300 mb-6">
              <Waves className="h-3.5 w-3.5" /> For Water Parks &amp; Aquatic Attractions
            </span>
          </SectionFadeIn>

          <SectionFadeIn delay={80}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] text-white">
              Capture the splash.{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                Sell the memory.
              </span>
            </h1>
          </SectionFadeIn>

          <SectionFadeIn delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl leading-relaxed text-navy-300">
              Purpose-built photography system for water parks, splash pads, and aquatic
              attractions. From the top of the slide to the exit kiosk, every splash is a sale
              waiting to happen.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={240}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAPrimary href="/demo">See How AquaSplash Increased Revenue 300%</CTAPrimary>
              <CTAGhost href="#how-it-works">See How It Works</CTAGhost>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={320}>
            <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-navy-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> Waterproof QR wristbands</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> Self-service exit kiosks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> AI burst-mode culling</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-400" /> Works fully offline</span>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── HOW SPLASH PHOTOGRAPHY WORKS ──────────────── */}
      <section id="how-it-works" className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-center text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">The Guest Journey</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              How splash photography works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              Water park photography is fast, loud, and unpredictable. Fotiqo was designed
              from the ground up to handle the chaos -- high-speed burst shots, wet environments,
              hundreds of guests per hour, and the narrow window between excitement and exit.
            </p>
          </SectionFadeIn>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: 1,
                title: "Photographers at slides & pools",
                desc: "Your team positions at high-traffic zones: slide exits, wave pools, lazy river turns, and splash pads. Each photographer is assigned a zone and rotation schedule, ensuring full park coverage throughout the day. Weather-sealed gear handles the wet environment.",
              },
              {
                n: 2,
                title: "Burst shots with AI selection",
                desc: "Photographers fire rapid burst sequences of 5-10 frames per guest. Fotiqo's AI instantly analyzes every frame, automatically rejecting blurry shots, closed eyes, and misfires. Only the best 2-3 images from each burst are kept, saving storage and improving quality.",
              },
              {
                n: 3,
                title: "Customer finds photos via wristband",
                desc: "At the park entrance, every guest receives a waterproof QR wristband. Photographers scan it before each session. At the exit kiosk or on their phone, guests scan the same wristband to instantly see every photo taken of them throughout the day.",
              },
              {
                n: 4,
                title: "Purchase at kiosk or online",
                desc: "Self-service kiosks near the exit display all matched photos. Guests select favorites and pay by card. Impulse pricing of 8-15 EUR per photo drives high conversion at volume. For guests who leave without buying, automated WhatsApp follow-ups close the sale later.",
              },
            ].map((step) => (
              <SectionFadeIn key={step.n} delay={step.n * 80}>
                <div className="flex flex-col items-center text-center">
                  <StepCircle n={step.n} />
                  <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.desc}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── WRISTBAND IDENTIFICATION ──────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Guest Identification</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
                Wristband identification
              </h2>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Water parks present a unique challenge: guests are in swimwear, often without
                phones, and impossible to identify by name or room number. The Fotiqo
                wristband system solves this elegantly. A waterproof rubber wristband with an
                embedded QR code is handed to every guest at entry.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Before each photo session, the photographer scans the wristband with their phone.
                Every subsequent photo is automatically tagged to that guest. When the guest walks
                up to an exit kiosk and scans the same wristband, their entire day of photos
                appears on screen instantly. No account needed. No email required. No names
                exchanged. Just scan and see.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                For parks that prefer a digital approach, guests can also enter a code from their
                ticket, scan a QR poster with their phone, or use NFC tags. The system supports
                multiple identification methods simultaneously, configured per location.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Waterproof silicone wristband with UV-resistant QR",
                  "Photographer scans in under 2 seconds",
                  "No guest data collected -- fully GDPR compliant",
                  "Reusable wristbands reduce per-guest cost to under 0.10 EUR",
                  "Works alongside NFC, ticket codes, and phone-based scanning",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-brand-400 shrink-0" />
                    <p className="text-sm text-navy-600">{text}</p>
                  </div>
                ))}
              </div>
            </SectionFadeIn>

            <SectionFadeIn delay={120}>
              {/* Wristband mockup */}
              <div className="mx-auto w-full max-w-sm">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-400/10 to-brand-400/5 border border-brand-400/20 flex flex-col items-center justify-center p-10">
                  <div className="relative mb-6">
                    <div className="h-32 w-32 rounded-full border-[6px] border-brand-400/30 flex items-center justify-center">
                      <QrCode className="h-14 w-14 text-brand-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-brand-400 flex items-center justify-center shadow-lg">
                      <ScanLine className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="font-display text-lg font-bold text-navy-900">Scan wristband</p>
                  <p className="text-sm text-navy-500 text-center mt-1">See your photos instantly.<br />No account needed.</p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-navy-400">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Waterproof</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> 2s scan</span>
                    <span className="flex items-center gap-1"><Repeat className="h-3 w-3" /> Reusable</span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── ACTION SHOT TECHNOLOGY ──────────────── */}
      <section className="bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Photography Tech</p>
            <h2 className="text-center font-display text-3xl md:text-4xl font-bold text-white">
              Action shot technology
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-300">
              Water park photography demands speed and precision. Guests come flying down slides at
              40 km/h, wave pools surge unpredictably, and the perfect splash lasts a fraction of a
              second. Fotiqo is built for exactly this environment.
            </p>
          </SectionFadeIn>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Camera, title: "High-speed burst mode", desc: "Photographers capture 5-10 frames per second at slide exits and splash zones. The system handles hundreds of burst sequences per hour without slowing down. Photos transfer from camera to kiosk over local Wi-Fi in real time." },
              { icon: Eye, title: "AI auto-cull", desc: "Every burst is analyzed instantly by Fotiqo's lightweight AI model. Blurry frames, closed eyes, misfires, and duplicate near-identical shots are flagged and hidden. Guests see only the best 2-3 images from each burst -- clean, sharp, and sell-ready." },
              { icon: Zap, title: "Speed camera integration", desc: "For fixed-position capture at slide exits and ride finishes, Fotiqo integrates with Nikon D7000 speed cameras via tethered shooting. The camera fires automatically, the photo uploads instantly, and the guest sees it on the exit kiosk within seconds." },
              { icon: ImageIcon, title: "Auto-Reel generation", desc: "When burst photos are detected, the system can automatically stitch them into a 3-second looping video with music and graphic overlays. These auto-reels sell as premium add-ons at zero additional production cost." },
              { icon: Gauge, title: "Real-time upload pipeline", desc: "Photos move from camera to cloud (or local SSD) within seconds. The pipeline handles 100+ photographers uploading simultaneously. There is no batch processing delay -- the guest's gallery updates in real time as shots are captured." },
              { icon: Shield, title: "Weather-sealed workflow", desc: "The entire workflow is designed for wet environments. Waterproof camera housings, splash-proof kiosk screens, and rubberized wristbands ensure the system operates flawlessly in the most demanding aquatic conditions." },
            ].map((card, i) => (
              <SectionFadeIn key={card.title} delay={i * 60}>
                <DarkCard icon={card.icon} title={card.title} desc={card.desc} />
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── SELF-SERVICE KIOSK ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Mockup */}
            <SectionFadeIn>
              <div className="relative mx-auto w-full max-w-md">
                <div className="aspect-[3/4] rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lift overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-brand-400 px-5 py-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Welcome to AquaSplash</p>
                    <p className="text-lg font-bold text-white">Scan your wristband to see your photos</p>
                  </div>
                  {/* QR area */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-navy-600 flex items-center justify-center mb-4">
                      <QrCode className="h-12 w-12 text-navy-500" />
                    </div>
                    <p className="text-sm text-navy-400 text-center">Hold wristband to scanner</p>
                    <div className="mt-6 w-full space-y-2">
                      <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                        <div className="h-full w-2/3 rounded-full bg-brand-400 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-navy-500 text-center">Or enter code: _ _ _ _ _ _</p>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="bg-navy-800 px-5 py-3 flex items-center justify-between">
                    <span className="text-[10px] text-navy-500">Powered by Fotiqo</span>
                    <span className="text-[10px] text-navy-500">Need help? Ask staff</span>
                  </div>
                </div>
              </div>
            </SectionFadeIn>

            {/* Copy */}
            <SectionFadeIn delay={100}>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Exit Experience</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
                Self-service gallery kiosk
              </h2>
              <p className="mt-4 text-navy-600 leading-relaxed">
                The Fotiqo kiosk is positioned near the park exit, catching guests at the
                peak of their post-splash high. No staff interaction required. The guest walks up,
                scans their wristband, and sees every photo taken of them throughout the day
                displayed on a large touchscreen.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                The interface is designed for wet fingers and impatient kids. Big buttons, smooth
                scrolling, heart-to-favorite, and a single tap to purchase. Payment by card via
                Stripe Terminal is instant. The selected photos are delivered to the guest's phone
                via WhatsApp before they reach the parking lot.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                For parks with extremely high throughput, multiple kiosks can operate on a shared
                local network. Each one accesses the same photo library, so guests never have to
                wait. And because the kiosks run entirely on local Wi-Fi, there is no dependency
                on internet connectivity. Even if the park's internet goes down, sales continue
                uninterrupted.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: ScanLine, text: "Wristband or code entry" },
                  { icon: CreditCard, text: "Card payments via Stripe" },
                  { icon: Smartphone, text: "WhatsApp delivery" },
                  { icon: Users, text: "No staff required" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2.5 text-sm text-navy-700">
                    <f.icon className="h-4 w-4 text-brand-400 shrink-0" />
                    {f.text}
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── IMPULSE PRICING ──────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-coral-500 mb-3 text-center">Revenue Model</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              Impulse pricing for high volume
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              Water park photography is a volume game. Unlike resort photography where a single
              family might spend 100 EUR on a curated gallery, water parks convert hundreds of
              guests per day at lower price points. The math is simple but powerful.
            </p>
          </SectionFadeIn>

          {/* Revenue calculator */}
          <SectionFadeIn delay={100}>
            <div className="mx-auto mt-14 max-w-2xl rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 border border-navy-700/60 p-8 md:p-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-6">Daily revenue potential</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-display text-3xl md:text-4xl font-bold text-white">500</p>
                  <p className="text-xs text-navy-400 mt-1">guests photographed per day</p>
                </div>
                <div>
                  <p className="font-display text-3xl md:text-4xl font-bold text-brand-400">x</p>
                  <p className="text-xs text-navy-400 mt-1">&nbsp;</p>
                </div>
                <div>
                  <p className="font-display text-3xl md:text-4xl font-bold text-white">10 EUR</p>
                  <p className="text-xs text-navy-400 mt-1">average per photo</p>
                </div>
              </div>
              <div className="mt-6 border-t border-navy-700/60 pt-6">
                <p className="font-display text-4xl md:text-5xl font-bold text-brand-400">5,000 EUR/day</p>
                <p className="text-sm text-navy-300 mt-2">potential daily revenue</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-navy-400">
                <div>
                  <p className="font-semibold text-white text-base">35,000</p>
                  <p>EUR per week</p>
                </div>
                <div>
                  <p className="font-semibold text-white text-base">150,000</p>
                  <p>EUR per month</p>
                </div>
                <div>
                  <p className="font-semibold text-white text-base">900,000</p>
                  <p>EUR per 6-month season</p>
                </div>
              </div>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={200}>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { icon: DollarSign, title: "8-15 EUR per photo", desc: "Low enough to be an impulse purchase. High enough to generate serious revenue at volume. Guests barely hesitate at these price points, especially when the photo shows their kid screaming down a waterslide." },
                { icon: Target, title: "40-60% conversion rate", desc: "When guests see themselves on screen at the exit kiosk, the conversion rate is dramatically higher than online-only models. The emotional connection is immediate and the purchase friction is minimal." },
                { icon: TrendingUp, title: "Sleeping money adds 30%", desc: "Guests who walk past the kiosk still receive automated WhatsApp follow-ups. Gentle reminders on day 3, discount offers on day 7, and a final FOMO push on day 14 recover an additional 30% of abandoned sales." },
              ].map((card, i) => (
                <LightCard key={card.title} icon={card.icon} title={card.title} desc={card.desc} />
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── TEAM ROTATION ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Operations</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900">
                Team rotation across zones
              </h2>
              <p className="mt-4 text-navy-600 leading-relaxed">
                A water park has distinct zones with wildly different traffic patterns. The slide
                towers see surges during afternoon peak. The wave pool draws crowds in the morning.
                The kids splash pad is busy all day. The lazy river has slow but steady traffic.
                Fotiqo's shift management ensures fair distribution and optimal coverage.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Supervisors assign photographers to zones on a rotating schedule. The system tracks
                performance by zone, so you know which positions generate the most revenue and
                which need better photographers. Peak hours get more staff. Quiet zones get fewer.
                The AI suggests optimal rotations based on historical data and current attendance.
              </p>
              <p className="mt-4 text-navy-600 leading-relaxed">
                Every photographer's performance is tracked individually: number of sessions shot,
                burst-to-best ratio, customer conversion rate, and average order value per zone.
                The gamification system awards XP and badges for hitting targets, keeping your
                seasonal team motivated through the long summer months.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={100}>
              <div className="space-y-4">
                {[
                  { zone: "Slide Towers", photographers: 3, peak: "2-5 PM", revenue: "High" },
                  { zone: "Wave Pool", photographers: 2, peak: "10 AM-1 PM", revenue: "Medium" },
                  { zone: "Kids Splash Pad", photographers: 2, peak: "All day", revenue: "High" },
                  { zone: "Lazy River", photographers: 1, peak: "3-6 PM", revenue: "Low" },
                  { zone: "Main Entrance", photographers: 1, peak: "Opening hour", revenue: "Medium" },
                ].map((zone) => (
                  <div key={zone.zone} className="rounded-xl bg-white border border-cream-200 p-4 shadow-card flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-navy-900">{zone.zone}</p>
                      <p className="text-xs text-navy-500">Peak: {zone.peak}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand-400">{zone.photographers} photographers</p>
                      <p className="text-xs text-navy-400">Revenue: {zone.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── OFFLINE MODE ──────────────── */}
      <section className="bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionFadeIn delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: WifiOff, title: "No internet needed", desc: "Kiosks, cameras, and photographer devices connect via closed local network. Zero dependency on park Wi-Fi." },
                  { icon: Moon, title: "Night sync", desc: "When the park closes, the system syncs all transactions, photos, and analytics to the cloud over any available connection." },
                  { icon: Shield, title: "Local SSD storage", desc: "Photos are stored on a local solid-state drive at the kiosk station. Fast read/write, no cloud latency, no streaming delays." },
                  { icon: RefreshCw, title: "Automatic recovery", desc: "If a kiosk loses power or connection, it resumes exactly where it left off. No data loss, no orphaned transactions." },
                ].map((item) => (
                  <DarkCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
                ))}
              </div>
            </SectionFadeIn>

            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Infrastructure</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
                Offline mode: built for the real world
              </h2>
              <p className="mt-4 text-navy-300 leading-relaxed">
                Water parks are notoriously bad Wi-Fi environments. Concrete structures, metal
                reinforcement, water interference, and thousands of guest devices competing for
                bandwidth make cloud-dependent systems unreliable. Fotiqo does not rely on
                the internet for any critical operation.
              </p>
              <p className="mt-4 text-navy-300 leading-relaxed">
                The entire photography workflow -- from camera capture to kiosk display to payment
                processing -- runs on a dedicated local network. A simple Wi-Fi router connects
                the photographer&apos;s device, the kiosk touchscreen, and the local storage drive.
                Photos transfer at LAN speed. Payments process through the Stripe Terminal hardware
                with offline transaction queuing.
              </p>
              <p className="mt-4 text-navy-300 leading-relaxed">
                At the end of the day -- or whenever a stable internet connection becomes available
                -- the system silently synchronizes everything to the cloud. Transactions,
                analytics, photos, and customer data all upload in the background. The next morning,
                your dashboard in the head office is fully up to date.
              </p>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ──────────────── REAL-TIME TV DISPLAY ──────────────── */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Marketing</p>
            <h2 className="heading text-center font-display text-3xl md:text-4xl font-bold text-navy-900">
              Real-time TV display
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-navy-500">
              Strategically placed screens around the park cycle through the day&apos;s best action
              shots. Guests see themselves on the big screen and immediately want to buy. It is
              the most effective sales driver in the entire system -- a constant, ambient
              advertisement powered by the photos your team is already taking.
            </p>
          </SectionFadeIn>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Tv, title: "Auto-curated slideshow", desc: "The best-rated photos from the day cycle on screen every 5 seconds. The system selects high-energy action shots with clear faces for maximum emotional impact." },
              { icon: MapPin, title: "Strategic placement", desc: "Screens near food courts, changing rooms, and exit paths catch guests during natural pause points. Each screen can show location-specific photos from nearby zones." },
              { icon: QrCode, title: "QR overlay on screen", desc: "Each displayed photo includes a QR code overlay. Guests scan it to go directly to their gallery, bypassing the kiosk queue during peak hours." },
              { icon: BarChart3, title: "Drives kiosk traffic", desc: "Parks using the TV display system report 40-60% higher kiosk traffic compared to those relying on signage alone. Seeing your own photo on a big screen is an irresistible purchase trigger." },
            ].map((card, i) => (
              <SectionFadeIn key={card.title} delay={i * 80}>
                <LightCard icon={card.icon} title={card.title} desc={card.desc} />
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── TESTIMONIAL ──────────────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/10">
              <Star className="h-7 w-7 text-brand-400" />
            </div>
            <blockquote className="font-display text-2xl md:text-3xl font-semibold text-navy-900 leading-snug">
              &ldquo;We went from selling 50 photos a day with a manual system to over 400 daily
              sales with Fotiqo. The wristband system eliminated the biggest friction point
              and the self-service kiosks freed up our staff entirely. Revenue tripled in the
              first season.&rdquo;
            </blockquote>
            <div className="mt-8">
              <p className="font-semibold text-navy-900">Mehdi Trabelsi</p>
              <p className="text-sm text-navy-500">Operations Director, AquaSplash Hammamet</p>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── STATS ROW ──────────────── */}
      <section className="bg-cream-100 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <SectionFadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <Stat value="300%" label="Revenue increase at partner parks" />
              <Stat value="2s" label="Wristband scan time" />
              <Stat value="500+" label="Daily guest photos processed" />
              <Stat value="0" label="Internet dependency for kiosk sales" />
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ──────────────── FINAL CTA ──────────────── */}
      <section className="relative overflow-hidden bg-navy-900 py-24 md:py-32">
        {/* Wave decoration */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-16 opacity-[0.06]">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 20 C360 50 720 0 1080 30 C1260 40 1380 35 1440 30 V0 H0Z" fill="#29ABE2" />
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-400/5 to-coral-500/5" />

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
              Ready to turn every splash into revenue?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-navy-300">
              See how AquaSplash increased their photo revenue by 300% in a single season with
              Fotiqo. Self-service kiosks, wristband identification, and impulse pricing
              designed for water parks.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <CTAPrimary href="/demo">See How AquaSplash Increased Revenue 300%</CTAPrimary>
              <CTAGhost href="/pricing">View Pricing</CTAGhost>
            </div>
            <p className="mt-6 text-xs text-navy-500">
              No contracts. Revenue share model. We grow when your park grows.
            </p>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
