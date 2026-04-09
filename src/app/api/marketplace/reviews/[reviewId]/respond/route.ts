import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { response } = await req.json();
    if (!response || typeof response !== "string" || !response.trim()) {
      return NextResponse.json({ error: "response text is required" }, { status: 400 });
    }

    const review = await prisma.photographerReview.findUnique({
      where: { id: params.reviewId },
      include: { profile: { select: { userId: true } } },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Verify the authenticated user owns the photographer profile
    if (review.profile.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond to reviews on your own profile" },
        { status: 403 }
      );
    }

    const updated = await prisma.photographerReview.update({
      where: { id: params.reviewId },
      data: {
        response: response.trim(),
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error("Review respond error:", error);
    return NextResponse.json({ error: "Failed to respond to review" }, { status: 500 });
  }
}
