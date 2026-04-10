import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** POST /api/suggestions/[id]/upvote — Upvote a suggestion */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const suggestion = await prisma.suggestion.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } },
      select: { id: true, upvotes: true },
    });
    return NextResponse.json({ ok: true, upvotes: suggestion.upvotes });
  } catch {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }
}
