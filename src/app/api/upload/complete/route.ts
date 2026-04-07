import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { GalleryStatus } from "@prisma/client";
import { sendWhatsAppHookLink } from "@/lib/whatsapp";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { uploadToCloudinary } from "@/lib/cloudinary.server";

const photoSchema = z.object({
  key: z.string(),
  publicUrl: z.string(),
  isHookImage: z.boolean().optional().default(false),
});

const schema = z.object({
  locationId: z.string().min(1),
  photographerId: z.string().min(1),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerWhatsapp: z.string().optional(),
  roomNumber: z.string().optional(),
  status: z.enum(["HOOK_ONLY", "PREVIEW_ECOM", "DIGITAL_PASS"]),
  photos: z.array(photoSchema).min(1).max(500),
});

export async function POST(req: Request) {
  try {
    await requireStaff();
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    const [location, photographer] = await Promise.all([
      prisma.location.findUnique({ where: { id: data.locationId } }),
      prisma.user.findUnique({ where: { id: data.photographerId } }),
    ]);
    if (!location) return NextResponse.json({ error: "Location not found" }, { status: 404 });
    if (!photographer) return NextResponse.json({ error: "Photographer not found" }, { status: 404 });

    const customer = await prisma.customer.create({
      data: {
        name: data.customerName || "Guest",
        email: data.customerEmail || null,
        whatsapp: data.customerWhatsapp,
        roomNumber: data.roomNumber,
        locationId: data.locationId,
      },
    });

    const gallery = await prisma.gallery.create({
      data: {
        status: data.status as GalleryStatus,
        locationId: data.locationId,
        photographerId: data.photographerId,
        customerId: customer.id,
        roomNumber: data.roomNumber,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalCount: data.photos.length,
      },
    });

    // Enforce exactly one hook image. Upload to Cloudinary so image/upload works.
    let hookSet = false;
    for (let i = 0; i < data.photos.length; i++) {
      const p = data.photos[i];
      const isHook = Boolean(p.isHookImage) && !hookSet;
      if (isHook) hookSet = true;

      let cloudinaryId: string | null = null;
      try {
        const up = await uploadToCloudinary(p.publicUrl, `pixelholiday/${gallery.id}`);
        cloudinaryId = up?.public_id || null;
      } catch (e) {
        console.warn("Cloudinary upload skipped", e);
      }

      await prisma.photo.create({
        data: {
          galleryId: gallery.id,
          s3Key_highRes: p.key,
          cloudinaryId,
          isHookImage: isHook,
          sortOrder: i,
        },
      });
    }

    if (data.status === "HOOK_ONLY" && customer.whatsapp) {
      const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/gallery/${gallery.magicLinkToken}`;
      await sendWhatsAppHookLink(customer.whatsapp, link);
    }

    return NextResponse.json({ galleryId: gallery.id, magicLinkToken: gallery.magicLinkToken });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("upload/complete error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
