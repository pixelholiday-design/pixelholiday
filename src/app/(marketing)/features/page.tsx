import type { Metadata } from "next";
import {
  Images,
  Heart,
  Download,
  Timer,
  Link2,
  Smartphone,
  ShoppingBag,
  Printer,
  BookOpen,
  Gift,
  Tag,
  Palette,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  ListChecks,
  MessageSquare,
  ClipboardList,
  Globe,
  Paintbrush,
  FileText,
  Search,
  Layout,
  Code,
  BarChart3,
  Brain,
  TrendingUp,
  Users,
  Wallet,
  Package,
  MapPin,
  Star,
  UserSearch,
  Shield,
  Handshake,
  Monitor,
  DollarSign,
  Wifi,
  WifiOff,
  Hotel,
  Send,
  Moon,
  Building2,
  Sparkles,
  ScanFace,
  Clapperboard,
  Wand2,
  Lightbulb,
  Rocket,
  Camera,
  Check,
  ArrowRight,
} from "lucide-react";
import SectionFadeIn from "../_components/SectionFadeIn";
import { CTAPrimary } from "../_components/CTAButton";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Features  — Fotiqo Photography Platform",
  description:
    "Explore every tool your photography business needs: client galleries, online store, booking system, website builder, studio manager, marketplace, resort operations, AI and automation.",
};

/* ─── Feature card data type ─── */
interface FeatureCard {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/* ─── Category data type ─── */
interface FeatureCategory {
  id: string;
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
  cards: FeatureCard[];
}

/* ─── All 8 categories ─── */
const CATEGORIES: FeatureCategory[] = [
  {
    id: "galleries",
    icon: Images,
    label: "Client Galleries",
    title: "Galleries that delight your clients",
    desc: "Deliver photos in stunning, password-free galleries. Clients browse, favorite, and purchase -- all in one beautiful experience designed to make every memory feel premium.",
    cards: [
      {
        icon: Shield,
        title: "Server-side watermarks",
        desc: "Invisible until paid. Cloudinary-powered watermarks that cannot be removed or screenshotted.",
      },
      {
        icon: Heart,
        title: "Favorites system",
        desc: "Clients tap to heart their favorite shots. Filter by favorites to build the perfect selection.",
      },
      {
        icon: Download,
        title: "Download & ZIP",
        desc: "One-click download for individual photos or a full gallery ZIP, generated serverlessly.",
      },
      {
        icon: Timer,
        title: "FOMO countdown",
        desc: "A gentle urgency timer reminds clients their gallery has a limited window -- boosting conversions.",
      },
      {
        icon: Link2,
        title: "Magic links",
        desc: "No passwords, no accounts. A single secure link gives clients instant access to their gallery.",
      },
      {
        icon: Smartphone,
        title: "Mobile-first design",
        desc: "Galleries look stunning on every device. Masonry layout adapts beautifully from phone to desktop.",
      },
    ],
  },
  {
    id: "store",
    icon: ShoppingBag,
    label: "Online Store",
    title: "A built-in store that sells for you",
    desc: "Offer prints, canvas, albums, gifts, and souvenirs directly from your galleries. Auto-fulfilled by world-class print labs. You set the price, you keep the markup.",
    cards: [
      {
        icon: Palette,
        title: "150+ products",
        desc: "Prints, canvas wraps, metal prints, phone cases, mugs, keychains, and more -- all from your gallery.",
      },
      {
        icon: Printer,
        title: "Prodigi & Printful labs",
        desc: "Auto-fulfilled by global print labs. No inventory, no shipping headaches. They handle it all.",
      },
      {
        icon: BookOpen,
        title: "Photo book builder",
        desc: "Clients design their own luxury photo books with drag-and-drop. A high-margin upsell that practically sells itself.",
      },
      {
        icon: Gift,
        title: "Gift cards",
        desc: "Let clients purchase gift cards redeemable against any gallery or product in your store.",
      },
      {
        icon: Tag,
        title: "Custom pricing",
        desc: "Set your own retail prices per product. Full control over your margins and brand positioning.",
      },
      {
        icon: DollarSign,
        title: "Commission-free on direct",
        desc: "Sales from your own website pay zero marketplace fee. You keep every cent of your markup.",
      },
    ],
  },
  {
    id: "booking",
    icon: CalendarCheck,
    label: "Booking System",
    title: "Let clients book you in seconds",
    desc: "A Bokun-style instant booking system: packages, calendar availability, deposits, add-ons, and automated confirmations -- all without a single phone call.",
    cards: [
      {
        icon: Package,
        title: "Photography packages",
        desc: "Create tiered packages with descriptions, durations, pricing, and beautiful presentation.",
      },
      {
        icon: CalendarDays,
        title: "Calendar management",
        desc: "Real-time availability calendar. Block off dates, set working hours, manage multiple locations.",
      },
      {
        icon: CreditCard,
        title: "Deposits & payments",
        desc: "Collect deposits or full payment at booking. Stripe-powered for secure, instant processing.",
      },
      {
        icon: ListChecks,
        title: "Add-ons & extras",
        desc: "Offer add-ons like extra hours, second shooter, drone coverage, or rush delivery at checkout.",
      },
      {
        icon: ClipboardList,
        title: "Pre-session questionnaires",
        desc: "Gather preferences, locations, outfit details, and special requests before the shoot.",
      },
      {
        icon: MessageSquare,
        title: "WhatsApp & email confirmation",
        desc: "Automated booking confirmations and reminders via WhatsApp and email. Zero admin effort.",
      },
    ],
  },
  {
    id: "website",
    icon: Globe,
    label: "Website Builder",
    title: "Your dream website, built in minutes",
    desc: "Choose from 6 stunning themes. Customize everything. Showcase your portfolio, blog, accept bookings, and sell prints -- all under your own custom domain.",
    cards: [
      {
        icon: Paintbrush,
        title: "6 curated themes",
        desc: "Minimalist, bold, editorial, dark, light, and classic. Each one designed specifically for photographers.",
      },
      {
        icon: Globe,
        title: "Custom domain",
        desc: "Connect your own domain (yourname.com) for a fully branded experience. SSL included.",
      },
      {
        icon: Camera,
        title: "Portfolio showcase",
        desc: "Display your best work in stunning gallery layouts. Organize by category, project, or location.",
      },
      {
        icon: FileText,
        title: "Built-in blog",
        desc: "Share session stories, photography tips, and behind-the-scenes content. AI writing assistance included.",
      },
      {
        icon: Search,
        title: "SEO optimized",
        desc: "Automatic sitemap, meta tags, schema markup, and performance optimization for search engines.",
      },
      {
        icon: Code,
        title: "Booking widget embed",
        desc: "Embed your booking calendar anywhere on your site with a single line of code. Seamless integration.",
      },
    ],
  },
  {
    id: "manager",
    icon: BarChart3,
    label: "Studio Manager",
    title: "Run your entire studio from one dashboard",
    desc: "Track revenue, manage staff, handle payroll, monitor equipment, and get AI-powered insights -- all from a single, beautiful dashboard.",
    cards: [
      {
        icon: TrendingUp,
        title: "Revenue analytics",
        desc: "Track earnings by gallery, location, product type, and time period. Spot trends instantly.",
      },
      {
        icon: Brain,
        title: "AI daily briefing",
        desc: "Start each day with an AI summary of what matters: bookings, revenue changes, and action items.",
      },
      {
        icon: Users,
        title: "Staff management",
        desc: "Assign shifts, track performance, manage transfers between locations. Gamification and XP system.",
      },
      {
        icon: Wallet,
        title: "Payroll & commissions",
        desc: "Automatic commission calculations per sale type. Monthly payroll reports. One-click payout.",
      },
      {
        icon: Package,
        title: "Equipment tracking",
        desc: "Track cameras, lenses, iPads, and kiosks. Assign to staff. Monitor costs and maintenance status.",
      },
      {
        icon: BarChart3,
        title: "Conversion tracking",
        desc: "See gallery-to-sale conversion rates per photographer. Flag low performers for coaching.",
      },
    ],
  },
  {
    id: "marketplace",
    icon: MapPin,
    label: "Marketplace",
    title: "Get discovered by clients worldwide",
    desc: "Join the Fotiqo marketplace where travelers and locals find and book photographers instantly. Build your reputation with reviews and climb the rankings.",
    cards: [
      {
        icon: UserSearch,
        title: "Photographer profiles",
        desc: "Showcase your style, experience, pricing, and portfolio. Verified badges for top-rated pros.",
      },
      {
        icon: MapPin,
        title: "Search by location",
        desc: "Clients find you by destination, date, and photography specialty. Perfect for travel photographers.",
      },
      {
        icon: Star,
        title: "Reviews & ratings",
        desc: "Build social proof with verified client reviews. Higher ratings mean more visibility in search.",
      },
      {
        icon: CalendarCheck,
        title: "Instant booking",
        desc: "Clients see your live availability and book in seconds. No back-and-forth messaging required.",
      },
      {
        icon: Shield,
        title: "Secure payments",
        desc: "Stripe-powered escrow protects both you and the client. Funds released after delivery.",
      },
      {
        icon: Handshake,
        title: "0% fee on direct clients",
        desc: "Only marketplace-sourced bookings pay 10%. Clients from your own website? Zero platform fee.",
      },
    ],
  },
  {
    id: "resort",
    icon: Monitor,
    label: "Resort Operations",
    title: "Purpose-built for on-site photography",
    desc: "Kiosk POS, cash management, wristband identification, offline mode, hotel integration, and automated post-trip recovery sales. Everything a resort photography operation needs.",
    cards: [
      {
        icon: Monitor,
        title: "Kiosk POS",
        desc: "Dedicated iPad and touchscreen app with luxury presentation mode. Stripe Terminal card reader included.",
      },
      {
        icon: DollarSign,
        title: "Cash & card payments",
        desc: "Accept cash with staff PIN tracking or card via Stripe Terminal. Full audit trail for every transaction.",
      },
      {
        icon: WifiOff,
        title: "Offline mode",
        desc: "Kiosks work without internet on local Wi-Fi. Night sync uploads transactions when connection is stable.",
      },
      {
        icon: Layout,
        title: "Wristband & QR ID",
        desc: "Waterproof QR wristbands auto-tag photos to guests. Scan at kiosk to see only their images.",
      },
      {
        icon: Hotel,
        title: "Hotel integration",
        desc: "QR codes in rooms, at reception, and in lobbies. Receptionist referral commissions built in.",
      },
      {
        icon: Send,
        title: "WhatsApp delivery",
        desc: "Instant gallery links via WhatsApp after the shoot. Hook image drives guests back to the kiosk.",
      },
      {
        icon: Moon,
        title: "Sleeping money recovery",
        desc: "Automated post-trip discounts recover revenue from partial purchases and abandoned carts.",
      },
      {
        icon: Building2,
        title: "Multi-location",
        desc: "Manage hotels, water parks, and attractions from one dashboard. Per-location analytics and staff.",
      },
    ],
  },
  {
    id: "ai",
    icon: Sparkles,
    label: "AI & Automation",
    title: "AI that works while you sleep",
    desc: "From auto-culling blurry shots to generating video reels and recovering abandoned carts -- our AI handles the tedious work so you can focus on creating.",
    cards: [
      {
        icon: ScanFace,
        title: "Auto-cull",
        desc: "AI rejects eyes-closed, blurry, and misfire shots before they reach the gallery. Saves storage and time.",
      },
      {
        icon: ScanFace,
        title: "Face recognition",
        desc: "Guests take a selfie and instantly find all their photos across the entire event. GDPR-compliant.",
      },
      {
        icon: Camera,
        title: "Burst detection",
        desc: "AI detects rapid-fire sequences and selects the best frame. Never deliver 10 nearly identical shots.",
      },
      {
        icon: Clapperboard,
        title: "Auto-reels",
        desc: "Burst photos are auto-stitched into looping video reels with music and graphic overlays.",
      },
      {
        icon: Wand2,
        title: "Magic Shots AR",
        desc: "Add 3D characters, AR effects, and background replacements to any photo. Zero production cost upsell.",
      },
      {
        icon: Lightbulb,
        title: "AI coaching",
        desc: "Performance insights and promotion suggestions based on conversion data and client ratings.",
      },
      {
        icon: Rocket,
        title: "Growth engine",
        desc: "AI optimizes pricing, scheduling, marketing campaigns, and partnership discovery automatically.",
      },
    ],
  },
];

/* ─── Alternating section backgrounds ─── */
const SECTION_BG = ["bg-white", "bg-cream-100"];

/* ─── Category icon color accents ─── */
const ICON_COLORS: Record<string, string> = {
  galleries: "bg-brand-50 text-brand-500",
  store: "bg-coral-50 text-coral-500",
  booking: "bg-gold-100 text-gold-600",
  website: "bg-navy-50 text-navy-500",
  manager: "bg-brand-50 text-brand-500",
  marketplace: "bg-coral-50 text-coral-500",
  resort: "bg-navy-50 text-navy-500",
  ai: "bg-gold-100 text-gold-600",
};

export default function FeaturesPage() {
  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-navy-900 py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900/40" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <SectionFadeIn>
            <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">
              Platform Features
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Every tool your photography business needs
            </h1>
            <p className="text-lg md:text-xl text-navy-300 max-w-2xl mx-auto mb-10">
              Galleries, store, bookings, website, studio management, marketplace, resort operations, and AI --
              unified in one platform that grows with you.
            </p>
          </SectionFadeIn>

          {/* Quick nav pills */}
          <SectionFadeIn delay={150}>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/20 hover:text-white"
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </a>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ─── Feature Categories ─── */}
      {CATEGORIES.map((cat, catIndex) => (
        <section
          key={cat.id}
          id={cat.id}
          className={`py-20 lg:py-28 ${SECTION_BG[catIndex % 2]}`}
        >
          <div className="mx-auto max-w-7xl px-6">
            {/* Category header */}
            <SectionFadeIn className="text-center mb-16">
              <div
                className={`w-14 h-14 rounded-2xl ${ICON_COLORS[cat.id] || "bg-brand-50 text-brand-500"} flex items-center justify-center mx-auto mb-5`}
              >
                <cat.icon className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">
                {cat.label}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
                {cat.title}
              </h2>
              <p className="text-lg text-navy-500 max-w-2xl mx-auto">
                {cat.desc}
              </p>
            </SectionFadeIn>

            {/* Feature cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.cards.map((card, cardIndex) => (
                <SectionFadeIn key={card.title} delay={cardIndex * 60}>
                  <div className="group rounded-2xl border border-navy-100 bg-white p-6 h-full transition hover:shadow-lg hover:border-brand-200 hover:-translate-y-0.5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mb-4 transition group-hover:bg-brand-100">
                      <card.icon className="w-5 h-5 text-brand-500" />
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-navy-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </SectionFadeIn>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ─── Bottom CTA ─── */}
      <section className="py-24 bg-navy-900">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to upgrade your photography business?
            </h2>
            <p className="text-lg text-navy-300 mb-4">
              Free to start. No credit card required. Access every feature from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy-400 mb-10">
              {["No monthly fees", "All features included", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-400" /> {t}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary>Get Started Free</CTAPrimary>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 text-white/80 font-medium hover:text-white transition"
              >
                View pricing <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
