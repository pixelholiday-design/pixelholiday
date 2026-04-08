export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const locationId = sp.get("locationId") ?? undefined;
  const month = sp.get("month") ?? undefined;
  const proofs = await prisma.proofSubmission.findMany({
    where: { locationId, month },
    orderBy: { type: "asc" },
  });
  return NextResponse.json({ proofs });
}
