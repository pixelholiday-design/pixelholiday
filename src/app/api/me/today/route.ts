export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";

export async function GET() {
  try {
    const me = await requireStaff();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [galleries, appointments, commissions, user, xpLogs] = await Promise.all([
      prisma.gallery.findMany({
        where: { photographerId: me.id, createdAt: { gte: todayStart } },
        include: { photos: { select: { id: true } }, order: { select: { amount: true } } },
      }),
      prisma.appointment.findMany({
        where: {
          assignedPhotographerId: me.id,
          scheduledTime: { gte: todayStart, lte: todayEnd },
        },
        include: {
          gallery: {
            include: {
              customer: { select: { name: true, roomNumber: true } },
              location: { select: { name: true } },
            },
          },
        },
        orderBy: { scheduledTime: "asc" },
      }),
      prisma.commission.findMany({
        where: {
          userId: me.id,
          month: monthStart.toISOString().slice(0, 7),
        },
      }),
      prisma.user.findUnique({
        where: { id: me.id },
        select: { salary: true, streakDays: true, xp: true },
      }),
      prisma.xpLog.findMany({
        where: { userId: me.id, createdAt: { gte: todayStart } },
        select: { amount: true },
      }),
    ]);

    const photosToday = galleries.reduce((s, g) => s + g.photos.length, 0);
    const revenueToday = galleries.reduce((s, g) => s + (g.order?.amount || 0), 0);
    const xpToday = xpLogs.reduce((s, l) => s + l.amount, 0);

    // Targets
    const targets = { appointments: 4, photos: 50, revenue: 200 };

    const commissionsTotal = commissions.reduce((s, c) => s + c.amount, 0);
    const attendanceBonus = commissions
      .filter((c) => c.type === "ATTENDANCE_BONUS")
      .reduce((s, c) => s + c.amount, 0);
    const baseSalary = user?.salary ?? 0;

    // Coaching tips (rotate daily)
    const tips = [
      "Great work! Try capturing more candid moments to increase hook scores.",
      "Your sharpness scores are strong. Focus on creative compositions today!",
      "Capture burst sequences to generate Auto-Reels — they sell at 30 TND!",
      "Try the Magic Shot AR overlay to upsell customers at 20 TND each.",
      "Early morning and sunset light produce the highest-rated photos.",
    ];
    const tipIdx = Math.floor(Date.now() / 86400000) % tips.length;

    // Next appointment
    const now = new Date();
    const nextAppt = appointments.find((a) => new Date(a.scheduledTime) > now);

    return NextResponse.json({
      // Schedule tab data
      appointments: appointments.map((a) => ({
        id: a.id,
        scheduledTime: a.scheduledTime.toISOString(),
        status: a.status,
        gallery: a.gallery,
        source: a.source,
      })),

      // Stats tab data
      stats: {
        xpToday,
        xpGoal: 500,
        photosToday,
        bookingsToday: appointments.length,
        revenueToday: Math.round(revenueToday),
        streak: user?.streakDays || 0,
        coachingTip: tips[tipIdx],
      },

      // Legacy fields for existing dashboard
      targets,
      progress: {
        appointmentsToday: appointments.filter((a) => a.status === "COMPLETED").length,
        photosToday,
        revenueToday,
      },
      nextAppointment: nextAppt
        ? {
            id: nextAppt.id,
            time: nextAppt.scheduledTime,
            locationName: (nextAppt.gallery as any)?.location?.name,
            customer: (nextAppt.gallery as any)?.customer?.name ?? "Customer",
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
