import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { sendReviewRequest } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER", "SUPERVISOR"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { to, customerName, photographerName, galleryId, googleReviewLink } = body;

  if (!to || !customerName || !photographerName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Build the review URL — this could point to an internal review page
  // or directly to Google Reviews for maximum impact
  const reviewUrl = googleReviewLink || `${process.env.NEXT_PUBLIC_APP_URL}/review/${galleryId}`;

  await sendReviewRequest(to, {
    customerName,
    photographerName,
    reviewUrl,
    galleryThumbnailUrl: undefined, // Could fetch hook photo URL here
  });

  return NextResponse.json({ sent: true, to });
}
