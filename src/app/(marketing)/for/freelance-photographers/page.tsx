import { Metadata } from "next";
import {
  Camera,
  Globe,
  ShoppingBag,
  CalendarCheck,
  CreditCard,
  Images,
  Printer,
  Star,
  CheckCircle2,
  ArrowRight,
  Palette,
  Link2,
  Clock,
  Shield,
  TrendingUp,
  Heart,
  Zap,
  X,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "For Freelance Photographers | Fotiqo",
  description:
    "Get discovered. Get booked. Get paid. Create your profile in 5 minutes. Free portfolio website, booking system, gallery delivery, and print store. 0% commission on direct clients.",
};

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-brand-700 to-navy-900" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-28 pb-20">
        <SectionFadeIn>
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-4">
            For Freelance Photographers
          </p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6 text-balance">
            Get discovered. Get booked.{" "}
            <span className="text-coral-400">Get paid.</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your all-in-one platform to showcase your work, book clients, deliver galleries, sell prints, and grow your photography business. Create your free profile in five minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <CTAPrimary href="/signup">Create Your Free Profile</CTAPrimary>
            <CTAGhost href="#features">See What You Get</CTAGhost>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/60 text-sm">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
              ))}
            </div>
            <span>Trusted by 500+ freelance photographers worldwide</span>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  5-MINUTE PROFILE                                                   */
/* ------------------------------------------------------------------ */
function ProfileSection() {
  const steps = [
    { num: "1", title: "Sign up free", desc: "No credit card. No commitment. Your profile is live in minutes." },
    { num: "2", title: "Add your work", desc: "Upload your best shots. Choose a portfolio theme. Set your specialties, location, and pricing." },
    { num: "3", title: "Start earning", desc: "Clients discover you on the marketplace, book sessions, and pay securely. You focus on shooting." },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Quick Start</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Create your profile in 5 minutes
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            No technical skills required. No website builder to figure out. Just your photos and a few details about your business.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <SectionFadeIn key={s.num} delay={i * 100}>
              <div className="card p-8 text-center h-full">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
                  <span className="text-xl font-bold text-brand-500">{s.num}</span>
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
/*  FEATURES GRID                                                      */
/* ------------------------------------------------------------------ */
function FeaturesGrid() {
  const features = [
    {
      icon: Globe,
      title: "Marketplace listing",
      desc: "Get listed in our global photographer directory. Clients search by location, specialty, date, and budget. Your profile shows your portfolio, reviews, and availability.",
    },
    {
      icon: Palette,
      title: "Portfolio website",
      desc: "Choose from 6 stunning themes designed for photographers. Customize colors, fonts, and layout. Connect your own domain. SEO-optimized out of the box.",
    },
    {
      icon: CalendarCheck,
      title: "Booking packages",
      desc: "Create Bokun-style booking packages with session types, durations, add-ons, and deposits. Clients pick a date, pay, and get instant confirmation.",
    },
    {
      icon: CreditCard,
      title: "Payments via Stripe",
      desc: "Accept credit cards, Apple Pay, and Google Pay worldwide. Automatic invoicing, tax receipts, and weekly payouts directly to your bank account.",
    },
    {
      icon: Images,
      title: "Gallery delivery",
      desc: "Upload photos. Clients see watermarked previews. They pay. Full high-res files unlock instantly. Built-in favorites, downloads, and ZIP export.",
    },
    {
      icon: Printer,
      title: "Print sales",
      desc: "Offer 150+ print products from fine-art prints to canvas wraps, albums, and gifts. Auto-fulfilled by professional print labs. You set the markup.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Everything You Need</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            One platform, zero headaches
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            Stop juggling five different tools. Fotiqo brings your portfolio, bookings, galleries, print store, and payments together in one place.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <SectionFadeIn key={f.title} delay={i * 80}>
              <div className="card p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-900 mb-3">{f.title}</h3>
                <p className="text-navy-600 leading-relaxed">{f.desc}</p>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PORTFOLIO WEBSITE DEEP DIVE                                        */
/* ------------------------------------------------------------------ */
function PortfolioSection() {
  const perks = [
    { icon: Palette, text: "6 stunning themes designed for photographers" },
    { icon: Link2, text: "Connect your own custom domain" },
    { icon: Globe, text: "SEO-optimized pages and blog" },
    { icon: CalendarCheck, text: "Embedded booking widget" },
    { icon: ShoppingBag, text: "Built-in print store" },
    { icon: Heart, text: "Client galleries with favorites" },
  ];

  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <SectionFadeIn className="flex-1">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Portfolio Website</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
              Your website. Your brand. Your domain.
            </h2>
            <p className="text-navy-600 leading-relaxed mb-8">
              Launch a stunning portfolio website in minutes. No coding, no hosting headaches. Pick a theme, upload your best work, and connect your domain. Your site includes a blog, booking form, print store, and client gallery portal.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {perks.map((p) => (
                <div key={p.text} className="flex items-center gap-3">
                  <p.icon className="w-5 h-5 text-brand-500 shrink-0" />
                  <span className="text-sm text-navy-700">{p.text}</span>
                </div>
              ))}
            </div>
          </SectionFadeIn>

          <SectionFadeIn className="flex-1 w-full max-w-lg" delay={120}>
            <div className="relative aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-500/20 to-navy-500/20 border border-white/40 shadow-card overflow-hidden">
              <div className="h-8 bg-white/60 flex items-center gap-1.5 px-3 border-b border-black/5">
                <div className="w-2.5 h-2.5 rounded-full bg-coral-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-gold-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 h-4 bg-navy-100/40 rounded-full" />
              </div>
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
                Portfolio
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
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wider mb-3">Transparent Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Keep more of what you earn
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            No monthly subscriptions. No hidden fees. You only pay a small commission when you make money through our marketplace.
          </p>
        </SectionFadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <SectionFadeIn>
            <div className="card p-8 border-2 border-brand-400">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-brand-500" />
                <h3 className="font-display text-xl font-bold text-navy-900">Direct clients</h3>
              </div>
              <div className="text-5xl font-bold text-brand-500 mb-2">0%</div>
              <p className="text-navy-500 mb-6">commission on sales</p>
              <ul className="space-y-3">
                {["Clients you bring to the platform", "Gallery delivery and downloads", "Print sales from your galleries", "Booking deposits from your website"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-navy-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-coral-500" />
                <h3 className="font-display text-xl font-bold text-navy-900">Marketplace clients</h3>
              </div>
              <div className="text-5xl font-bold text-coral-500 mb-2">10%</div>
              <p className="text-navy-500 mb-6">commission on bookings</p>
              <ul className="space-y-3">
                {["Clients who find you on the marketplace", "We handle marketing and discovery", "You keep 90% of every booking", "Print sales from marketplace galleries"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-navy-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </SectionFadeIn>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPARISON                                                         */
/* ------------------------------------------------------------------ */
function ComparisonSection() {
  const rows = [
    { feature: "Monthly cost", pixel: "Free", other: "30-50/month" },
    { feature: "Portfolio website", pixel: "Included (6 themes)", other: "Basic, limited" },
    { feature: "Custom domain", pixel: "Yes", other: "Paid add-on" },
    { feature: "Booking system", pixel: "Built-in", other: "Not included" },
    { feature: "Marketplace listing", pixel: "Included", other: "Not available" },
    { feature: "Print store products", pixel: "150+", other: "Limited selection" },
    { feature: "Gallery delivery", pixel: "Included", other: "Included" },
    { feature: "Commission on direct", pixel: "0%", other: "0%" },
    { feature: "Payments", pixel: "Stripe (global)", other: "Stripe" },
    { feature: "Client reviews", pixel: "Built-in", other: "Not included" },
  ];

  return (
    <section className="py-24 bg-navy-900">
      <div className="mx-auto max-w-4xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <p className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-3">Compare</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Fotiqo vs. Pixieset
          </h2>
          <p className="text-lg text-brand-100/70 max-w-2xl mx-auto">
            Why pay monthly for less? Fotiqo gives you more features at zero cost per month.
          </p>
        </SectionFadeIn>

        <SectionFadeIn delay={80}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 pr-4 text-sm font-semibold text-white/60">Feature</th>
                  <th className="py-4 px-4 text-sm font-semibold text-brand-300">Fotiqo</th>
                  <th className="py-4 pl-4 text-sm font-semibold text-white/40">Others</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.feature} className="border-b border-white/5">
                    <td className="py-3.5 pr-4 text-sm text-white/80">{r.feature}</td>
                    <td className="py-3.5 px-4 text-sm font-medium text-brand-300">{r.pixel}</td>
                    <td className="py-3.5 pl-4 text-sm text-white/40">{r.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    <section className="py-24 bg-gradient-to-br from-brand-600 to-brand-800">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionFadeIn>
          <Camera className="w-12 h-12 text-white/80 mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to grow your photography business?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
            Join hundreds of freelance photographers who use Fotiqo to get discovered, book clients, and earn more. It takes five minutes to set up and it is completely free to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAPrimary href="/signup">Create Your Free Profile</CTAPrimary>
            <CTAGhost href="/for/photographer-marketplace">Browse the Marketplace</CTAGhost>
          </div>
        </SectionFadeIn>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */
export default function FreelancePhotographersPage() {
  return (
    <>
      <Hero />
      <ProfileSection />
      <FeaturesGrid />
      <PortfolioSection />
      <CommissionSection />
      <ComparisonSection />
      <FinalCTA />
    </>
  );
}
