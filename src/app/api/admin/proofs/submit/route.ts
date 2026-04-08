import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { locationId, month, type, fileUrl, notes, verified } = await req.json();
  if (!locationId || !month || !type)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const proof = await prisma.proofSubmission.upsert({
    where: { locationId_month_type: { locationId, month, type } },
    create: {
      locationId,
      month,
      type,
      fileUrl: fileUrl ?? null,
      notes: notes ?? null,
      submittedAt: new Date(),
      status: verified ? "verified" : "submitted",
      verifiedAt: verified ? new Date() : null,
    },
    update: {
      fileUrl: fileUrl ?? undefined,
      notes: notes ?? undefined,
      submittedAt: new Date(),
      status: verified ? "verified" : "submitted",
      verifiedAt: verified ? new Date() : null,
    },
  });
  return NextResponse.json({ proof });
}
