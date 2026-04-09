import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  galleryToken: z.string().min(1),
  name: z.string().optional(),
});

/**
 * POST /api/marketing/collect-email
 * Called when a gallery has requireEmail=true and the customer enters their
 * email to view the gallery. Saves or updates the Customer record.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
  }

  const { email, galleryToken, name } = parsed.data;

  const gallery = await prisma.gallery.findUnique({
    where: { magicLinkToken: galleryToken },
    select: { id: true, customerId: true },
  });
  if (!gallery) {
    return NextResponse.json({ ok: false, error: "Gallery not found" }, { status: 404 });
  }

  // Update the customer linked to this gallery with the email
  await prisma.customer.update({
    where: { id: gallery.customerId },
    data: {
      email,
      ...(name ? { name } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
