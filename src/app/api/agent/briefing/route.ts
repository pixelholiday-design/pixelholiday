import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  // Determine agent type
  let agentType = "photographer";
  let org: any = null;
  try {
    org = await prisma.organization.findUnique({ where: { id: orgId } });
  } catch { /* */ }

  if (org) {
    if (role === "CEO" && org.type === "HEADQUARTERS") {
      agentType = "admin";
    } else if ((role === "CEO" || role === "OPERATIONS_MANAGER") && org.type === "VENUE_COMPANY") {
      agentType = "company";
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (agentType === "photographer") {
    let galleries = 0, pendingBookings = 0, completedOrders = 0, pendingInvoices = 0;
    try { galleries = await prisma.gallery.count({ where: { location: { orgId } } }); } catch { /* */ }
    try { pendingBookings = await prisma.appointment.count({ where: { gallery: { location: { orgId } }, status: { in: ["PENDING", "CONFIRMED"] } } }); } catch { /* */ }
    try { completedOrders = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "COMPLETED" } }); } catch { /* */ }
    try { pendingInvoices = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "PENDING" } }); } catch { /* */ }

    const stats = { galleries, pendingBookings, completedOrders, pendingInvoices };
    const briefing = `Good morning! Here's your daily briefing:\n\n` +
      `- You have ${galleries} total galleries\n` +
      `- ${pendingBookings} pending bookings awaiting confirmation\n` +
      `- ${completedOrders} completed orders\n` +
      `- ${pendingInvoices} pending invoices to follow up on\n\n` +
      (pendingBookings > 0 ? `Priority: Confirm your ${pendingBookings} pending booking(s) today.` : `No urgent items. Focus on marketing and client outreach.`);

    return NextResponse.json({ briefing, stats, agentType });
  }

  if (agentType === "company") {
    let destinations = 0, staffToday = 0, revenueToday = 0, alerts = 0;
    try { destinations = await prisma.destination.count({ where: { organizationId: orgId } }); } catch { /* */ }
    try {
      staffToday = await prisma.shift.count({
        where: {
          user: { orgId },
          date: { gte: today, lt: new Date(today.getTime() + 86400000) },
        },
      });
    } catch { /* */ }
    try {
      const todayOrders = await prisma.order.aggregate({
        where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: today } },
        _sum: { amount: true },
      });
      revenueToday = todayOrders._sum.amount || 0;
    } catch { /* */ }

    const stats = { destinations, staffToday, revenueToday, alerts };
    const briefing = `Daily Operations Briefing:\n\n` +
      `- ${destinations} active destinations\n` +
      `- ${staffToday} staff members on shift today\n` +
      `- €${revenueToday.toFixed(2)} revenue today\n` +
      `- ${alerts} alerts requiring attention`;

    return NextResponse.json({ briefing, stats, agentType });
  }

  // Admin
  let totalUsers = 0, totalRevenue = 0, newSignups = 0, activeVenues = 0;
  try { totalUsers = await prisma.user.count(); } catch { /* */ }
  try {
    const rev = await prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } });
    totalRevenue = rev._sum.amount || 0;
  } catch { /* */ }
  try { newSignups = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } }); } catch { /* */ }
  try { activeVenues = await prisma.organization.count({ where: { type: "VENUE_COMPANY" } }); } catch { /* */ }

  const stats = { totalUsers, totalRevenue, newSignups, activeVenues };
  const briefing = `Platform Briefing:\n\n` +
    `- ${totalUsers} total users on platform\n` +
    `- €${totalRevenue.toFixed(2)} total revenue\n` +
    `- ${newSignups} new signups this week\n` +
    `- ${activeVenues} active venue companies\n\n` +
    `Focus: ${newSignups > 0 ? `Welcome and onboard ${newSignups} new user(s).` : `Drive user acquisition this week.`}`;

  return NextResponse.json({ briefing, stats, agentType });
}
