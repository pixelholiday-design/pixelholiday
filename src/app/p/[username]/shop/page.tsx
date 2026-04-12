import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({ where: { username } });
  return { title: profile ? `Shop — ${profile.businessName || username}` : "Shop" };
}

export default async function PhotographerShopPage({ params }: Props) {
  const { username } = await params;
  const profile = await prisma.photographerProfile.findUnique({
    where: { username },
    select: { userId: true, businessName: true, primaryColor: true, websiteTheme: true, username: true, logoUrl: true },
  });
  if (!profile) notFound();

  // Fetch shop products (shared catalog)
  const products = await prisma.shopProduct.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: 50,
  });

  const isDark = profile.websiteTheme === "dark" || profile.websiteTheme === "bold";
  const color = profile.primaryColor || "#0EA5A5";

  return (
    <div className={`min-h-screen ${isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-gray-900"}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-40 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-gray-100"}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/p/${username}`} className="flex items-center gap-2">
            {profile.logoUrl && <img src={profile.logoUrl} alt="" className="h-6 w-auto" />}
            <span className="font-bold">{profile.businessName || username}</span>
          </Link>
          <Link href={`/p/${username}`} className={`text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>&larr; Back to site</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">Shop</h1>
        <p className={`text-center mb-10 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>Prints, albums, and more — delivered to your door.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Link key={product.id} href={`/shop/${(product as any).slug || product.id}`} className="group">
              <div className={`aspect-square rounded-xl overflow-hidden mb-3 ${isDark ? "bg-zinc-900" : "bg-gray-100"}`}>
                {(product as any).imageUrl ? (
                  <img src={(product as any).imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (product as any).mockupUrl ? (
                  <img src={(product as any).mockupUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📷</div>
                )}
              </div>
              <h3 className="font-medium text-sm">{product.name}</h3>
              <p className="text-sm" style={{ color }}>From €{product.retailPrice.toFixed(2)}</p>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <p className={`text-center py-20 ${isDark ? "text-zinc-500" : "text-gray-400"}`}>No products available yet.</p>
        )}
      </div>
    </div>
  );
}
