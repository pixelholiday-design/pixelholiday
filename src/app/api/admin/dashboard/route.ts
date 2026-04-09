export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId") || undefined;
  const division = url.searchParams.get("division") || undefined; // LUXURY | SPLASH | ATTRACTION

  // Resolve division → list of matching location ids (only when no specific locationId is set)
  let divisionLocationIds: string[] | undefined;
  if (division && !locationId) {
    const divLocations = await prisma.location.findMany({
      where: { locationType: division },
      select: { id: true },
    });
    divisionLocationIds = divLocations.map((l) => l.id);
  }

  const orderWhere: any = { status: "COMPLETED" };
  const galleryWhere: any = {};
  const userGalleryWhere: any = {};
  if (locationId) {
    orderWhere.gallery = { locationId };
    galleryWhere.locationId = locationId;
    userGalleryWhere.locationId = locationId;
  } else if (divisionLocationIds && divisionLocationIds.length > 0) {
    orderWhere.gallery = { locationId: { in: divisionLocationIds } };
    galleryWhere.locationId = { in: divisionLocationIds };
    userGalleryWhere.locationId = { in: divisionLocationIds };
  }

  let orders: any[];
  try {
    orders = await prisma.order.findMany({ where: orderWhere, include: { gallery: { include: { location: true, photographer: true } } } });
  } catch {
    orders = await prisma.order.findMany({
      where: orderWhere,
      select: {
        id: true, amount: true, status: true, isAutomatedSale: true, galleryId: true, createdAt: true,
        gallery: { select: { id: true, locationId: true, photographerId: true, location: { select: { id: true, name: true, type: true } }, photographer: { select: { id: true, name: true } } } },
      },
    });
  }

  // Each query wrapped individually — any missing column fails gracefully
  const safeQuery = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try { return await fn(); } catch { return fallback; }
  };

  const [galleries, locations, users, commissions, equipment, passes] = await Promise.all([
    safeQuery(() => prisma.gallery.findMany({
      where: galleryWhere,
      select: { id: true, status: true, locationId: true, photographerId: true, totalCount: true, purchasedCount: true, createdAt: true,
        photographer: { select: { id: true, name: true } }, location: { select: { id: true, name: true, type: true } },
        order: { select: { id: true, status: true, amount: true } } },
    }), []),
    safeQuery(() => prisma.location.findMany({
      where: division ? { locationType: division } : {},
      select: { id: true, name: true, type: true },
    }), []),
    safeQuery(() => prisma.user.findMany({
      where: { role: "PHOTOGRAPHER" },
      select: { id: true, name: true, galleries: { where: userGalleryWhere, select: { id: true, totalCount: true, purchasedCount: true } } },
    }), []),
    safeQuery(() => prisma.commission.findMany({
      where: { isPaid: false },
      select: { id: true, amount: true },
    }), []),
    safeQuery(() => prisma.equipment.findMany({
      select: { id: true, purchaseCost: true },
    }), []),
    safeQuery(() => prisma.customer.count({ where: { hasDigitalPass: true } }), 0),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const pendingPayouts = commissions.reduce((s, c) => s + c.amount, 0);

  const revenueByLocation = locations.map((loc) => ({
    id: loc.id,
    name: loc.name,
    type: loc.type,
    revenue: orders.filter((o) => o.gallery.locationId === loc.id).reduce((s, o) => s + o.amount, 0),
  }));

  const conversion = {
    uploaded: galleries.length,
    sold: galleries.filter((g) => g.order && g.order.status === "COMPLETED").length,
  };

  const photographerStats = users.map((u) => {
    const uploaded = u.galleries.length;
    const sold = u.galleries.filter((g: any) => g.totalCount > 0 && g.purchasedCount > 0).length;
    const rate = uploaded > 0 ? sold / uploaded : 0;
    return { id: u.id, name: u.name, uploaded, sold, conversionRate: rate, flagged: rate < 0.2 && uploaded > 0 };
  });

  const automatedSales = orders.filter((o) => o.isAutomatedSale);
  const manualSales = orders.filter((o) => !o.isAutomatedSale);
  const salesBreakdown = {
    automated: { count: automatedSales.length, revenue: automatedSales.reduce((s, o) => s + o.amount, 0) },
    manual: { count: manualSales.length, revenue: manualSales.reduce((s, o) => s + o.amount, 0) },
  };

  const passCount = typeof passes === "number" ? passes : (passes as any[]).length;
  const digitalPasses = {
    count: passCount,
    revenue: passCount * 150,
  };

  const equipmentCost = equipment.reduce((s, e) => s + (e.purchaseCost || 0), 0);

  return NextResponse.json({
    totalRevenue,
    pendingPayouts,
    revenueByLocation,
    conversion,
    photographerStats,
    salesBreakdown,
    digitalPasses,
    equipmentCost,
  });
  } catch (e: any) {
    console.error("admin/dashboard error", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
