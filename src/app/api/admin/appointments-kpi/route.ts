export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const buildStats = async (since: Date) => {
    const appts = await prisma.appointment.count({ where: { scheduledTime: { gte: since } } });
    const outcomes = await prisma.appointmentOutcome.findMany({
      where: { createdAt: { gte: since } },
    });
    const arrived = outcomes.filter((o) => o.didArrive).length;
    const bought = outcomes.filter((o) => o.didBuy).length;
    const revenue = outcomes.reduce((s, o) => s + (o.orderAmount ?? 0), 0);
    return { approaches: appts, bookings: appts, arrivals: arrived, sales: bought, revenue };
  };

  return NextResponse.json({
    today: await buildStats(today),
    week: await buildStats(weekAgo),
    month: await buildStats(monthAgo),
  });
}
