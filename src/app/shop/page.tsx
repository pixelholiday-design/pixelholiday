import Link from "next/link";
import { loadShopProducts, type ShopCategory } from "@/lib/shopProducts";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "PixelHoliday — Shop",
  description:
    "Buy your photos, prints, wall art, and digital passes from PixelHoliday. Delivered straight to your phone or door.",
};

const CATEGORY_ORDER: ShopCategory[] = ["DIGITAL", "PASSES", "PRINTS", "WALL_ART", "ADD_ONS"];

export default async function ShopPage() {
  const { byCategory, all } = await loadShopProducts();

  return (
    <div className="min-h-screen bg-cream-100 text-navy-900">
      {/* Top nav */}
      <nav className="bg-white border-b border-cream-300 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/portfolio" className="font-display text-2xl text-navy-900 tracking-tight">
          PixelHoliday
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
      <header className="bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300 px-6 py-16 text-center">
        <p className="text-brand-100 uppercase tracking-[0.3em] text-xs font-semibold">
          The shop
        </p>
        <h1 className="text-white font-display text-4xl md:text-6xl mt-3 max-w-3xl mx-auto leading-tight">
          Your memories, beautifully made
        </h1>
        <p className="text-white/85 text-lg mt-4 max-w-2xl mx-auto">
          From single downloads to printed canvas. {all.length} products, transparent pricing, instant delivery.
        </p>
      </header>

      {all.length === 0 ? (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <p className="text-navy-500">
            Our shop is being restocked. Please check back soon, or{" "}
            <Link href="/book" className="text-brand-700 font-semibold hover:underline">
              book a session
            </Link>{" "}
            in the meantime.
          </p>
        </div>
      ) : (
        <ShopClient byCategory={byCategory} categories={CATEGORY_ORDER} />
      )}

      {/* Footer */}
      <footer className="bg-navy-900 text-navy-300 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">PixelHoliday</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/book" className="hover:text-white transition">Book</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-navy-400">© {new Date().getFullYear()} PixelHoliday</div>
        </div>
      </footer>
    </div>
  );
}
