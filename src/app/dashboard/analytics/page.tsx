import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Eye, Download, Heart, ShoppingCart, TrendingUp, Image } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login/photographer");
  const userId = (session.user as any).id;

  // Get galleries with stats
  const galleries = await prisma.gallery.findMany({
    where: { photographerId: userId },
    select: {
      id: true,
      magicLinkToken: true,
      status: true,
      createdAt: true,
      location: { select: { name: true } },
      customer: { select: { name: true } },
      _count: { select: { photos: true } },
      order: { select: { amount: true, status: true } },
      photos: {
        select: { isFavorited: true, isPurchased: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Aggregate stats
  const totalGalleries = galleries.length;
  const totalPhotos = galleries.reduce((s, g) => s + g._count.photos, 0);
  const totalFavorites = galleries.reduce((s, g) => s + g.photos.filter((p) => p.isFavorited).length, 0);
  const totalPurchased = galleries.reduce((s, g) => s + g.photos.filter((p) => p.isPurchased).length, 0);
  const totalRevenue = galleries.reduce((s, g) => s + (g.order?.status === "COMPLETED" ? g.order.amount || 0 : 0), 0);
  const paidGalleries = galleries.filter((g) => g.status === "PAID" || g.status === "DIGITAL_PASS").length;
  const conversionRate = totalGalleries > 0 ? Math.round((paidGalleries / totalGalleries) * 100) : 0;

  // Gallery view logs
  let totalViews = 0;
  try {
    totalViews = await prisma.galleryViewLog.count({
      where: { gallery: { photographerId: userId } },
    });
  } catch {}

  // Monthly revenue (last 6 months)
  const months: { label: string; revenue: number; galleries: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
    const monthGalleries = galleries.filter((g) => g.createdAt >= monthStart && g.createdAt <= monthEnd);
    const rev = monthGalleries.reduce((s, g) => s + (g.order?.status === "COMPLETED" ? g.order.amount || 0 : 0), 0);
    months.push({
      label: monthStart.toLocaleDateString("en", { month: "short" }),
      revenue: rev,
      galleries: monthGalleries.length,
    });
  }
  const maxRevenue = Math.max(...months.map((m) => m.revenue), 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy-900">Analytics</h1>
        <p className="text-navy-500 text-sm mt-1">Track gallery performance, views, and revenue</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Image, label: "Galleries", value: totalGalleries, color: "text-brand-500" },
          { icon: Eye, label: "Total views", value: totalViews, color: "text-blue-500" },
          { icon: Heart, label: "Favorites", value: totalFavorites, color: "text-coral-500" },
          { icon: TrendingUp, label: "Conversion", value: `${conversionRate}%`, color: "text-green-500" },
          { icon: Download, label: "Photos delivered", value: totalPurchased, color: "text-gold-500" },
          { icon: ShoppingCart, label: "Paid galleries", value: paidGalleries, color: "text-brand-500" },
          { icon: BarChart3, label: "Avg per gallery", value: totalGalleries > 0 ? `\u20ac${(totalRevenue / totalGalleries).toFixed(0)}` : "\u20ac0", color: "text-navy-500" },
          { icon: TrendingUp, label: "Total revenue", value: `\u20ac${totalRevenue.toFixed(0)}`, color: "text-green-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-4">
              <Icon className={`h-4 w-4 ${s.color} mb-2`} />
              <div className="font-display text-xl text-navy-900">{s.value}</div>
              <div className="text-xs text-navy-400">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Revenue chart (CSS-based) */}
      <div className="card p-6 mb-8">
        <h2 className="font-display text-lg text-navy-900 mb-4">Monthly Revenue</h2>
        <div className="flex items-end gap-2 h-40">
          {months.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <div className="text-xs text-navy-500 font-semibold">
                {m.revenue > 0 ? `\u20ac${m.revenue.toFixed(0)}` : ""}
              </div>
              <div
                className="w-full bg-brand-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                style={{ height: `${Math.max((m.revenue / maxRevenue) * 120, 4)}px` }}
              />
              <div className="text-xs text-navy-400">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-gallery breakdown */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-cream-50 border-b border-cream-200">
          <h2 className="font-semibold text-navy-900 text-sm">Gallery Performance</h2>
        </div>
        <div className="divide-y divide-cream-100">
          {galleries.slice(0, 20).map((g) => {
            const favs = g.photos.filter((p) => p.isFavorited).length;
            const rev = g.order?.status === "COMPLETED" ? g.order.amount || 0 : 0;
            return (
              <div key={g.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-navy-900 text-sm truncate">
                    {g.customer?.name || "Guest"} {g.location?.name ? `\u00b7 ${g.location.name}` : ""}
                  </div>
                  <div className="text-xs text-navy-400">
                    {g._count.photos} photos &middot; {favs} favorites &middot; {g.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    g.status === "PAID" ? "bg-green-100 text-green-700" :
                    g.status === "PREVIEW_ECOM" ? "bg-blue-100 text-blue-700" :
                    "bg-cream-200 text-navy-500"
                  }`}>
                    {g.status.replace("_", " ")}
                  </span>
                  {rev > 0 && <span className="font-display text-sm text-navy-900">&euro;{rev.toFixed(0)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
