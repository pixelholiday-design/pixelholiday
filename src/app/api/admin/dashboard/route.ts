export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";

export async function GET(req: Request) {
  try {
  const user = await requireStaff();
  const orgId = user.orgId;

  const url = new URL(req.url);
  const locationId = url.searchParams.get("locationId") || undefined;
  const division = url.searchParams.get("division") || undefined; // LUXURY | SPLASH | ATTRACTION

  // Get all location IDs belonging to this user's organization
  const orgLocations = await prisma.location.findMany({
    where: { orgId },
    select: { id: true, name: true, type: true, locationType: true },
  });
  const orgLocationIds = orgLocations.map((l) => l.id);

  // Resolve division → list of matching location ids within this org
  let divisionLocationIds: string[] | undefined;
  if (division && !locationId) {
    divisionLocationIds = orgLocations
      .filter((l) => l.locationType === division)
      .map((l) => l.id);
  }

  // Build scoped filters — always within this org's locations
  const scopedLocationIds = locationId
    ? [locationId].filter((id) => orgLocationIds.includes(id)) // only if it belongs to this org
    : divisionLocationIds && divisionLocationIds.length > 0
      ? divisionLocationIds
      : orgLocationIds;

  const orderWhere: any = {
    status: "COMPLETED",
    gallery: { locationId: { in: scopedLocationIds } },
  };
  const galleryWhere: any = { locationId: { in: scopedLocationIds } };
  const userGalleryWhere: any = { locationId: { in: scopedLocationIds } };

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

  // Filter locations for display — use division filter or all org locations
  const displayLocations = division
    ? orgLocations.filter((l) => l.locationType === division)
    : orgLocations;

  const [galleries, users, commissions, equipment, passes] = await Promise.all([
    safeQuery(() => prisma.gallery.findMany({
      where: galleryWhere,
      select: { id: true, status: true, locationId: true, photographerId: true, totalCount: true, purchasedCount: true, createdAt: true,
        photographer: { select: { id: true, name: true } }, location: { select: { id: true, name: true, type: true } },
        order: { select: { id: true, status: true, amount: true } } },
    }), []),
    safeQuery(() => prisma.user.findMany({
      where: { role: "PHOTOGRAPHER", orgId },
      select: { id: true, name: true, galleries: { where: userGalleryWhere, select: { id: true, totalCount: true, purchasedCount: true } } },
    }), []),
    safeQuery(() => prisma.commission.findMany({
      where: { isPaid: false, user: { orgId } },
      select: { id: true, amount: true },
    }), []),
    safeQuery(() => prisma.equipment.findMany({
      where: { locationId: { in: orgLocationIds } },
      select: { id: true, purchaseCost: true },
    }), []),
    safeQuery(() => prisma.customer.count({ where: { hasDigitalPass: true, locationId: { in: orgLocationIds } } }), 0),
  ]);

  const totalGross = orders.reduce((s, o) => s + o.amount, 0);
  const totalStripeFees = orders.reduce((s, o) => s + (o.stripeFee ?? 0), 0);
  const totalTax = orders.reduce((s, o) => s + (o.taxAmount ?? 0), 0);
  const totalRevenue = Math.round((totalGross - totalStripeFees - totalTax) * 100) / 100;

  const giftCardOrders = orders.filter((o: any) => o.isGiftCardPurchase === true);
  const giftCardDeferred = giftCardOrders.reduce((s, o) => s + o.amount, 0);
  const recognizedRevenue = Math.round((totalRevenue - giftCardDeferred) * 100) / 100;

  const pendingPayouts = commissions.reduce((s, c) => s + c.amount, 0);

  const revenueByLocation = displayLocations.map((loc) => {
    const locOrders = orders.filter((o) => o.gallery.locationId === loc.id);
    const locGross = locOrders.reduce((s, o) => s + o.amount, 0);
    const locFees = locOrders.reduce((s, o) => s + (o.stripeFee ?? 0), 0);
    const locTax = locOrders.reduce((s, o) => s + (o.taxAmount ?? 0), 0);
    return {
      id: loc.id,
      name: loc.name,
      type: loc.type,
      gross: locGross,
      revenue: Math.round((locGross - locFees - locTax) * 100) / 100,
    };
  });

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
    totalGross,
    totalRevenue,
    recognizedRevenue,
    totalStripeFees,
    totalTax,
    giftCardDeferred,
    pendingPayouts,
    revenueByLocation,
    conversion,
    photographerStats,
    salesBreakdown,
    digitalPasses,
    equipmentCost,
  });
  } catch (e: any) {
    if (e?.status === 401) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("admin/dashboard error", e);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}
