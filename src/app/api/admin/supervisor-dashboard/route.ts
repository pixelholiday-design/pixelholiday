export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";

export async function GET(req: NextRequest) {
  try {
    const user = await requireStaff();
    const { searchParams } = new URL(req.url);
    let locationId = searchParams.get("locationId");
    if (!locationId) {
      const me = await prisma.user.findUnique({ where: { id: user.id }, select: { locationId: true } });
      locationId = me?.locationId ?? null;
    }
    if (!locationId) {
      return NextResponse.json({ error: "No location assigned" }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [location, ordersAgg, appointments, galleries, team, register, nextApp] = await Promise.all([
      prisma.location.findUnique({ where: { id: locationId } }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: {
          status: "COMPLETED",
          createdAt: { gte: todayStart },
          gallery: { locationId },
        },
      }),
      prisma.appointment.findMany({
        where: { locationId, scheduledTime: { gte: todayStart } },
        select: { status: true },
      }),
      prisma.gallery.findMany({
        where: { locationId, createdAt: { gte: todayStart } },
        select: { purchasedCount: true, photographerId: true, photos: { select: { id: true } } },
      }),
      prisma.user.findMany({
        where: { locationId, role: "PHOTOGRAPHER" },
        select: {
          id: true,
          name: true,
          galleries: {
            where: { createdAt: { gte: todayStart } },
            select: { purchasedCount: true, photos: { select: { id: true } }, order: { select: { amount: true } } },
          },
          zoneAssignments: {
            where: { endedAt: null },
            orderBy: { startedAt: "desc" },
            take: 1,
            select: { zoneName: true, startedAt: true },
          },
        },
      }),
      prisma.cashRegister.findFirst({
        where: { locationId, date: { gte: todayStart } },
        orderBy: { date: "desc" },
      }),
      prisma.appointment.findFirst({
        where: { locationId, status: { in: ["PENDING", "CONFIRMED"] }, scheduledTime: { gte: new Date() } },
        orderBy: { scheduledTime: "asc" },
        include: { assignedPhotographer: { select: { name: true } }, gallery: { include: { customer: true } } },
      }),
    ]);

    const revenueToday = ordersAgg._sum.amount ?? 0;
    const targetDaily = location?.targetDailyRevenue ?? 0;
    const revenuePct = targetDaily > 0 ? Math.round((revenueToday / targetDaily) * 100) : 100;

    const totalApp = appointments.length;
    const completedApp = appointments.filter((a) => a.status === "COMPLETED").length;
    const noShowApp = appointments.filter((a) => a.status === "NO_SHOW").length;

    const uploadedToday = galleries.length;
    const soldToday = galleries.filter((g) => g.purchasedCount > 0).length;
    const captureRate = uploadedToday > 0 ? Math.round((soldToday / uploadedToday) * 100) : 0;

    const teamMapped = team.map((p) => {
      const photos = p.galleries.reduce((s, g) => s + g.photos.length, 0);
      const sales = p.galleries.reduce((s, g) => s + (g.order?.amount || 0), 0);
      const sold = p.galleries.filter((g) => g.purchasedCount > 0).length;
      const conversionRate = p.galleries.length > 0 ? sold / p.galleries.length : 0;
      const z = p.zoneAssignments[0];
      const mins = z ? Math.floor((Date.now() - new Date(z.startedAt).getTime()) / 60000) : 0;
      const timeInZone = z ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "";
      const mood = conversionRate >= 0.6 ? "green" : conversionRate >= 0.4 ? "yellow" : "red";
      return {
        id: p.id,
        name: p.name,
        zone: z?.zoneName ?? null,
        timeInZone,
        photosToday: photos,
        salesToday: sales,
        conversionRate,
        mood,
      };
    });

    return NextResponse.json({
      location: { id: location?.id, name: location?.name },
      revenueToday,
      targetDailyRevenue: targetDaily,
      revenuePct,
      appointments: { total: totalApp, completed: completedApp, noShows: noShowApp },
      captureRate,
      targetCaptureRate: location?.targetCaptureRate ? Math.round(location.targetCaptureRate * 100) : null,
      cashBalance: register?.actualBalance ?? register?.expectedBalance ?? 0,
      cashRegisterStatus: register?.status ?? "CLOSED",
      team: teamMapped,
      nextAppointment: nextApp
        ? {
            customer: nextApp.gallery?.customer?.name || "Customer",
            time: new Date(nextApp.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            photographer: nextApp.assignedPhotographer?.name,
          }
        : null,
    });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
