export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";

export async function GET() {
  try {
    const me = await requireStaff();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [galleries, nextAppt, commissions, user] = await Promise.all([
      prisma.gallery.findMany({
        where: { photographerId: me.id, createdAt: { gte: todayStart } },
        include: { photos: { select: { id: true } }, order: { select: { amount: true } } },
      }),
      prisma.appointment.findFirst({
        where: {
          assignedPhotographerId: me.id,
          scheduledTime: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { scheduledTime: "asc" },
        include: {
          gallery: { include: { customer: true, location: { select: { name: true } } } },
        },
      }),
      prisma.commission.findMany({
        where: {
          userId: me.id,
          month: monthStart.toISOString().slice(0, 7),
        },
      }),
      prisma.user.findUnique({
        where: { id: me.id },
        select: { salary: true },
      }),
    ]);

    const photosToday = galleries.reduce((s, g) => s + g.photos.length, 0);
    const revenueToday = galleries.reduce((s, g) => s + (g.order?.amount || 0), 0);
    const appointmentsToday = galleries.filter((g) => g.order).length;

    // Targets — hardcoded baseline, could be pulled from location config.
    const targets = {
      appointments: 4,
      photos: 50,
      revenue: 200,
    };

    const commissionsTotal = commissions.reduce((s, c) => s + c.amount, 0);
    const attendanceBonus = commissions.filter((c) => c.type === "ATTENDANCE_BONUS").reduce((s, c) => s + c.amount, 0);
    const baseSalary = user?.salary ?? 0;

    return NextResponse.json({
      targets,
      progress: {
        appointmentsToday,
        photosToday,
        revenueToday,
      },
      nextAppointment: nextAppt
        ? {
            id: nextAppt.id,
            time: nextAppt.scheduledTime,
            locationName: nextAppt.gallery?.location?.name,
            customer: nextAppt.gallery?.customer?.name ?? "Customer",
            roomNumber: nextAppt.gallery?.roomNumber,
            tipHint: null,
          }
        : null,
      earnings: {
        baseSalary,
        commissions: commissionsTotal,
        attendanceBonus,
        total: baseSalary + commissionsTotal,
      },
    });
  } catch (e) {
    return handleGuardError(e) ?? NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
