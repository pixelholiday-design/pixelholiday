import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const signSchema = z.object({
  signature: z.string().min(1), // typed name or base64 canvas data
  signatureType: z.enum(["typed", "drawn"]),
});

/** POST /api/contracts/[id]/sign — Public endpoint for client e-signature */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const parsed = signSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const contract = await prisma.contract.findUnique({ where: { id: params.id } });
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.status === "FULLY_SIGNED") return NextResponse.json({ error: "Already signed" }, { status: 400 });
  if (contract.status === "CANCELLED" || contract.status === "EXPIRED") {
    return NextResponse.json({ error: "Contract is no longer active" }, { status: 400 });
  }

  // Get client IP and user agent for legal proof
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";

  await prisma.contract.update({
    where: { id: params.id },
    data: {
      clientSignature: parsed.data.signature,
      clientSignedAt: new Date(),
      clientIp: ip,
      clientUserAgent: ua,
      status: contract.photographerSignedAt ? "FULLY_SIGNED" : "VIEWED",
    },
  });

  // If photographer already signed, mark as fully signed
  if (contract.photographerSignedAt) {
    await prisma.contract.update({
      where: { id: params.id },
      data: { status: "FULLY_SIGNED" },
    });
  }

  return NextResponse.json({ ok: true, status: "signed" });
}

/** GET /api/contracts/[id]/sign — Get contract for signing (public) */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    select: {
      id: true, title: true, content: true, status: true,
      photographerName: true, clientName: true,
      clientSignedAt: true, photographerSignedAt: true,
    },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Mark as viewed
  if (contract.status === "SENT") {
    await prisma.contract.update({ where: { id: params.id }, data: { status: "VIEWED", viewedAt: new Date() } });
  }

  return NextResponse.json({ contract });
}
