export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export async function GET() {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 3600 * 1000);

    const locations = await prisma.location.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { staff: true } },
      },
    });

    const locData = await Promise.all(
      locations.map(async (loc) => {
        const [revAgg, gal] = await Promise.all([
          prisma.order.aggregate({
            _sum: { amount: true },
            where: {
              status: "COMPLETED",
              createdAt: { gte: todayStart },
              gallery: { locationId: loc.id },
            },
          }),
          prisma.gallery.findMany({
            where: { locationId: loc.id, createdAt: { gte: todayStart } },
            select: { purchasedCount: true },
          }),
        ]);
        const revenueToday = revAgg._sum.amount ?? 0;
        const revenuePct = loc.targetDailyRevenue
          ? Math.round((revenueToday / loc.targetDailyRevenue) * 100)
          : 100;
        const sold = gal.filter((g) => g.purchasedCount > 0).length;
        const captureRate = gal.length > 0 ? Math.round((sold / gal.length) * 100) : 0;
        return {
          id: loc.id,
          name: loc.name,
          revenueToday,
          revenuePct,
          captureRate,
          staffCount: loc._count.staff,
        };
      })
    );

    const shifts = await prisma.shift.findMany({
      where: { date: { gte: todayStart, lt: tomorrowStart } },
      include: { user: { select: { id: true, name: true, role: true, location: { select: { name: true } } } } },
    });
    const roster = shifts.map((s) => ({
      id: s.id,
      name: s.user.name,
      role: s.user.role,
      locationName: s.user.location?.name,
      absent: false, // future: wire to attendance
    }));

    return NextResponse.json({ locations: locData, rosterToday: roster });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
