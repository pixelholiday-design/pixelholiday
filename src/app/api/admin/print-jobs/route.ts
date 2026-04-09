import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { listPendingPrintJobs, markPrinted } from "@/lib/print";
import { requireStaff, handleGuardError } from "@/lib/guards";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();
    let jobs: any[] = [];
    try {
      jobs = await listPendingPrintJobs();
    } catch {
      // printJob table may not exist yet in this migration state — return empty list
      jobs = [];
    }
    return NextResponse.json({ jobs });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

const patchSchema = z.object({ id: z.string().min(1) });
export async function PATCH(req: Request) {
  try {
    const u = await requireStaff();
    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    const job = await markPrinted(parsed.data.id, u.email);
    return NextResponse.json({ ok: true, job });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
