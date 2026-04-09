import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/face/index
 *
 * Manually trigger face indexing for a gallery's photos.
 * Requires authenticated staff session.
 *
 * Request body:
 *   galleryId - the gallery to index (required)
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check: require staff session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { galleryId } = body as { galleryId?: string };

    if (!galleryId) {
      return NextResponse.json(
        { error: "galleryId is required" },
        { status: 400 },
      );
    }

    // Dynamic import to avoid circular dependencies and allow the indexer
    // module to be built independently
    const { indexGalleryFaces } = await import(
      "@/lib/face-recognition/indexer"
    );

    const result = await indexGalleryFaces(galleryId);

    return NextResponse.json({
      success: true,
      galleryId,
      indexed: result.indexed,
      faces: result.faces,
    });
  } catch (error) {
    console.error("[face/index] Error:", error);
    return NextResponse.json(
      { error: "Face indexing failed", detail: String(error) },
      { status: 500 },
    );
  }
}
