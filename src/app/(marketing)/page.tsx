import Link from "next/link";
import { Camera, Globe, ShoppingBag, Calendar, Search, Check, ArrowRight, Star, Zap, Shield, Heart, Play } from "lucide-react";

export const metadata = {
  title: "Fotiqo \u2014 The Complete Photography Platform",
  description: "Deliver galleries. Sell prints. Book clients. Build your website. Get discovered. All in one place \u2014 free to start.",
};

const PRODUCTS = [
  { id: "gallery", label: "Client Gallery", icon: Camera, headline: "Turn every photo delivery into a brand moment", description: "Beautiful masonry galleries with watermark protection, client favorites, FOMO timers, and AI video reels.", features: ["Watermarked previews, full-res after purchase", "Client favorites and photo proofing", "FOMO countdown timer for urgency", "AI video reels from session photos", "Face recognition \u2014 clients find photos with a selfie", "Real-time streaming \u2014 photos appear as they're taken", "10 languages including Arabic RTL"], cta: "Try Client Gallery free", href: "/products/client-gallery", color: "from-brand-500 to-brand-400" },
  { id: "website", label: "Website Builder", icon: Globe, headline: "A stunning portfolio website in minutes", description: "Block editor with 17 block types, custom fonts, custom domain, blog, and SEO tools.", features: ["17 content blocks (hero, gallery, services, testimonials...)", "Custom domain connection (yourname.com)", "Custom font upload (.woff2, .ttf, .otf)", "Built-in blog for SEO", "Contact form with auto-lead capture", "Mobile responsive, SSL included"], cta: "Build your website free", href: "/products/website-builder", color: "from-purple-500 to-purple-400" },
  { id: "store", label: "Online Store", icon: ShoppingBag, headline: "Sell prints worldwide \u2014 we handle the rest", description: "187 products fulfilled by Prodigi and Printful. You set the prices, we handle printing and shipping.", features: ["187 products: prints, canvas, albums, mugs, gifts", "Auto-fulfillment \u2014 orders ship to your client", "Dual print lab (Prodigi + Printful)", "Photo book builder for clients", "Gift cards and store credits", "Coupons and volume pricing"], cta: "Open your store free", href: "/products/online-store", color: "from-coral-500 to-coral-400" },
  { id: "studio", label: "Studio Manager", icon: Calendar, headline: "Run your business from one dashboard", description: "Bookings, contracts, invoices, CRM \u2014 everything in one place.", features: ["22 booking packages with instant checkout", "Contracts with e-signatures (5 templates)", "Invoices with payment tracking", "Client CRM (contacts, sessions, revenue)", "Availability calendar", "Revenue analytics and charts"], cta: "Manage your studio free", href: "/products/studio-manager", color: "from-gold-500 to-gold-400" },
  { id: "marketplace", label: "Marketplace", icon: Search, headline: "Get discovered by new clients", description: "Your profile on Fotiqo Marketplace. Clients search, find you, and book instantly.", features: ["Professional profile with portfolio and reviews", "Search by location, specialty, and budget", "Instant booking with Stripe payments", "Clients book as guest (no account needed)", "3-10% commission only when you earn", "Verified reviews build your reputation"], cta: "Create your profile free", href: "/products/marketplace", color: "from-green-500 to-green-400" },
];

const COMPARISON = [
  { feature: "Monthly price", fotiqo: "Free", pixieset: "$28\u201350/mo", zno: "$12/mo" },
  { feature: "Client galleries", fotiqo: true, pixieset: true, zno: true },
  { feature: "Website builder", fotiqo: true, pixieset: true, zno: true },
  { feature: "Online store (150+ products)", fotiqo: true, pixieset: true, zno: true },
  { feature: "Booking system", fotiqo: true, pixieset: true, zno: false },
  { feature: "Contracts + e-signatures", fotiqo: true, pixieset: true, zno: false },
  { feature: "Photographer marketplace", fotiqo: true, pixieset: false, zno: false },
  { feature: "Face recognition", fotiqo: true, pixieset: false, zno: true },
  { feature: "AI video reels", fotiqo: true, pixieset: false, zno: true },
  { feature: "Live photo streaming", fotiqo: true, pixieset: false, zno: true },
  { feature: "10 languages + RTL", fotiqo: true, pixieset: false, zno: false },
  { feature: "Resort/venue operations", fotiqo: true, pixieset: false, zno: false },
];

export default function MarketingHome() {
  return (
    <div>
      {/* HERO */}
      <section className="relative pt-32 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-white to-cream-50" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
            <Zap className="h-3.5 w-3.5" /> Free to start. No credit card needed.
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-navy-900 leading-[1.1] mb-6 text-balance">
            The complete<br />photography platform
          </h1>
          <p className="text-lg sm:text-xl text-navy-500 max-w-2xl mx-auto mb-8 text-balance">
            Deliver galleries. Sell prints. Book clients. Build your website. Get discovered. All in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#products" className="inline-flex items-center gap-2 text-navy-600 hover:text-brand-500 font-medium px-6 py-4 transition">
              <Play className="h-4 w-4" /> See how it works
            </Link>
          </div>
          <p className="text-sm text-navy-400">Trusted by photographers in 15+ countries</p>
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-navy-900 mb-3">Everything you need to run your photography business</h2>
            <p className="text-navy-500 max-w-xl mx-auto">Five powerful products, one platform, zero monthly fees.</p>
          </div>
          <div className="space-y-20">
            {PRODUCTS.map((product, i) => {
              const Icon = product.icon;
              const reverse = i % 2 === 1;
              return (
                <div key={product.id} className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 lg:gap-16 items-center`}>
                  <div className="flex-1 max-w-lg">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3"><Icon className="h-4 w-4" /> {product.label}</div>
                    <h3 className="font-display text-2xl sm:text-3xl text-navy-900 mb-3">{product.headline}</h3>
                    <p className="text-navy-500 mb-6">{product.description}</p>
                    <ul className="space-y-2.5 mb-6">
                      {product.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm text-navy-700"><Check className="h-4 w-4 text-brand-500 mt-0.5 flex-shrink-0" /> {f}</li>))}
                    </ul>
                    <Link href={product.href} className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-700 font-semibold text-sm transition">{product.cta} <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                  <div className="flex-1 max-w-lg">
                    <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${product.color} p-8 flex items-center justify-center shadow-lift`}>
                      <div className="bg-white/20 backdrop-blur rounded-xl w-full h-full flex items-center justify-center"><Icon className="h-16 w-16 text-white/60" /></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY FOTIQO */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 text-center mb-12">Why photographers choose Fotiqo</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Zero monthly fees", desc: "Unlike Pixieset ($28\u201350/mo), Fotiqo is free. You only pay a small commission when you make a sale." },
              { icon: Zap, title: "More than a gallery", desc: "AI video reels, face recognition, real-time streaming, 10 languages \u2014 features no other platform offers." },
              { icon: Heart, title: "One platform, not five", desc: "Galleries + website + store + bookings + marketplace. Stop juggling five different tools." },
            ].map((item) => { const Icon = item.icon; return (
              <div key={item.title} className="bg-white rounded-2xl p-8 shadow-card">
                <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4"><Icon className="h-6 w-6 text-brand-600" /></div>
                <h3 className="font-display text-xl text-navy-900 mb-2">{item.title}</h3>
                <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 text-center mb-4">How Fotiqo compares</h2>
          <p className="text-navy-500 text-center mb-10">Feature-by-feature against the top platforms</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-brand-200"><th className="text-left py-3 pr-4 text-navy-500 font-medium">Feature</th><th className="py-3 px-4 text-center"><span className="font-display text-brand-500">Fotiqo</span></th><th className="py-3 px-4 text-center text-navy-400">Pixieset</th><th className="py-3 px-4 text-center text-navy-400">Zno</th></tr></thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-cream-200">
                    <td className="py-3 pr-4 text-navy-700">{row.feature}</td>
                    {[row.fotiqo, row.pixieset, row.zno].map((val, ci) => (
                      <td key={ci} className="py-3 px-4 text-center">
                        {typeof val === "boolean" ? (val ? <Check className={`h-5 w-5 mx-auto ${ci === 0 ? "text-brand-500" : "text-navy-400"}`} /> : <span className="text-navy-300">&mdash;</span>) : <span className={ci === 0 ? "font-semibold text-brand-600" : "text-navy-600"}>{val}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 text-center mb-12">Photographers love Fotiqo</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Chen", spec: "Wedding Photographer", quote: "Fotiqo replaced four different tools for me. Galleries, website, store, and bookings \u2014 all in one." },
              { name: "Marcus Rivera", spec: "Portrait Photographer", quote: "The marketplace brought me 12 new clients in the first month. No monthly fees hanging over my head." },
              { name: "Elena Petrov", spec: "Event Photographer", quote: "The live streaming feature is incredible. My clients see photos appearing in real-time during the event." },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />)}</div>
                <p className="text-navy-700 text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm">{t.name.split(" ").map((n) => n[0]).join("")}</div>
                  <div><div className="font-semibold text-navy-900 text-sm">{t.name}</div><div className="text-xs text-navy-400">{t.spec}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-navy-900 mb-3">Simple pricing. No surprises.</h2>
          <p className="text-navy-500 mb-10">Everything included. No tiers. No feature gates.</p>
          <div className="bg-cream-50 rounded-2xl p-8 mb-8 text-left">
            <div className="text-center mb-6">
              <div className="font-display text-5xl text-navy-900">&euro;0<span className="text-lg text-navy-400">/month</span></div>
              <p className="text-navy-500 text-sm mt-1">Small commission only when you make a sale</p>
            </div>
            <div className="space-y-3">
              {[["Your own website/link", "3%"], ["Your Fotiqo portfolio", "5%"], ["Marketplace bookings", "10%"], ["Store product sales", "5%"]].map(([s, r]) => (
                <div key={s} className="flex items-center justify-between py-2 border-b border-cream-200 last:border-0"><span className="text-sm text-navy-700">{s}</span><span className="font-display text-navy-900">{r}</span></div>
              ))}
            </div>
          </div>
          <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">Start free &mdash; no credit card needed <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* FOR RESORTS */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-brand-300 text-xs uppercase tracking-widest font-semibold mb-3">Also for venues</p>
          <h2 className="font-display text-3xl mb-4">Hotels, water parks, zoos, and attractions</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-6">Fotiqo powers on-site photography operations at venues worldwide. Kiosk POS, face recognition, staff management, and more.</p>
          <Link href="/for/resort-photography" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 text-sm transition">Learn about resort operations <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl sm:text-5xl mb-4">Ready to grow your photography business?</h2>
          <p className="text-white/80 text-lg mb-8">Join photographers worldwide who use Fotiqo to deliver, sell, and book.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup/photographer" className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white font-semibold rounded-xl px-8 py-4 text-base shadow-lift transition hover:scale-[1.02]">Get started free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 text-sm transition">Book a demo</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
