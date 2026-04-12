import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "INBOX";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    // Find user's FotiqoEmail
    const fotiqoEmail = await prisma.fotiqoEmail.findFirst({
      where: { userId: user.id, isActive: true },
    });
    if (!fotiqoEmail) {
      return NextResponse.json({ error: "No Fotiqo email found. Set up your email first." }, { status: 404 });
    }

    // Build where clause
    const where: any = {
      fotiqoEmailId: fotiqoEmail.id,
      folder,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { fromAddress: { contains: search, mode: "insensitive" } },
      ];
    }

    // Query messages and count in parallel
    const [messages, total, unreadCount] = await Promise.all([
      prisma.emailMessage.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.emailMessage.count({ where }),
      prisma.emailMessage.count({
        where: {
          fotiqoEmailId: fotiqoEmail.id,
          folder: "INBOX",
          isRead: false,
          isDeleted: false,
        },
      }),
    ]);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    });
  } catch (error: any) {
    console.error("Inbox fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch inbox" }, { status: 500 });
  }
}
