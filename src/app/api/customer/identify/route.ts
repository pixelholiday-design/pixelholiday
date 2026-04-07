import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Multi-method customer identification: face, QR, NFC, room */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { method, value, locationId } = body;

  let customer = null;
  if (method === "qr") customer = await prisma.customer.findFirst({ where: { wristbandCode: value } });
  else if (method === "nfc") customer = await prisma.customer.findFirst({ where: { nfcTag: value } });
  else if (method === "room") customer = await prisma.customer.findFirst({ where: { roomNumber: value, locationId } });
  else if (method === "face") {
    // Placeholder face match: returns most recent customer at location
    customer = await prisma.customer.findFirst({ where: { locationId }, orderBy: { createdAt: "desc" } });
    // GDPR: discard the uploaded selfie immediately (we never persisted it)
  }

  if (!customer) return NextResponse.json({ found: false });
  const galleries = await prisma.gallery.findMany({ where: { customerId: customer.id } });
  return NextResponse.json({ found: true, customer, galleries });
}
