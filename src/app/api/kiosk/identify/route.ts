import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  locationId: z.string().min(1),
  method: z.enum(["WRISTBAND", "SELFIE", "ROOM"]),
  wristbandCode: z.string().optional(),
  roomNumber: z.string().optional(),
  selfieData: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }
  const { locationId, method, wristbandCode, roomNumber } = parsed.data;

  let customer = null as Awaited<ReturnType<typeof prisma.customer.findFirst>>;

  if (method === "WRISTBAND" && wristbandCode) {
    customer = await prisma.customer.findFirst({ where: { wristbandCode } });
  } else if (method === "ROOM" && roomNumber) {
    customer = await prisma.customer.findFirst({ where: { roomNumber, locationId } });
  } else if (method === "SELFIE") {
    // Placeholder face match — return the most recent customer at this location
    // who has at least one gallery (real impl would compute a face vector and search).
    customer = await prisma.customer.findFirst({
      where: { locationId, galleries: { some: {} } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!customer) {
    return NextResponse.json({ ok: false, matched: false, message: "No customer match found." });
  }

  const galleries = await prisma.gallery.findMany({
    where: { customerId: customer.id, locationId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
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
        s3Key_highRes: p.s3Key_highRes,
        isPurchased: p.isPurchased,
      })),
    })),
  });
}
