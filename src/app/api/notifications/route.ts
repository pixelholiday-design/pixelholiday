import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Aggregate notifications from multiple sources
    const [recentOrders, unreadMessages, activeInsights] = await Promise.all([
      // Recent orders (last 24h)
      prisma.order.findMany({
        where: { createdAt: { gte: dayAgo }, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: { select: { name: true } } },
      }),
      // Recent chat messages (last 24h, not from system)
      prisma.chatMessage.findMany({
        where: { createdAt: { gte: dayAgo } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { sender: { select: { name: true } } },
      }),
      // Unresolved AI insights
      (prisma as any).aIInsight
        ? (prisma as any).aIInsight.findMany({
            where: { actionTaken: false },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    const notifications = [
      ...recentOrders.map((o: any) => ({
        id: `order-${o.id}`,
        type: "order" as const,
        title: `New sale — €${o.amount?.toFixed(2) || "0.00"}`,
        body: o.customer?.name || "Guest purchase",
        href: "/admin/store/orders",
        createdAt: o.createdAt.toISOString(),
      })),
      ...unreadMessages.map((m: any) => ({
        id: `chat-${m.id}`,
        type: "chat" as const,
        title: m.sender?.name || "Team message",
        body: (m.content || "").slice(0, 80),
        href: "/admin/chat",
        createdAt: m.createdAt.toISOString(),
      })),
      ...(activeInsights || []).map((i: any) => ({
        id: `insight-${i.id}`,
        type: "insight" as const,
        title: i.title || "AI Insight",
        body: (i.description || "").slice(0, 80),
        href: "/admin/ai-insights",
        createdAt: i.createdAt?.toISOString() || now.toISOString(),
      })),
    ];

    // Sort by time desc, take top 15
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ notifications: notifications.slice(0, 15) });
  } catch (err) {
    console.error("[Notifications API]", err);
    return NextResponse.json({ notifications: [] });
  }
}
