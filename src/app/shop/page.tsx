import Link from "next/link";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Fotiqo Shop — Premium Photo Products",
  description:
    "Prints, wall art, photo books, gifts and digital downloads. Lab-quality products delivered to your door.",
};

export default async function ShopPage() {
  return (
    <div className="min-h-screen bg-white text-[#0C2E3D]">
      {/* ── Top nav ─────────────────────────────────────── */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/portfolio" className="font-display text-2xl text-[#0C2E3D] tracking-tight">
          Fotiqo
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/portfolio" className="text-gray-500 hover:text-[#0C2E3D] px-3 py-2 transition font-medium">
            Portfolio
          </Link>
          <Link
            href="/book"
            className="bg-[#F97316] hover:bg-[#ea6c10] text-white px-5 py-2.5 rounded-full font-semibold shadow-[0_2px_10px_rgba(249,115,22,0.25)] hover:shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-all duration-200"
          >
            Book a Session
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-[#0C2E3D] px-6 py-24 md:py-32 text-center">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0EA5A5]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#5EEAD4]/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4A853]/10 rounded-full blur-[140px]" />

        <div className="relative">
          <p className="text-[#5EEAD4] uppercase tracking-[0.35em] text-xs font-semibold mb-4">
            The Fotiqo Store
          </p>
          <h1 className="text-white font-display text-4xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-[1.1]">
            Turn Your Memories Into Art
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
            Museum-quality prints, stunning wall art, and personalized gifts —
            all crafted from your holiday photos.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: "⚡", text: "Instant digital delivery" },
              { icon: "🖼", text: "Lab-quality prints" },
              { icon: "🌍", text: "Ships worldwide" },
            ].map(item => (
              <span
                key={item.text}
                className="bg-white/[0.06] text-white/80 backdrop-blur-sm rounded-full px-5 py-2.5 text-sm font-medium border border-white/[0.08]"
              >
                <span className="mr-1.5">{item.icon}</span>{item.text}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Client-side catalog ─────────────────────────── */}
      <ShopClient />

      {/* ── Lab partners ────────────────────────────────── */}
      <section className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#0EA5A5] text-xs font-semibold uppercase tracking-[0.25em] mb-3">
            Trusted Partners
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-[#0C2E3D] mb-4">
            Fulfilled by the best print labs
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-14">
            Every product is printed and shipped by world-class lab partners.
            Professional-grade quality, delivered worldwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14 opacity-60 hover:opacity-100 transition-opacity duration-500">
            {[
              { name: "WHCC", style: "font-bold text-lg tracking-tight" },
              { name: "Prodigi", style: "font-bold text-lg tracking-tight" },
              { name: "mpix", style: "font-bold text-lg tracking-tight bg-red-500 text-white px-2.5 py-0.5 rounded text-sm" },
              { name: "Miller's", style: "font-semibold text-lg italic tracking-tight" },
              { name: "Loxley Colour", style: "font-semibold text-base tracking-tight" },
              { name: "ProDPI", style: "font-bold text-base tracking-tight" },
              { name: "Atkins Pro", style: "font-semibold text-sm uppercase tracking-[0.2em]" },
              { name: "Printful", style: "font-bold text-base tracking-tight" },
            ].map(lab => (
              <span key={lab.name} className={`text-gray-400 hover:text-gray-700 transition-colors ${lab.style}`}>
                {lab.name}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-12">
            Orders are automatically routed to the nearest lab for fastest delivery.
          </p>
        </div>
      </section>

      {/* ── Pricing section ─────────────────────────────── */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#D4A853] text-xs font-semibold uppercase tracking-[0.25em] mb-3">
              Commission-Free
            </p>
            <h2 className="font-display text-3xl text-[#0C2E3D] mb-4">
              Keep more of what you earn
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Set your own prices, keep the profit. We charge just a 2% platform fee —
              no monthly subscription, no hidden costs. You set the markup;
              we handle printing, shipping, and customer service.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 ring-1 ring-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">You sell a print at</span>
                <span className="font-bold text-[#0C2E3D] text-lg">€25.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Lab cost</span>
                <span className="text-gray-600">-€3.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Platform fee (2%)</span>
                <span className="text-gray-600">-€0.50</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="font-semibold text-[#0C2E3D]">Your profit</span>
                <span className="font-bold text-green-500 text-2xl">€21.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-[#0C2E3D] text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Fotiqo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/book" className="hover:text-white transition">Book</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Fotiqo</div>
        </div>
      </footer>
    </div>
  );
}
