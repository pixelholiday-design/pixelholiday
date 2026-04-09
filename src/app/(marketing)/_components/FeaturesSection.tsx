import { Images, ShoppingBag, CalendarCheck, Globe, BarChart3, Monitor } from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";

const FEATURES = [
  {
    icon: Images,
    title: "Client galleries that sell",
    desc: "Deliver photos in stunning watermarked galleries. Clients browse, favorite, and buy — all in one beautiful experience. Built-in shop with 150+ products.",
    bullets: ["Watermark protection", "In-gallery print store", "Urgency timer + email sequence"],
    mockupBg: "from-brand-500/20 to-brand-700/20",
    mockupLabel: "Gallery",
  },
  {
    icon: ShoppingBag,
    title: "Built-in print store",
    desc: "Sell prints, canvas, albums, gifts, and souvenirs directly from your galleries. Auto-fulfilled by world-class print labs. You keep the markup.",
    bullets: ["150+ products", "Prodigi + Printful integration", "Photo book builder"],
    mockupBg: "from-coral-500/20 to-coral-700/20",
    mockupLabel: "Store",
  },
  {
    icon: CalendarCheck,
    title: "Book clients effortlessly",
    desc: "Let clients find you on our marketplace, view your portfolio, check your availability, and book instantly. Or embed our booking widget on your own site.",
    bullets: ["Photographer-to-Go marketplace", "Online booking + deposits", "Pre-session questionnaire"],
    mockupBg: "from-gold-500/20 to-gold-600/20",
    mockupLabel: "Bookings",
  },
  {
    icon: Globe,
    title: "Build your dream website",
    desc: "Choose from 6 stunning themes. Customize everything. Showcase your portfolio. Blog. Accept bookings. Sell prints. All under your own domain.",
    bullets: ["6 themes", "Custom domain", "SEO optimized + blog"],
    mockupBg: "from-navy-500/20 to-navy-700/20",
    mockupLabel: "Website",
  },
  {
    icon: BarChart3,
    title: "Manage your entire business",
    desc: "Track revenue, manage staff, handle payroll, monitor equipment, and get AI insights — all from one dashboard.",
    bullets: ["AI daily briefing", "Revenue analytics", "Staff gamification + XP"],
    mockupBg: "from-brand-500/20 to-navy-500/20",
    mockupLabel: "Dashboard",
  },
  {
    icon: Monitor,
    title: "Resort & attraction operations",
    desc: "Purpose-built for on-site photography: kiosk POS, cash management, wristband identification, self-service galleries, hotel check-in integration.",
    bullets: ["Kiosk POS (cash + card)", "Offline mode", "WhatsApp delivery"],
    mockupBg: "from-coral-500/20 to-navy-500/20",
    mockupLabel: "Kiosk",
  },
];

function MockupPlaceholder({ label, gradient }: { label: string; gradient: string }) {
  return (
    <div className={`relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${gradient} border border-white/40 shadow-card overflow-hidden`}>
      {/* Fake browser chrome */}
      <div className="h-8 bg-white/60 flex items-center gap-1.5 px-3 border-b border-black/5">
        <div className="w-2.5 h-2.5 rounded-full bg-coral-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-gold-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 h-4 bg-navy-100/40 rounded-full" />
      </div>
      {/* Fake content blocks */}
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-navy-200/40 rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          <div className="aspect-square rounded-lg bg-white/50" />
          <div className="aspect-square rounded-lg bg-white/50" />
          <div className="aspect-square rounded-lg bg-white/50" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 flex-1 rounded-lg bg-brand-400/30" />
          <div className="h-8 w-20 rounded-lg bg-coral-400/30" />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 text-xs font-semibold text-navy-400/60 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-20">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Platform Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Everything you need. Nothing you don&apos;t.
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Six powerful tools that work together seamlessly, so you can focus on what you do best &mdash; taking incredible photos.
          </p>
        </SectionFadeIn>

        <div className="space-y-24">
          {FEATURES.map((f, i) => {
            const reversed = i % 2 === 1;
            return (
              <SectionFadeIn key={f.title} delay={80}>
                <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-16`}>
                  {/* Text */}
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                      <f.icon className="w-6 h-6 text-brand-500" />
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-navy-900 mb-4">
                      {f.title}
                    </h3>
                    <p className="text-navy-600 leading-relaxed mb-6">{f.desc}</p>
                    <ul className="space-y-2">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3 text-sm text-navy-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Mockup */}
                  <div className="flex-1 w-full max-w-lg">
                    <MockupPlaceholder label={f.mockupLabel} gradient={f.mockupBg} />
                  </div>
                </div>
              </SectionFadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
