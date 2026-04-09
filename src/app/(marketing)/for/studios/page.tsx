import { Metadata } from "next";
import {
  Users,
  BarChart3,
  DollarSign,
  Wrench,
  GraduationCap,
  Building2,
  GitBranch,
  UserCog,
  Brain,
  Star,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Shield,
  Clock,
  Award,
  Gamepad2,
  MessageSquare,
  Home,
  Camera,
  TrendingUp,
  Layers,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "For Photography Studios | Fotiqo",
  description:
    "Run your studio from one dashboard. Multi-staff management, payroll, commissions, equipment tracking, training academy, multi-location support, and AI insights.",
};

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-28 pb-20">
        <SectionFadeIn>
          <p className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4">
            For Photography Studios
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 text-balance">
            Run your studio from{" "}
            <span className="text-brand-300">one dashboard</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Manage staff, track equipment, handle payroll, train your team, and scale across multiple locations. Fotiqo is purpose-built for photography studios that think big.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <CTAPrimary href="/signup">Scale Your Studio with Fotiqo</CTAPrimary>
            <CTAGhost href="#features">Explore Features</CTAGhost>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60 text-sm">
            <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Multi-staff</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Multi-location</span>
            <span className="flex items-center gap-2"><Brain className="w-4 h-4" /> AI-powered</span>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  KEY CAPABILITIES                                                   */
/* ------------------------------------------------------------------ */
function CapabilitiesGrid() {
  const capabilities = [
    {
      icon: Users,
      title: "Multi-staff management",
      desc: "Manage photographers, sales staff, receptionists, supervisors, and trainees from one place. Assign shifts, track attendance, and transfer staff between locations instantly.",
    },
    {
      icon: DollarSign,
      title: "Payroll and commissions",
      desc: "Automatic commission calculations for photo sales, digital pass sales, booking referrals, and automated post-trip revenue. Monthly payroll dashboard with one-click payouts.",
    },
    {
      icon: Wrench,
      title: "Equipment tracking",
      desc: "Track every camera, lens, iPad, and kiosk across your operation. Know who has what, what it costs, and when it needs maintenance. Full assignment history per staff member.",
    },
    {
      icon: GraduationCap,
      title: "Training academy",
      desc: "Built-in learning management system with onboarding, sales training, photography techniques, software guides, and compliance modules. Track progress and quiz scores per staff member.",
    },
    {
      icon: Building2,
      title: "Multi-location support",
      desc: "Run hotels, water parks, attractions, and self-service kiosks from a single dashboard. Each location has its own staff, equipment, galleries, and analytics.",
    },
    {
      icon: GitBranch,
      title: "Franchise system",
      desc: "Scale beyond a single business. Create franchise organizations with their own branding, staff, and dashboards. Centralized HQ oversight with revenue sharing built in.",
    },
    {
      icon: UserCog,
      title: "Client management",
      desc: "Track every customer across galleries, orders, digital passes, and communication history. QR wristband, face recognition, NFC tag, and room number identification systems.",
    },
    {
      icon: BarChart3,
      title: "Revenue analytics",
      desc: "Real-time dashboards for total revenue, conversion rates, revenue by location, photographer performance, automated sales vs. manual sales, and cost-per-staff breakdowns.",
    },
    {
      icon: Brain,
      title: "AI insights",
      desc: "AI-powered suggestions for staff promotions, pricing optimization, booking boost strategies, marketing campaigns, and franchise lead discovery. The system learns from your data.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Studio Features</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Everything a growing studio needs
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            From a team of two to a franchise of two hundred, Fotiqo scales with you. Every tool is designed for real photography operations.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((c, i) => (
            <SectionFadeIn key={c.title} delay={i * 60}>
              <div className="card p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <c.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-3">{c.title}</h3>
                <p className="text-navy-600 leading-relaxed">{c.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  STAFF DEEP-DIVE                                                    */
/* ------------------------------------------------------------------ */
function StaffSection() {
  const staffFeatures = [
    { icon: Clock, text: "Shift scheduling with location-based assignments" },
    { icon: Award, text: "Performance leaderboard with sales, uploads, and conversion metrics" },
    { icon: Home, text: "Housing management with monthly cost and documentation tracking" },
    { icon: TrendingUp, text: "Repeater bonus system: returning staff earn more each year" },
    { icon: Gamepad2, text: "Gamification with badges, XP, daily targets, and leaderboards" },
    { icon: MessageSquare, text: "Internal chat between staff, locations, and company-wide channels" },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <SectionFadeIn className="flex-1">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">People Operations</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Your team is your biggest asset
            </h2>
            <p className="text-navy-600 leading-relaxed mb-8">
              Fotiqo goes beyond basic scheduling. Track performance, reward loyalty, gamify daily targets, and let AI suggest who deserves a promotion. Staff management built for the hospitality photography industry.
            </p>
            <div className="space-y-4">
              {staffFeatures.map((f) => (
                <div key={f.text} className="flex items-start gap-3">
                  <f.icon className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-navy-700">{f.text}</span>
                </div>
              ))}
            </div>
          </SectionFadeIn>

          <SectionFadeIn className="flex-1 w-full max-w-lg" delay={120}>
            <div className="card p-6 space-y-4">
              <h4 className="text-sm font-semibold text-navy-500 uppercase tracking-wider">Staff Leaderboard</h4>
              {[
                { name: "Sarah M.", role: "Photographer", score: 94, badge: "Top Closer" },
                { name: "Alex K.", role: "Photographer", score: 87, badge: "Upload King" },
                { name: "Maria L.", role: "Sales Staff", score: 82, badge: "Booking Machine" },
              ].map((s, i) => (
                <div key={s.name} className="flex items-center gap-4 p-3 rounded-xl bg-cream-100/80">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-600">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-900 text-sm">{s.name}</span>
                      <span className="text-xs text-navy-400">{s.role}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                      <span className="text-xs font-medium text-brand-500">{s.score}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gold-600 bg-gold-50 px-2 py-1 rounded-full whitespace-nowrap">
                    {s.badge}
                  </span>
                </div>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ANALYTICS PREVIEW                                                  */
/* ------------------------------------------------------------------ */
function AnalyticsSection() {
  const metrics = [
    { label: "Total Revenue", value: "127,450", prefix: "EUR", change: "+18%" },
    { label: "Galleries Sold", value: "1,284", prefix: "", change: "+23%" },
    { label: "Conversion Rate", value: "68%", prefix: "", change: "+5%" },
    { label: "Automated Sales", value: "34,200", prefix: "EUR", change: "+42%" },
  ];

  return (
    <section className="py-24 bg-navy-900">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-3">CEO Dashboard</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Every number, at a glance
          </h2>
          <p className="text-lg text-brand-100/70 max-w-2xl mx-auto">
            Real-time analytics for revenue, conversions, staff performance, equipment costs, and automated sales. Filter by location, photographer, and time period.
          </p>
        </SectionFadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <SectionFadeIn key={m.label} delay={i * 80}>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="text-sm text-white/50 mb-2">{m.label}</p>
                <div className="flex items-baseline gap-2">
                  {m.prefix && <span className="text-sm text-white/40">{m.prefix}</span>}
                  <span className="text-3xl font-bold text-white">{m.value}</span>
                </div>
                <span className="text-sm font-medium text-green-400 mt-2 inline-block">{m.change} vs. last month</span>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SCALE PATH                                                         */
/* ------------------------------------------------------------------ */
function ScaleSection() {
  const tiers = [
    {
      title: "Solo photographer",
      desc: "Start with galleries, bookings, and your portfolio website. Everything you need to run a one-person operation.",
      icon: Camera,
    },
    {
      title: "Small team",
      desc: "Add staff management, shift scheduling, equipment tracking, and commission payouts. Run a lean team of 2 to 10.",
      icon: Users,
    },
    {
      title: "Multi-location studio",
      desc: "Manage multiple hotels, parks, and attraction locations from one dashboard. Transfer staff between sites. Compare performance.",
      icon: Building2,
    },
    {
      title: "Franchise network",
      desc: "License your operation to partners worldwide. White-label branding, centralized oversight, and automated revenue sharing.",
      icon: Layers,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Growth Path</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            From solo to franchise
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Fotiqo grows with you. Start small and scale to a global photography franchise without switching platforms.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((t, i) => (
            <SectionFadeIn key={t.title} delay={i * 100}>
              <div className="relative card p-8 h-full text-center">
                {i < tiers.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-navy-200 z-10" />
                )}
                <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
                  <t.icon className="w-7 h-7 text-brand-500" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy-900 mb-3">{t.title}</h3>
                <p className="text-sm text-navy-600 leading-relaxed">{t.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FINAL CTA                                                          */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-navy-800 to-brand-800">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionFadeIn>
          <Building2 className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to scale your studio?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Whether you are managing a team of two or building a franchise of two hundred, Fotiqo gives you the tools to grow with confidence. Get started today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAPrimary href="/signup">Scale Your Studio with Fotiqo</CTAPrimary>
            <CTAGhost href="/contact">Book a Demo</CTAGhost>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function StudiosPage() {
  return (
    <>
      <Hero />
      <CapabilitiesGrid />
      <StaffSection />
      <AnalyticsSection />
      <ScaleSection />
      <FinalCTA />
    </>
  );
}
