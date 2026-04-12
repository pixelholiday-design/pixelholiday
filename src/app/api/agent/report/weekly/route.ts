import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any).orgId;
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

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  if (agentType === "photographer") {
    let galleriesThisWeek = 0, galleriesLastWeek = 0;
    let ordersThisWeek = 0, ordersLastWeek = 0;
    let revenueThisWeek = 0, revenueLastWeek = 0;
    let pendingBookings = 0;

    try { galleriesThisWeek = await prisma.gallery.count({ where: { location: { orgId }, createdAt: { gte: weekAgo } } }); } catch { /* */ }
    try { galleriesLastWeek = await prisma.gallery.count({ where: { location: { orgId }, createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }); } catch { /* */ }
    try { ordersThisWeek = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: weekAgo } } }); } catch { /* */ }
    try { ordersLastWeek = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }); } catch { /* */ }
    try {
      const rev = await prisma.order.aggregate({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: weekAgo } }, _sum: { amount: true } });
      revenueThisWeek = rev._sum.amount || 0;
    } catch { /* */ }
    try {
      const rev = await prisma.order.aggregate({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: twoWeeksAgo, lt: weekAgo } }, _sum: { amount: true } });
      revenueLastWeek = rev._sum.amount || 0;
    } catch { /* */ }
    try { pendingBookings = await prisma.appointment.count({ where: { gallery: { location: { orgId } }, status: { in: ["PENDING", "CONFIRMED"] } } }); } catch { /* */ }

    const galleryTrend = galleriesLastWeek > 0 ? ((galleriesThisWeek - galleriesLastWeek) / galleriesLastWeek * 100).toFixed(1) : "N/A";
    const revenueTrend = revenueLastWeek > 0 ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek * 100).toFixed(1) : "N/A";

    const stats = { galleriesThisWeek, galleriesLastWeek, ordersThisWeek, ordersLastWeek, revenueThisWeek, revenueLastWeek, pendingBookings };

    const suggestions: string[] = [];
    if (ordersThisWeek < ordersLastWeek) suggestions.push("Orders are down this week. Consider running a promotional campaign or following up with recent clients.");
    if (pendingBookings > 3) suggestions.push(`You have ${pendingBookings} pending bookings. Prioritize confirming them to avoid no-shows.`);
    if (galleriesThisWeek === 0) suggestions.push("No galleries uploaded this week. Schedule some shoots to keep momentum going.");

    const report = `Weekly Report\n` +
      `=============\n\n` +
      `Galleries: ${galleriesThisWeek} this week (${galleryTrend}% vs last week)\n` +
      `Orders: ${ordersThisWeek} completed (was ${ordersLastWeek} last week)\n` +
      `Revenue: €${revenueThisWeek.toFixed(2)} (${revenueTrend}% vs last week)\n` +
      `Pending Bookings: ${pendingBookings}\n\n` +
      (suggestions.length > 0 ? `Suggestions:\n${suggestions.map(s => `- ${s}`).join("\n")}` : `Great work this week! Keep the momentum going.`);

    return NextResponse.json({ report, stats, agentType });
  }

  if (agentType === "company") {
    let revenueThisWeek = 0, revenueLastWeek = 0;
    let ordersThisWeek = 0, staffCount = 0, destinations = 0;

    try {
      const rev = await prisma.order.aggregate({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: weekAgo } }, _sum: { amount: true } });
      revenueThisWeek = rev._sum.amount || 0;
    } catch { /* */ }
    try {
      const rev = await prisma.order.aggregate({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: twoWeeksAgo, lt: weekAgo } }, _sum: { amount: true } });
      revenueLastWeek = rev._sum.amount || 0;
    } catch { /* */ }
    try { ordersThisWeek = await prisma.order.count({ where: { gallery: { location: { orgId } }, status: "COMPLETED", createdAt: { gte: weekAgo } } }); } catch { /* */ }
    try { staffCount = await prisma.destinationStaff.count({ where: { destination: { organizationId: orgId } } }); } catch { /* */ }
    try { destinations = await prisma.destination.count({ where: { organizationId: orgId } }); } catch { /* */ }

    const revenueTrend = revenueLastWeek > 0 ? ((revenueThisWeek - revenueLastWeek) / revenueLastWeek * 100).toFixed(1) : "N/A";

    const stats = { revenueThisWeek, revenueLastWeek, ordersThisWeek, staffCount, destinations };

    const report = `Weekly Operations Report\n` +
      `========================\n\n` +
      `Revenue: €${revenueThisWeek.toFixed(2)} (${revenueTrend}% vs last week)\n` +
      `Orders Completed: ${ordersThisWeek}\n` +
      `Active Destinations: ${destinations}\n` +
      `Total Staff: ${staffCount}\n\n` +
      (revenueThisWeek < revenueLastWeek
        ? `Alert: Revenue declined this week. Review destination performance and staff scheduling.`
        : `Revenue is on track. Continue monitoring destination performance.`);

    return NextResponse.json({ report, stats, agentType });
  }

  // Admin
  let totalUsers = 0, newUsersThisWeek = 0, newUsersLastWeek = 0;
  let totalRevenue = 0, revenueThisWeek = 0;
  let activeVenues = 0, totalGalleries = 0;

  try { totalUsers = await prisma.user.count(); } catch { /* */ }
  try { newUsersThisWeek = await prisma.user.count({ where: { createdAt: { gte: weekAgo } } }); } catch { /* */ }
  try { newUsersLastWeek = await prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }); } catch { /* */ }
  try {
    const rev = await prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } });
    totalRevenue = rev._sum.amount || 0;
  } catch { /* */ }
  try {
    const rev = await prisma.order.aggregate({ where: { status: "COMPLETED", createdAt: { gte: weekAgo } }, _sum: { amount: true } });
    revenueThisWeek = rev._sum.amount || 0;
  } catch { /* */ }
  try { activeVenues = await prisma.organization.count({ where: { type: "VENUE_COMPANY" } }); } catch { /* */ }
  try { totalGalleries = await prisma.gallery.count(); } catch { /* */ }

  const userGrowthTrend = newUsersLastWeek > 0 ? ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek * 100).toFixed(1) : "N/A";

  const stats = { totalUsers, newUsersThisWeek, newUsersLastWeek, totalRevenue, revenueThisWeek, activeVenues, totalGalleries };

  const suggestions: string[] = [];
  if (newUsersThisWeek === 0) suggestions.push("No new users this week. Ramp up marketing and outreach efforts.");
  if (activeVenues < 5) suggestions.push("Focus on venue company acquisition to grow the platform.");

  const report = `Platform Weekly Report\n` +
    `======================\n\n` +
    `Total Users: ${totalUsers} (+${newUsersThisWeek} this week, ${userGrowthTrend}% growth)\n` +
    `Total Revenue: €${totalRevenue.toFixed(2)} (€${revenueThisWeek.toFixed(2)} this week)\n` +
    `Active Venue Companies: ${activeVenues}\n` +
    `Total Galleries: ${totalGalleries}\n\n` +
    (suggestions.length > 0 ? `Strategic Suggestions:\n${suggestions.map(s => `- ${s}`).join("\n")}` : `Platform is growing steadily. Maintain current trajectory.`);

  return NextResponse.json({ report, stats, agentType });
}
