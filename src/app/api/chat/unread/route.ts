export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { visibleChannelsFor } from "@/lib/chat";

export async function GET() {
  try {
    const user = await requireStaff();
    const channels = await visibleChannelsFor(user);

    let total = 0;
    const perChannel: Record<string, number> = {};
    for (const c of channels) {
      const lastReadAt = c.members[0]?.lastReadAt ?? new Date(0);
      const count = await prisma.chatMessage.count({
        where: { channelId: c.id, createdAt: { gt: lastReadAt }, senderId: { not: user.id } },
      });
      perChannel[c.id] = count;
      total += count;
    }
    return NextResponse.json({ total, perChannel });
  } catch (err) {
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
