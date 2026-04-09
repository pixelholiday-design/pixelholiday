import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || undefined;

  const entries = await prisma.academyProgress.findMany({
    where: userId ? { userId } : {},
    orderBy: { completedAt: "desc" },
  });

  // Aggregate by user
  const byUser: Record<string, any> = {};
  for (const e of entries) {
    if (!byUser[e.userId]) {
      byUser[e.userId] = { userId: e.userId, completed: 0, totalScore: 0, modules: [] };
    }
    if (e.completed) byUser[e.userId].completed++;
    byUser[e.userId].totalScore += e.score || 0;
    byUser[e.userId].modules.push(e);
  }

  return NextResponse.json({ entries, byUser });
}

export async function POST(req: Request) {
  const body = await req.json();

  // AcademyProgress has no composite unique in the schema, so we find-then-update or create.
  const existing = body.userId && body.moduleId
    ? await prisma.academyProgress.findFirst({
        where: { userId: body.userId, moduleId: body.moduleId },
      })
    : null;

  let entry;
  if (existing) {
    entry = await prisma.academyProgress.update({
      where: { id: existing.id },
      data: {
        completed: !!body.completed,
        completedAt: body.completed ? new Date() : null,
        score: body.score ?? null,
      },
    });
  } else {
    entry = await prisma.academyProgress.create({
      data: {
        userId: body.userId,
        moduleId: body.moduleId,
        completed: !!body.completed,
        completedAt: body.completed ? new Date() : null,
        score: body.score ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true, entry });
}
