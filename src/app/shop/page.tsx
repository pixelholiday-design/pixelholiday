import Link from "next/link";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Pixelvo Shop — Turn Your Memories Into Treasures",
  description:
    "Prints, wall art, photo books, gifts and digital downloads. Lab-quality products delivered to your door.",
};

export default async function ShopPage() {
  // Products are fetched client-side from /api/shop/catalog for category-tab filtering
  return (
    <div className="min-h-screen bg-cream-100 text-navy-900">
      {/* Top nav */}
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-card">
        <Link href="/portfolio" className="font-display text-2xl text-navy-900 tracking-tight">
          Pixelvo
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/portfolio" className="text-navy-700 hover:text-brand-700 px-3 py-2 transition">
            Portfolio
          </Link>
          <Link
            href="/book"
            className="bg-coral-500 hover:bg-coral-600 text-white px-4 py-2 rounded-full font-semibold shadow-card transition"
          >
            Book a session
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-coral-500 px-6 py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-300 via-transparent to-transparent" />
        <p className="relative text-brand-100 uppercase tracking-[0.3em] text-xs font-semibold">
          The Pixelvo Shop
        </p>
        <h1 className="relative text-white font-display text-4xl md:text-6xl mt-3 max-w-3xl mx-auto leading-tight">
          Turn Your Memories Into&nbsp;Treasures
        </h1>
        <p className="relative text-white/80 text-lg mt-4 max-w-2xl mx-auto">
          From digital downloads to printed canvas. Every product crafted from your holiday photos,
          delivered straight to your door.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="bg-white/15 text-white backdrop-blur-sm rounded-full px-4 py-2">
            🚀 Instant digital delivery
          </span>
          <span className="bg-white/15 text-white backdrop-blur-sm rounded-full px-4 py-2">
            🖼 Lab-quality prints
          </span>
          <span className="bg-white/15 text-white backdrop-blur-sm rounded-full px-4 py-2">
            🎁 Ships worldwide
          </span>
        </div>
      </header>

      {/* Client-side catalog with category tabs, product grid, cart */}
      <ShopClient />

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-300 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Pixelvo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/book" className="hover:text-white transition">Book</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-navy-400">© {new Date().getFullYear()} Pixelvo</div>
        </div>
      </footer>
    </div>
  );
}
