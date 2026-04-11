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
  Languages,
  Film,
  Columns,
  ShoppingCart,
  HelpCircle,
  Aperture,
  Presentation,
  Plug,
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
    desc: "Deliver photos in stunning galleries with 6 themes, per-photo purchasing, photo book designer, AI reel upsells, and auto language detection.",
    cards: [
      {
        icon: Palette,
        title: "6 gallery themes",
        desc: "Classic, masonry, filmstrip, magazine, minimal, and dark. Each theme transforms the gallery experience.",
      },
      {
        icon: ShoppingCart,
        title: "Per-photo purchasing",
        desc: "Clients buy individual photos (€3-€5), select multiples with bulk discounts, or unlock everything with a digital pass.",
      },
      {
        icon: BookOpen,
        title: "Photo book designer",
        desc: "Canva-style editor with 13 layouts, 11 shapes, drag/resize/rotate. Clients design their own books.",
      },
      {
        icon: Film,
        title: "AI reel upsell",
        desc: "Cinematic video reels auto-generated from session photos. 3 tiers: Short (€9), Standard (€15), Premium (€25).",
      },
      {
        icon: Languages,
        title: "Auto language detection",
        desc: "Gallery auto-detects client language from phone number, email domain, or browser. 10 languages + Arabic RTL.",
      },
      {
        icon: Shield,
        title: "Server-side watermarks",
        desc: "Cloudinary-powered signed URLs. Cannot be removed or screenshotted. Custom watermark upload.",
      },
      {
        icon: Heart,
        title: "Favorites & proofing",
        desc: "Clients heart favorites. Filter by selection. Export the list for album design or final editing.",
      },
      {
        icon: Timer,
        title: "Password + download limits",
        desc: "Optional password protection. Set download limits per gallery. Cookie-based access control.",
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
        title: "Photo book designer",
        desc: "Canva-style editor: drag, resize, rotate photos. 13 layouts, 11 clip-path shapes, 10 backgrounds, 8 fonts. AI auto-fill.",
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
    desc: "AI-powered builder or manual editor. 17 block types, custom fonts, client gallery pages, SEO tools, and custom domain.",
    cards: [
      {
        icon: Sparkles,
        title: "AI Website Builder",
        desc: "Answer 3 questions (specialty, style, bio) and get a complete 7-section website generated instantly.",
      },
      {
        icon: Paintbrush,
        title: "17 content blocks",
        desc: "Hero, gallery, about, services, testimonials, contact, FAQ, CTA, blog, stats, custom HTML, and more.",
      },
      {
        icon: UserSearch,
        title: "Client gallery page",
        desc: "Clients find their photos by email, gallery code, name, or phone. Create accounts for repeat access.",
      },
      {
        icon: Globe,
        title: "Custom domain",
        desc: "Connect your own domain (yourname.com) for a fully branded experience. SSL included.",
      },
      {
        icon: Search,
        title: "SEO tools",
        desc: "Dynamic sitemap, robots.txt, JSON-LD schema markup (Photographer, ImageGallery, Product), OG tags.",
      },
      {
        icon: FileText,
        title: "Built-in blog",
        desc: "Rich text editor with image support. AI writing assistance. Publish directly for SEO.",
      },
    ],
  },
  {
    id: "manager",
    icon: BarChart3,
    label: "Studio Manager",
    title: "Run your entire studio from one dashboard",
    desc: "AI Command Center, project board, Lightroom integration, CRM, contracts, invoices, and PDF presentations.",
    cards: [
      {
        icon: Brain,
        title: "AI Command Center",
        desc: "7-section dashboard: live metrics, AI briefing, marketing assistant, competitor monitor, customer insights, financial projections.",
      },
      {
        icon: Columns,
        title: "Kanban project board",
        desc: "Drag-and-drop workflow: Inquiry, Booked, Shot, Editing, Delivered, Archived. Track every project visually.",
      },
      {
        icon: Plug,
        title: "Lightroom integration",
        desc: "API key management with Bearer auth. Upload photos directly from Lightroom or any desktop app via REST API.",
      },
      {
        icon: Presentation,
        title: "PDF sales presentations",
        desc: "Generate print-ready presentations for 7 audience types: hotels, resorts, water parks, corporate, and more.",
      },
      {
        icon: TrendingUp,
        title: "Revenue analytics",
        desc: "Monthly charts, per-gallery breakdown, conversion rates, payout tracking, and Stripe Connect payouts.",
      },
      {
        icon: Wallet,
        title: "Invoices + contracts",
        desc: "Invoices with Stripe payment links and PDF generation. Contracts with e-signatures and legal proof.",
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
    label: "Attractions & Resorts",
    title: "Purpose-built for on-site venue photography",
    desc: "Kiosk POS, cash management, wristband identification, face recognition, offline mode, hotel integration, and automated post-trip recovery sales. Everything a venue photography operation needs.",
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
    desc: "AI Command Center, website builder, reel upsells, retouching, language detection, marketing assistant, and competitor analysis.",
    cards: [
      {
        icon: Brain,
        title: "AI Command Center",
        desc: "Daily briefing, marketing content generator (4 tabs), competitor monitor, customer insights, and financial projections.",
      },
      {
        icon: Globe,
        title: "AI Website Builder",
        desc: "Answer 3 questions and get a complete 7-section website. Hero, about, gallery, services, testimonials, contact, CTA.",
      },
      {
        icon: Film,
        title: "AI reel upsell",
        desc: "Auto-generate cinematic reels from gallery photos. 3 pricing tiers (€9/€15/€25) with Stripe checkout.",
      },
      {
        icon: Aperture,
        title: "AI retouching",
        desc: "7 Cloudinary-powered actions: auto-enhance, upscale, remove background, gen-remove, gen-replace, and restore.",
      },
      {
        icon: Languages,
        title: "Auto language detection",
        desc: "Detect client language from phone country code, email TLD, or browser. 10 languages with priority chain.",
      },
      {
        icon: ScanFace,
        title: "Face recognition",
        desc: "Selfie search finds all photos instantly. Works with sunglasses, hats, expressions. GDPR-compliant.",
      },
      {
        icon: HelpCircle,
        title: "AI chat support",
        desc: "Gemini-powered chat widget with 100+ help articles, smart routing, and human escalation.",
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
