import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { helpful } = await req.json();
    await prisma.helpArticle.update({
      where: { id: params.id },
      data: helpful ? { helpfulYes: { increment: 1 } } : { helpfulNo: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
