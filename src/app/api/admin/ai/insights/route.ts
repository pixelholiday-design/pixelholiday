import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
    const url = new URL(req.url);
    const includeDismissed = url.searchParams.get("dismissed") === "1";
    const insights = await prisma.aIInsight.findMany({
      where: includeDismissed ? {} : { actionTaken: false },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 50,
    });
    return NextResponse.json({ insights });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const patchSchema = z.object({ id: z.string().min(1), actionTaken: z.boolean() });

export async function PATCH(req: Request) {
  try {
    const me = await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const updated = await prisma.aIInsight.update({
      where: { id: parsed.data.id },
      data: { actionTaken: parsed.data.actionTaken, actionBy: me.email },
    });
    return NextResponse.json({ ok: true, insight: updated });
  } catch (e: any) {
    const g = handleGuardError(e);
    if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
