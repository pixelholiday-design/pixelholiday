import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  try {
    const fotiqoEmail = await prisma.fotiqoEmail.findFirst({
      where: { userId: user.id, isActive: true },
    });

    if (!fotiqoEmail) {
      return NextResponse.json({ count: 0 });
    }

    const count = await prisma.emailMessage.count({
      where: {
        fotiqoEmailId: fotiqoEmail.id,
        isRead: false,
        isDeleted: false,
        folder: "INBOX",
      },
    });

    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("Unread count error:", error);
    return NextResponse.json({ error: error.message || "Failed to get unread count" }, { status: 500 });
  }
}
