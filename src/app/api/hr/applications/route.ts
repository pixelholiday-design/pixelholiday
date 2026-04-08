import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const STATUSES = ["RECEIVED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED"] as const;

export async function GET() {
  const applications = await prisma.jobApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: { job: { select: { id: true, title: true } } },
  });
  return NextResponse.json({ applications, statuses: STATUSES });
}

const createSchema = z.object({
  jobId: z.string().min(1),
  applicantName: z.string().min(1),
  applicantEmail: z.string().email(),
  cvUrl: z.string().url().optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const application = await prisma.jobApplication.create({
      data: {
        jobId: parsed.data.jobId,
        applicantName: parsed.data.applicantName,
        applicantEmail: parsed.data.applicantEmail,
        cvUrl: parsed.data.cvUrl || null,
        status: "RECEIVED",
      },
    });
    return NextResponse.json({ ok: true, application });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(STATUSES),
});

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  try {
    const application = await prisma.jobApplication.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });
    return NextResponse.json({ ok: true, application });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}
