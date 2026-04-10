import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** POST /api/contracts/[id]/send — Send contract to client via email */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await prisma.contract.findUnique({ where: { id: params.id } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Sign as photographer first
  await prisma.contract.update({
    where: { id: params.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      photographerSignedAt: new Date(),
      photographerSignature: contract.photographerName,
    },
  });

  // Send email to client
  const signUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://fotiqo.com"}/contract/sign/${contract.id}`;
  try {
    const { emailGalleryLink } = await import("@/lib/email");
    // Reuse gallery link email template with contract URL
    await emailGalleryLink(contract.clientEmail, signUrl);
  } catch (e) {
    console.warn("[Contract] Email send failed (non-fatal):", e);
  }

  return NextResponse.json({ ok: true, signUrl });
}
