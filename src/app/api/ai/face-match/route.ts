import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Placeholder face recognition. GDPR: selfie deleted immediately after match. */
export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { selfieBase64, locationId }
  // In production: convert to vector via OpenAI/CLIP, match against customer.faceVector
  // For Phase 2 placeholder: return most recent gallery at location
  const gallery = await prisma.gallery.findFirst({
    where: { locationId: body.locationId },
    orderBy: { createdAt: "desc" },
    include: { customer: true, photos: true },
  });
  // Selfie discarded — never persisted (GDPR compliance)
  return NextResponse.json({ matched: !!gallery, gallery, gdpr: "selfie_deleted" });
}
