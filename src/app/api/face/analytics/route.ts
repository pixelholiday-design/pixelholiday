import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/face-recognition";

/**
 * GET /api/face/analytics
 *
 * Face recognition usage stats for the admin dashboard.
 * Requires CEO or OPERATIONS_MANAGER role.
 */
export async function GET() {
  try {
    // Auth check: require CEO or OPS_MANAGER
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role as string | undefined;
    if (role !== "CEO" && role !== "OPERATIONS_MANAGER") {
      return NextResponse.json(
        { error: "Forbidden: requires CEO or OPERATIONS_MANAGER role" },
        { status: 403 },
      );
    }

    const provider = getProvider();

    // Query face indexing stats from the database.
    // The faceCount / faceTokens fields may not exist yet if the migration
    // hasn't been applied, so we wrap each query in try/catch.
    let totalIndexedPhotos = 0;
    let totalFacesIndexed = 0;
    let faceSetCount = 0;

    try {
      // Count photos that have been face-indexed (faceCount > 0)
      totalIndexedPhotos = await prisma.photo.count({
        where: { faceCount: { gt: 0 } } as any,
      });
    } catch {
      // faceCount field may not exist yet
      totalIndexedPhotos = 0;
    }

    try {
      // Sum all faceCount values
      const agg = await (prisma.photo as any).aggregate({
        _sum: { faceCount: true },
      });
      totalFacesIndexed = agg?._sum?.faceCount ?? 0;
    } catch {
      totalFacesIndexed = 0;
    }

    try {
      // Estimate face set count from distinct location+date combos
      // This uses gallery creation dates as a proxy for face set partitions
      const distinctCombos = await prisma.gallery.findMany({
        select: { locationId: true, createdAt: true },
        distinct: ["locationId"],
      });
      faceSetCount = distinctCombos.length;
    } catch {
      faceSetCount = 0;
    }

    // API call limits depend on provider
    let apiCallsRemaining: string;
    switch (provider) {
      case "FACEPP":
        apiCallsRemaining = "1000/day (Face++ free tier)";
        break;
      case "REKOGNITION":
        apiCallsRemaining = "pay-per-use (AWS Rekognition)";
        break;
      case "MOCK":
      default:
        apiCallsRemaining = "unlimited (mock provider)";
        break;
    }

    return NextResponse.json({
      provider,
      totalIndexedPhotos,
      totalFacesIndexed,
      todaySearches: 0, // Would need a search log table to track
      apiCallsRemaining,
      faceSetCount,
    });
  } catch (error) {
    console.error("[face/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch face analytics", detail: String(error) },
      { status: 500 },
    );
  }
}
