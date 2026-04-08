export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const REQUIRED = ["daily_cash", "bank_statement", "rent_receipt", "payroll", "petty_cash"];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const month = sp.get("month") ?? new Date().toISOString().slice(0, 7);
  const locationId = sp.get("locationId");

  const where: any = { month };
  if (locationId) where.locationId = locationId;

  const proofs = await prisma.proofSubmission.findMany({ where });
  const verified = new Set(proofs.filter((p) => p.status === "verified").map((p) => p.type));
  const missing = REQUIRED.filter((t) => !verified.has(t));

  if (missing.length > 0) {
    return NextResponse.json({ blocked: true, missing, month });
  }

  const commissions = await prisma.commission.findMany({
    where: { month, isPaid: false },
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ blocked: false, month, commissions });
}
