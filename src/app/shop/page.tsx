import Link from "next/link";
import ShopClient from "./ShopClient";
import { STATIC_PRODUCTS, type StaticProduct } from "@/lib/staticProducts";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Fotiqo Shop — Premium Photo Products",
  description:
    "Prints, wall art, photo books, gifts and digital downloads. Lab-quality products delivered to your door.",
};

/* ── Server-side catalog builder (same logic as /api/shop/catalog) ── */
const CATEGORY_META: Record<string, { label: string; blurb: string; icon: string }> = {
  PRINTS:    { label: "Prints",            blurb: "Lab-quality photo prints on premium paper.",              icon: "Image" },
  WALL_ART:  { label: "Wall Art",          blurb: "Canvas, metal, acrylic, and framed art for your walls.", icon: "Frame" },
  ALBUMS:    { label: "Albums & Books",    blurb: "Photo books and layflat albums to treasure forever.",     icon: "Book" },
  CARDS:     { label: "Cards",             blurb: "Greeting cards, postcards, and personalized stationery.", icon: "Mail" },
  DIGITAL:   { label: "Digital Downloads", blurb: "High-res files delivered instantly to your device.",      icon: "Download" },
  PACKAGES:  { label: "Packages",          blurb: "Curated bundles — prints, wall art, and digital.",        icon: "Package" },
  GIFTS:     { label: "Gifts & Souvenirs", blurb: "Mugs, puzzles, ornaments, and personalized keepsakes.",   icon: "Gift" },
  OTHERS:    { label: "Extras",            blurb: "Video reels, retouching, and custom products.",            icon: "Star" },
  PRINT:     { label: "Prints",            blurb: "Lab-quality photo prints.",                              icon: "Image" },
  PHOTO_BOOK:{ label: "Albums & Books",    blurb: "Photo books and albums.",                                icon: "Book" },
  GIFT:      { label: "Gifts",             blurb: "Photo gifts and keepsakes.",                              icon: "Gift" },
  CARD:      { label: "Cards",             blurb: "Cards and stationery.",                                   icon: "Mail" },
};
const CATEGORY_ORDER = ["PRINTS", "WALL_ART", "ALBUMS", "CARDS", "DIGITAL", "PACKAGES", "GIFTS", "OTHERS"];

function buildCatalog(products: StaticProduct[]) {
  const byCategory: Record<string, StaticProduct[]> = {};
  for (const p of products) {
    const cat = p.category ?? "OTHERS";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const c of CATEGORY_ORDER) {
    if (!seen.has(c) && (byCategory[c]?.length ?? 0) > 0) { categories.push(c); seen.add(c); }
  }
  for (const c of Object.keys(byCategory)) {
    if (!seen.has(c)) { categories.push(c); seen.add(c); }
  }
  return { products, byCategory, categories, categoryMeta: CATEGORY_META };
}

async function getServerCatalog() {
  // Try DB first
  try {
    const { prisma } = await import("@/lib/db");
    const dbProducts = await prisma.shopProduct.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { isFeatured: "desc" }, { name: "asc" }],
    });
    if (dbProducts.length > 0) return buildCatalog(dbProducts as unknown as StaticProduct[]);
  } catch { /* DB unavailable */ }
  // Fallback: static catalog
  const sorted = [...STATIC_PRODUCTS]
    .filter((p) => p.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name));
  return buildCatalog(sorted);
}

export default async function ShopPage() {
  const catalog = await getServerCatalog();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0C2E3D]">
      {/* ── Top nav ─────────────────────────────────────── */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="font-display text-2xl text-[#0C2E3D] tracking-tight">
          Fotiqo
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/portfolio" className="text-gray-500 hover:text-[#0C2E3D] px-3 py-2 transition font-medium">
            Portfolio
          </Link>
          <Link href="/shop/gift-cards" className="text-gray-500 hover:text-[#0C2E3D] px-3 py-2 transition font-medium">
            Gift Cards
          </Link>
        </div>
      </nav>

      {/* ── Hero (compact) ──────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 px-6 py-12 md:py-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-[#0C2E3D] leading-tight">
          Photo Products
        </h1>
        <p className="text-gray-500 text-base md:text-lg mt-3 max-w-xl mx-auto">
          Premium prints, stunning wall art, albums, and personalized gifts — delivered worldwide.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Lab-quality prints</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Ships worldwide</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />Secure checkout</span>
        </div>
      </header>

      {/* ── Product catalog (pre-loaded from server) ────── */}
      <ShopClient initialCatalog={catalog as any} />

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-[#0C2E3D] text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white font-display text-xl">Fotiqo</div>
          <div className="flex gap-6 text-sm">
            <Link href="/portfolio" className="hover:text-white transition">Portfolio</Link>
            <Link href="/shop" className="hover:text-white transition">Shop</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
          <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Fotiqo</div>
        </div>
      </footer>
    </div>
  );
}
