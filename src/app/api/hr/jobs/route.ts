import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return NextResponse.json({ jobs });
}

const createSchema = z.object({
  title: z.string().min(1),
  locationId: z.string().optional().nullable(),
  requirements: z.string().optional().default(""),
  description: z.string().optional(), // accept legacy "description" field too
  status: z.enum(["OPEN", "FILLED", "CLOSED"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const job = await prisma.jobPosting.create({
      data: {
        title: parsed.data.title,
        locationId: parsed.data.locationId || null,
        requirements: parsed.data.requirements || parsed.data.description || "",
        status: parsed.data.status || "OPEN",
      },
    });
    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  locationId: z.string().optional().nullable(),
  requirements: z.string().optional(),
  status: z.enum(["OPEN", "FILLED", "CLOSED"]).optional(),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const { id, ...data } = parsed.data;
  try {
    const job = await prisma.jobPosting.update({ where: { id }, data });
    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  try {
    await prisma.jobPosting.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}
