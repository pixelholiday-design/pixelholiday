import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/guards";

/**
 * Returns IDs of channels the user can see.
 * - CEO / OPERATIONS_MANAGER: all channels
 * - Supervisor: their location + ROLE channels + announcements + any explicit memberships
 * - Photographer / other staff: ONLY their location + explicit memberships + announcements
 */
export async function visibleChannelsFor(user: SessionUser) {
  if (user.role === "CEO" || user.role === "OPERATIONS_MANAGER") {
    return prisma.chatChannel.findMany({
      include: {
        location: true,
        members: { where: { userId: user.id }, take: 1 },
        _count: { select: { messages: true, members: true } },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  // fetch user's locationId
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { locationId: true } });

  return prisma.chatChannel.findMany({
    where: {
      OR: [
        { type: "ANNOUNCEMENT" },
        ...(dbUser?.locationId ? [{ type: "LOCATION" as const, locationId: dbUser.locationId }] : []),
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      location: true,
      members: { where: { userId: user.id }, take: 1 },
      _count: { select: { messages: true, members: true } },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}

export async function canAccessChannel(user: SessionUser, channelId: string): Promise<boolean> {
  if (user.role === "CEO" || user.role === "OPERATIONS_MANAGER") return true;
  const channel = await prisma.chatChannel.findUnique({
    where: { id: channelId },
    include: { members: { where: { userId: user.id }, take: 1 } },
  });
  if (!channel) return false;
  if (channel.type === "ANNOUNCEMENT") return true;
  if (channel.members.length > 0) return true;
  if (channel.type === "LOCATION" && channel.locationId) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { locationId: true } });
    return dbUser?.locationId === channel.locationId;
  }
  return false;
}
