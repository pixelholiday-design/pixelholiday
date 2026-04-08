export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { canAccessChannel } from "@/lib/chat";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireStaff();
    const channelId = params.id;
    if (!(await canAccessChannel(user, channelId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const take = Math.min(parseInt(searchParams.get("take") ?? "100", 10), 200);
    const messages = await prisma.chatMessage.findMany({
      where: { channelId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
      take,
    });

    // mark as read
    await prisma.chatMember.upsert({
      where: { channelId_userId: { channelId, userId: user.id } },
      update: { lastReadAt: new Date() },
      create: { channelId, userId: user.id, lastReadAt: new Date() },
    });

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[chat messages GET] failed:", err);
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireStaff();
    const channelId = params.id;
    if (!(await canAccessChannel(user, channelId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { content, type } = body as { content: string; type?: "TEXT" | "IMAGE" | "SYSTEM" | "ALERT" | "AI_TIP" };
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    // Announcements: only CEO/OPS can post
    const channel = await prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (channel?.type === "ANNOUNCEMENT" && !["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Only leadership can post announcements" }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        channelId,
        senderId: user.id,
        content: content.trim(),
        type: type ?? "TEXT",
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json({ message });
  } catch (err) {
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
