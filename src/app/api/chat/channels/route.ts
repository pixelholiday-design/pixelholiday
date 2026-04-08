export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { visibleChannelsFor } from "@/lib/chat";

export async function GET() {
  try {
    const user = await requireStaff();
    const channels = await visibleChannelsFor(user);

    // unread counts per channel
    const channelsWithUnread = await Promise.all(
      channels.map(async (c) => {
        const member = c.members[0];
        const lastReadAt = member?.lastReadAt ?? new Date(0);
        const unread = await prisma.chatMessage.count({
          where: { channelId: c.id, createdAt: { gt: lastReadAt }, senderId: { not: user.id } },
        });
        const lastMessage = await prisma.chatMessage.findFirst({
          where: { channelId: c.id },
          orderBy: { createdAt: "desc" },
          include: { sender: { select: { id: true, name: true } } },
        });
        return {
          id: c.id,
          name: c.name,
          type: c.type,
          description: c.description,
          locationId: c.locationId,
          locationName: c.location?.name ?? null,
          role: c.role,
          isSystem: c.isSystem,
          memberCount: c._count.members,
          messageCount: c._count.messages,
          isMember: c.members.length > 0,
          unread,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                type: lastMessage.type,
                createdAt: lastMessage.createdAt,
                senderName: lastMessage.sender?.name ?? "System",
              }
            : null,
        };
      })
    );

    return NextResponse.json({ channels: channelsWithUnread });
  } catch (err) {
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaff();
    if (!["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await req.json();
    const { name, type, description, locationId, role, memberIds } = body as {
      name: string;
      type: "LOCATION" | "ROLE" | "DIRECT" | "ANNOUNCEMENT";
      description?: string;
      locationId?: string;
      role?: string;
      memberIds?: string[];
    };
    if (!name || !type) {
      return NextResponse.json({ error: "name and type required" }, { status: 400 });
    }
    const channel = await prisma.chatChannel.create({
      data: {
        name,
        type,
        description,
        locationId: locationId ?? null,
        role: role ?? null,
        members: memberIds?.length
          ? { create: memberIds.map((userId) => ({ userId })) }
          : undefined,
      },
    });
    return NextResponse.json({ channel });
  } catch (err) {
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
