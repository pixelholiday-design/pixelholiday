import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ messages: [] });
  const messages = await prisma.chatMessage.findMany({
    where: { channelId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const { senderId, channelId, content } = await req.json();
  const message = await prisma.chatMessage.create({
    data: { senderId, channelId, content },
    include: { sender: true },
  });
  return NextResponse.json({ message });
}
