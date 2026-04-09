import { NextResponse } from "next/server";
import { ensureSlideshowTemplate } from "@/lib/cloudinary/slideshow";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/setup-slideshow-template
 *
 * Uploads the Cloudinary CLT slideshow template required for real MP4
 * video generation from photo slideshows. Idempotent — safe to call
 * multiple times; if the template already exists it returns immediately.
 *
 * Auth: CEO / OPERATIONS_MANAGER only (enforced by caller or middleware).
 */
export async function POST() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName || cloudName === "demo") {
    return NextResponse.json(
      {
        ok: false,
        error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 400 },
    );
  }

  try {
    const publicId = await ensureSlideshowTemplate(cloudName);

    if (!publicId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Template upload failed. Check Cloudinary credentials and server logs.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      publicId,
      message: `Slideshow template ready: ${publicId}`,
    });
  } catch (err) {
    console.error("[setup-slideshow-template]", err);
    return NextResponse.json(
      { ok: false, error: "Internal error during template setup" },
      { status: 500 },
    );
  }
}
