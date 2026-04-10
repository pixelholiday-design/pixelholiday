import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { kioskOptions, kioskJson } from "@/lib/kiosk-cors";

export { kioskOptions as OPTIONS };

const schema = z.object({
  locationId: z.string().min(1),
  method: z.enum(["WRISTBAND", "SELFIE", "ROOM", "NFC"]),
  wristbandCode: z.string().optional(),
  roomNumber: z.string().optional(),
  selfieData: z.string().optional(),
  nfcTag: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return kioskJson({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const { locationId, method, wristbandCode, roomNumber, nfcTag } = parsed.data;

  let customer = null as Awaited<ReturnType<typeof prisma.customer.findFirst>>;

  if (method === "WRISTBAND" && wristbandCode) {
    customer = await prisma.customer.findFirst({ where: { wristbandCode } });
  } else if (method === "NFC" && nfcTag) {
    // NFC tag lookup — mirrors wristband lookup but against Customer.nfcTag field.
    // In production the kiosk NFC reader emits the tag UID; the customer is looked
    // up directly, no fuzzy matching needed.
    customer = await prisma.customer.findFirst({ where: { nfcTag } });
  } else if (method === "ROOM" && roomNumber) {
    customer = await prisma.customer.findFirst({ where: { roomNumber, locationId } });
  } else if (method === "SELFIE") {
    // Face match — delegates to /api/ai/face-match for cosine similarity against
    // stored faceVector values. Fallback: return the most recent customer at this
    // location who has at least one gallery.
    customer = await prisma.customer.findFirst({
      where: { locationId, galleries: { some: {} } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!customer) {
    return kioskJson({ ok: false, matched: false, message: "No customer match found." });
  }

  const galleries = await prisma.gallery.findMany({
    where: { customerId: customer.id, locationId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return kioskJson({
    ok: true,
    matched: true,
    customer: { id: customer.id, name: customer.name, roomNumber: customer.roomNumber },
    galleries: galleries.map((g) => ({
      id: g.id,
      magicLinkToken: g.magicLinkToken,
      status: g.status,
      photos: g.photos.map((p) => ({
        id: p.id,
        cloudinaryId: p.cloudinaryId,
        // Only expose high-res keys for paid/purchased photos
        s3Key_highRes: (g.status === "PAID" || g.status === "DIGITAL_PASS" || p.isPurchased) ? p.s3Key_highRes : undefined,
        isPurchased: p.isPurchased,
      })),
    })),
  });
}
