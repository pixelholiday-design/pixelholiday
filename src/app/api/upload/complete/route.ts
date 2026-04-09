import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { GalleryStatus } from "@prisma/client";
import { sendWhatsAppHookLink } from "@/lib/whatsapp";
import { requireStaff, handleGuardError } from "@/lib/guards";
import { uploadToCloudinary } from "@/lib/cloudinary.server";
import { autoEditGallery } from "@/lib/ai-edit";
import { applyAutoHook } from "@/lib/ai/hook-advisor";
import { awardXP } from "@/lib/gamification/xp";

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

    let gallery: any;
    try {
      gallery = await prisma.gallery.create({
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
    } catch {
      // Fallback: create gallery without optional columns that may not exist yet
      gallery = await (prisma.gallery as any).create({
        data: {
          status: data.status as GalleryStatus,
          locationId: data.locationId,
          photographerId: data.photographerId,
          customerId: customer.id,
          roomNumber: data.roomNumber ?? null,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

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

      // Store a resolvable URL in s3Key_highRes so the gallery always renders,
      // even when Cloudinary upload failed or the original key is not itself a URL.
      const resolvableUrl = p.publicUrl && /^https?:\/\//.test(p.publicUrl) ? p.publicUrl : p.key;
      await prisma.photo.create({
        data: {
          galleryId: gallery.id,
          s3Key_highRes: resolvableUrl,
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

    // Background AI auto-edit pipeline (does not block the response)
    autoEditGallery(gallery.id).catch((e) => console.warn("autoEditGallery failed", e));

    // AI photography coaching — analyze uploads, update skill profile, assign training
    try {
      const { analyzeGalleryPhotos } = await import("@/lib/ai/photo-analyzer");
      await analyzeGalleryPhotos(gallery.id);
      const { calculateSkillProfile } = await import("@/lib/ai/skill-profile");
      const { autoAssignTraining } = await import("@/lib/ai/auto-training");
      await calculateSkillProfile(gallery.photographerId);
      await autoAssignTraining(gallery.photographerId);
    } catch (e) {
      console.error("AI coaching failed (non-fatal):", e);
    }

    // AI hook advisor — pick the best hook image if photographer didn't star one
    applyAutoHook(gallery.id).catch(() => {});

    // Gamification — XP for the upload, plus a bonus for big batches
    const photogXp = await awardXP(
      data.photographerId,
      data.photos.length >= 50 ? { action: "upload_gallery", bonus: 25 } : "upload_gallery",
      { galleryId: gallery.id, photoCount: data.photos.length }
    );

    const createdPhotos = await prisma.photo.findMany({
      where: { galleryId: gallery.id },
      select: { id: true },
      orderBy: { sortOrder: "asc" },
    });

    // Wristband AI detection + auto-link (non-fatal)
    try {
      const { analyzePhotoForWristband, autoLinkBurstToWristband } = await import(
        "@/lib/ai/wristband-detector"
      );
      for (const p of createdPhotos) {
        await analyzePhotoForWristband(p.id);
      }
      await autoLinkBurstToWristband(
        createdPhotos.map((p) => p.id),
        data.photographerId
      );
    } catch (e) {
      console.error("Wristband detection failed (non-fatal):", e);
    }

    // Auto-Reel (Module 9): if 5+ photos uploaded, generate a reel in the background.
    if (createdPhotos.length >= 5) {
      import("@/lib/ai/reel-generator")
        .then((m) => m.maybeAutoGenerateReel(gallery.id, createdPhotos.length))
        .catch((e) => console.warn("auto-reel generation failed (non-fatal):", e));
    }

    return NextResponse.json({
      galleryId: gallery.id,
      magicLinkToken: gallery.magicLinkToken,
      photoIds: createdPhotos.map((p) => p.id),
      gamification: photogXp,
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("upload/complete error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
