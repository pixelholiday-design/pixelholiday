export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, handleGuardError } from "@/lib/guards";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireStaff();
    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }
    const existing = await prisma.chatMessage.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.senderId !== user.id && !["CEO", "OPERATIONS_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = await prisma.chatMessage.update({
      where: { id: params.id },
      data: { content: content.trim(), edited: true },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
    return NextResponse.json({ message });
  } catch (err) {
    return handleGuardError(err) ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
