import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** PUT /api/website/blocks/reorder — Batch update block order */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const blocks = body.blocks as { id: string; sortOrder: number }[];
  if (!blocks?.length) return NextResponse.json({ error: "No blocks" }, { status: 400 });

  for (const b of blocks) {
    await prisma.websiteBlock.update({ where: { id: b.id }, data: { sortOrder: b.sortOrder } });
  }

  return NextResponse.json({ ok: true, updated: blocks.length });
}
