import { Metadata } from "next";
import {
  Heart,
  Lock,
  Palette,
  Smartphone,
  Star,
  Share2,
  ShoppingBag,
  Image,
  BookOpen,
  FileText,
  PenTool,
  CalendarDays,
  ClipboardList,
  Globe,
  Search,
  Feather,
  Layout,
  BarChart3,
  DollarSign,
  Check,
  X,
  Quote,
  Sparkles,
} from "lucide-react";
import SectionFadeIn from "../../_components/SectionFadeIn";
import { CTAPrimary, CTAGhost } from "../../_components/CTAButton";

export const metadata: Metadata = {
  title: "Fotiqo for Wedding Photographers — Galleries, Print Sales & Studio Management",
  description:
    "Deliver breathtaking wedding galleries. Sell prints and albums directly from the gallery. Manage bookings, contracts, and invoices. Build your portfolio website. Free to start.",
  openGraph: {
    title: "Fotiqo for Wedding Photographers",
    description:
      "The all-in-one platform for wedding photographers. Galleries, print sales, client proofing, booking, contracts, and a portfolio website.",
  },
};

/* ─────────── data ─────────── */

const galleryFeatures = [
  { icon: Lock, title: "Password protection", description: "Each gallery is secured with a password you set. Only the couple and their chosen guests can view the images." },
  { icon: Palette, title: "Custom branding", description: "Your logo, your colors, your domain. Every gallery looks like an extension of your brand, not a third-party platform." },
  { icon: Smartphone, title: "Mobile-first design", description: "Over 80% of couples browse galleries on their phone. Every layout is optimized for touch, swipe, and tap." },
  { icon: Heart, title: "Favorites selection", description: "Couples tap to favorite their must-have images. You see the selections in real time and can download the favorites list." },
  { icon: Share2, title: "Easy sharing", description: "Couples share their gallery with family and friends via a beautiful link. Each viewer can buy prints from the same gallery." },
  { icon: Sparkles, title: "Stunning presentation", description: "Masonry grids, full-bleed slideshows, and cinematic cover images. The gallery feels as premium as the wedding itself." },
];

const printProducts = [
  "Fine art prints (lustre, matte, metallic)",
  "Gallery-wrapped canvas",
  "Framed prints (multiple frame styles)",
  "Photo books and coffee table albums",
  "Thank-you cards with wedding photos",
  "Metal and acrylic prints",
];

const proofingSteps = [
  { step: "1", title: "Upload the full set", description: "Upload hundreds of images to the proofing gallery. The couple sees watermarked previews." },
  { step: "2", title: "Couple picks favorites", description: "The couple taps hearts on their favorites. They can leave comments and notes on individual photos." },
  { step: "3", title: "You deliver the finals", description: "Export the favorites list, retouch the selected images, and deliver the final gallery. Done." },
];

const albumFeatures = [
  "Drag-and-drop page designer",
  "Auto-layout suggestions from AI",
  "Preview spreads before ordering",
  "Send proof link to couple for approval",
  "Fulfilled by Prodigi or Printful",
  "Multiple cover materials and sizes",
];

const contractFeatures = [
  { icon: FileText, title: "Contract templates", description: "Start with professionally written templates for weddings, engagements, and elopements. Customize the terms, then send." },
  { icon: PenTool, title: "E-signatures", description: "Couples sign contracts electronically from their phone or desktop. Legally binding, no printing or scanning needed." },
  { icon: DollarSign, title: "Invoicing", description: "Generate invoices tied to the booking. Track payment status, send reminders, and accept partial payments or installments." },
  { icon: ClipboardList, title: "Questionnaires", description: "Send pre-wedding questionnaires to learn the couple's preferences, timeline, key family members, and shot list." },
];

const bookingFeatures = [
  "Couples book you directly from your website",
  "Collect a deposit to secure the date",
  "Calendar syncs with Google Calendar and iCal",
  "Automated confirmation and reminder emails",
  "Pre-session questionnaire sent automatically",
  "Manage retainer, balance, and final payment schedule",
];

const websiteThemes = [
  { name: "Amalfi", style: "Light, airy, serif typography" },
  { name: "Noir", style: "Dark, moody, editorial feel" },
  { name: "Bloom", style: "Soft florals, romantic palette" },
  { name: "Summit", style: "Clean, bold, modern minimal" },
  { name: "Tuscan", style: "Warm earth tones, timeless" },
  { name: "Frost", style: "Cool whites, Scandinavian clarity" },
];

const studioMetrics = [
  { label: "Revenue this month", value: "$12,400", trend: "+18%" },
  { label: "Upcoming shoots", value: "7", trend: "Next: Saturday" },
  { label: "Outstanding invoices", value: "$3,200", trend: "2 overdue" },
  { label: "Gallery deliveries due", value: "3", trend: "This week" },
];

const comparisonRows = [
  { feature: "Starting price", pixel: "Free forever", pixieset: "$15 - $50/mo" },
  { feature: "Commission model", pixel: "2% on sales only", pixieset: "0% (you pay monthly)" },
  { feature: "Client galleries", pixel: "Unlimited", pixieset: "Limited by plan" },
  { feature: "Print & product store", pixel: "Built-in, auto-fulfilled", pixieset: "Built-in" },
  { feature: "Client proofing", pixel: "Included", pixieset: "Included" },
  { feature: "Contracts & e-signatures", pixel: "Included", pixieset: "Not included" },
  { feature: "Invoicing", pixel: "Included", pixieset: "Not included" },
  { feature: "Booking with deposits", pixel: "Included", pixieset: "Not included" },
  { feature: "Portfolio website", pixel: "6 themes, custom domain", pixieset: "Limited themes" },
  { feature: "Blog with SEO", pixel: "AI-assisted, built-in", pixieset: "Basic" },
  { feature: "Studio management", pixel: "Revenue, expenses, AI briefs", pixieset: "Not included" },
  { feature: "Album designer", pixel: "Drag-and-drop, auto-fulfilled", pixieset: "Not included" },
];

/* ─────────── page ─────────── */

export default function WeddingPhotographersPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
        {/* warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1520] via-[#1a1028] to-navy-900" />
        {/* soft glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-coral-500/8 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gold-500/6 blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <SectionFadeIn>
            <span className="inline-block rounded-full bg-coral-500/15 px-4 py-1.5 text-sm font-medium text-coral-300 mb-6">
              For Wedding Photographers
            </span>
          </SectionFadeIn>

          <SectionFadeIn delay={100}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 text-balance">
              Deliver the perfect{" "}
              <span className="text-gold-500">wedding gallery</span>
            </h1>
          </SectionFadeIn>

          <SectionFadeIn delay={200}>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              From the first look to the last dance — deliver, sell, and delight
              with Fotiqo. Galleries, print sales, contracts, booking, and
              your portfolio website, all in one place.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary href="/signup">Start Free — No Credit Card</CTAPrimary>
              <CTAGhost href="#galleries">Explore Features</CTAGhost>
            </div>
          </SectionFadeIn>

          <SectionFadeIn delay={400}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-gold-500" /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-gold-500" /> Unlimited galleries</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-gold-500" /> Built-in print store</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-gold-500" /> No monthly fees</span>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── BEAUTIFUL CLIENT GALLERIES ── */}
      <section id="galleries" className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Galleries</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              Beautiful client galleries
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-16">
              Your work deserves a gallery that matches the emotion of the day. Clean design, fast loading, and every feature couples expect.
            </p>
          </SectionFadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryFeatures.map((f, i) => (
              <SectionFadeIn key={f.title} delay={i * 80}>
                <div className="bg-white rounded-xl p-7 shadow-card h-full">
                  <f.icon className="w-6 h-6 text-brand-400 mb-4" />
                  <h4 className="font-bold text-navy-900 mb-2">{f.title}</h4>
                  <p className="text-sm text-navy-400 leading-relaxed">{f.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── IN-GALLERY PRINT & ALBUM STORE ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Sales</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                In-gallery print & album store
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                Couples browse their wedding gallery and buy prints, canvas, albums, and more — directly from the same page. No separate storefront, no friction, no extra step. You set the prices, Fotiqo handles fulfillment through print partners, and you keep the profit.
              </p>
              <p className="text-navy-400 leading-relaxed mb-8">
                Family members and guests who receive the gallery link can also buy their own prints. Every gallery becomes a passive revenue stream for weeks after the wedding.
              </p>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="bg-cream-100 rounded-2xl p-8">
                <ShoppingBag className="w-7 h-7 text-coral-500 mb-5" />
                <h4 className="font-bold text-navy-900 mb-4">Available products</h4>
                <div className="space-y-3">
                  {printProducts.map((p) => (
                    <div key={p} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span className="text-sm text-navy-600">{p}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-navy-100">
                  <p className="text-xs text-navy-400">Fulfilled by Prodigi, Printful, or WHCC. You set your markup. Shipped directly to the buyer.</p>
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── CLIENT PROOFING ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Workflow</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              Client proofing
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-16">
              Let the couple choose their favorites from the full set. Streamline the selection process so you deliver exactly what they want.
            </p>
          </SectionFadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {proofingSteps.map((s, i) => (
              <SectionFadeIn key={s.step} delay={i * 120}>
                <div className="relative bg-white rounded-2xl p-8 shadow-card h-full">
                  <span className="absolute top-6 right-6 text-5xl font-display font-bold text-navy-100/50">{s.step}</span>
                  <Image className="w-7 h-7 text-brand-400 mb-5" />
                  <h4 className="text-lg font-bold text-navy-900 mb-3">{s.title}</h4>
                  <p className="text-navy-400 leading-relaxed">{s.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ALBUM BUILDER ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn delay={100}>
              <div className="bg-cream-100 rounded-2xl p-8">
                <BookOpen className="w-7 h-7 text-gold-500 mb-5" />
                <h4 className="font-bold text-navy-900 mb-4">Album capabilities</h4>
                <div className="space-y-3">
                  {albumFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      <span className="text-sm text-navy-600">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFadeIn>

            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Design</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Album builder
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                Design stunning wedding albums with a drag-and-drop page editor. AI suggests layouts based on the images you select. Send a proof link to the couple for approval, and when they sign off, the album is printed and shipped by your chosen fulfillment partner.
              </p>
              <p className="text-navy-400 leading-relaxed">
                No more back-and-forth over email. No more manual ordering from a separate print lab portal. The entire album workflow — from design to delivery — lives inside Fotiqo.
              </p>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── CONTRACTS & INVOICES ── */}
      <section className="bg-navy-900 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300 mb-3 text-center">Business</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-4">
              Contracts & invoices
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto text-center mb-16">
              Send contracts, collect signatures, manage invoices. All in one place — no more juggling HoneyBook, QuickBooks, and DocuSign.
            </p>
          </SectionFadeIn>

          <div className="grid sm:grid-cols-2 gap-6">
            {contractFeatures.map((f, i) => (
              <SectionFadeIn key={f.title} delay={i * 100}>
                <div className="bg-navy-800 rounded-xl p-7 border border-white/5 h-full">
                  <f.icon className="w-6 h-6 text-brand-300 mb-4" />
                  <h4 className="font-bold text-white mb-2">{f.title}</h4>
                  <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING SYSTEM ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Bookings</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Booking system with deposits
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                Couples find you, pick a date, and book with a deposit — all from your website. The calendar blocks the date, a confirmation email goes out, and a pre-session questionnaire is sent automatically. You focus on shooting, not admin.
              </p>
              <ul className="space-y-3">
                {bookingFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-navy-500">
                    <Check className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <CalendarDays className="w-7 h-7 text-brand-400 mb-5" />
                <h4 className="font-bold text-navy-900 mb-4">Booking flow</h4>
                <div className="space-y-4">
                  {[
                    { label: "Couple visits your website", detail: "Embeddable booking widget" },
                    { label: "Selects date and package", detail: "Your packages, your prices" },
                    { label: "Pays deposit via Stripe", detail: "You choose the deposit amount" },
                    { label: "Date blocked on your calendar", detail: "Synced with Google/iCal" },
                    { label: "Questionnaire sent automatically", detail: "Timeline, shot list, key people" },
                    { label: "Reminder sent 48h before", detail: "Both you and the couple" },
                  ].map((item, i) => (
                    <div key={item.label} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-400/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{item.label}</p>
                        <p className="text-xs text-navy-400">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO WEBSITE ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Website</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              Portfolio website
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-16">
              Six stunning themes designed specifically for wedding photographers. Blog, SEO, custom domain, and an embedded booking widget. No Squarespace or WordPress needed.
            </p>
          </SectionFadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {websiteThemes.map((t, i) => (
              <SectionFadeIn key={t.name} delay={i * 80}>
                <div className="bg-cream-100 rounded-xl p-6 h-full">
                  <Layout className="w-5 h-5 text-brand-400 mb-3" />
                  <h4 className="font-bold text-navy-900 mb-1">{t.name}</h4>
                  <p className="text-sm text-navy-400">{t.style}</p>
                </div>
              </SectionFadeIn>
            ))}
          </div>

          <SectionFadeIn delay={200}>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Feather, title: "AI-assisted blog", description: "Write posts faster with AI that knows your brand voice. Optimized for SEO automatically." },
                { icon: Search, title: "Built-in SEO", description: "Meta tags, Open Graph, structured data, and sitemap — all handled for you. Rank for \"wedding photographer [city]\"." },
                { icon: Globe, title: "Custom domain", description: "Connect your own domain (e.g., janedoephoto.com). SSL included. Professional from day one." },
              ].map((f) => (
                <div key={f.title} className="bg-cream-100 rounded-xl p-6">
                  <f.icon className="w-5 h-5 text-coral-500 mb-3" />
                  <h4 className="font-bold text-navy-900 mb-1.5">{f.title}</h4>
                  <p className="text-sm text-navy-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── STUDIO MANAGER ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <SectionFadeIn>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3">Management</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Studio Manager
              </h2>
              <p className="text-lg text-navy-400 leading-relaxed mb-6">
                Track revenue, expenses, upcoming shoots, and gallery deliveries in a single dashboard. Fotiqo gives you AI-powered briefings before each shoot — pulling details from the questionnaire, the contract, and the couple's preferences so you arrive prepared.
              </p>
              <ul className="space-y-3">
                {[
                  "Revenue and expense tracking with monthly summaries",
                  "Upcoming shoots calendar with countdown timers",
                  "Gallery delivery tracker — never miss a deadline",
                  "AI shoot briefings pulled from questionnaires and contracts",
                  "Tax-ready reports for quarterly and annual filing",
                  "Client CRM with notes, preferences, and communication history",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-navy-500">
                    <Check className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </SectionFadeIn>

            <SectionFadeIn delay={150}>
              <div className="bg-white rounded-2xl p-8 shadow-card">
                <BarChart3 className="w-7 h-7 text-brand-400 mb-5" />
                <h4 className="font-bold text-navy-900 mb-5">Dashboard snapshot</h4>
                <div className="grid grid-cols-2 gap-4">
                  {studioMetrics.map((m) => (
                    <div key={m.label} className="bg-cream-100 rounded-lg p-4">
                      <p className="text-xs text-navy-400 mb-1">{m.label}</p>
                      <p className="text-xl font-bold text-navy-900">{m.value}</p>
                      <p className="text-xs text-brand-400 mt-1">{m.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFadeIn>
          </div>
        </div>
      </section>

      {/* ── COMPARISON: WHY SWITCH FROM PIXIESET ── */}
      <section className="bg-white py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <SectionFadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-400 mb-3 text-center">Comparison</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 text-center mb-4">
              Why switch from Pixieset?
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto text-center mb-12">
              Fotiqo gives you everything Pixieset does — plus contracts, invoicing, booking, album design, and studio management. And it starts free.
            </p>
          </SectionFadeIn>

          <SectionFadeIn delay={150}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-navy-100">
                    <th className="text-left py-4 pr-4 font-semibold text-navy-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-brand-400">Fotiqo</th>
                    <th className="text-center py-4 pl-4 font-semibold text-navy-400">Pixieset</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-navy-50">
                      <td className="py-3.5 pr-4 text-navy-600">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center">
                        {row.pixel === "Included" ? (
                          <Check className="w-5 h-5 text-brand-400 mx-auto" />
                        ) : (
                          <span className="text-navy-900 font-medium">{row.pixel}</span>
                        )}
                      </td>
                      <td className="py-3.5 pl-4 text-center">
                        {row.pixieset === "Not included" ? (
                          <X className="w-5 h-5 text-navy-200 mx-auto" />
                        ) : (
                          <span className="text-navy-400">{row.pixieset}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="bg-cream-100 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionFadeIn>
            <Quote className="w-10 h-10 text-brand-200 mx-auto mb-6" />
            <blockquote className="font-display text-2xl sm:text-3xl text-navy-900 leading-relaxed mb-8">
              I switched from Pixieset and HoneyBook to Fotiqo and now everything lives in one place. My couples love the galleries, the print store runs itself, and I finally stopped paying for three different subscriptions.
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white font-bold">
                SR
              </div>
              <div className="text-left">
                <p className="font-semibold text-navy-900">Sarah Reynolds</p>
                <p className="text-sm text-navy-400">Wedding Photographer, Portland</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-gold-500 fill-gold-500" />
              ))}
            </div>
          </SectionFadeIn>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a1520] via-navy-900 to-navy-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-coral-500/6 blur-[160px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <SectionFadeIn>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
              Start free — deliver your next wedding gallery with Fotiqo
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-10 leading-relaxed">
              No credit card. No monthly fees. Upload your first gallery in under five minutes and see why photographers are switching.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAPrimary href="/signup">Get Started Free</CTAPrimary>
              <CTAGhost href="/contact">Talk to Us</CTAGhost>
            </div>
            <p className="mt-8 text-sm text-white/40">
              Free forever. 2% commission only when you make a sale.
            </p>
          </SectionFadeIn>
        </div>
      </section>
    </>
  );
}
