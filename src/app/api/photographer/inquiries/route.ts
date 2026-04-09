import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: list inquiries for logged-in photographer
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const profile = await prisma.photographerProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ inquiries: [] });

  const inquiries = await prisma.photographerInquiry.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ inquiries });
}

// POST: create inquiry (public, no auth) or update status (auth required)
export async function POST(req: Request) {
  const data = await req.json();

  // Public submission: profileId + contact info
  if (data.profileId && data.name && data.email && data.message) {
    const inquiry = await prisma.photographerInquiry.create({
      data: {
        profileId: data.profileId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        eventType: data.eventType,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        message: data.message,
        budget: data.budget,
      },
    });
    return NextResponse.json({ inquiry });
  }

  // Status update (authenticated)
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (data.id && data.status) {
    const inquiry = await prisma.photographerInquiry.update({
      where: { id: data.id },
      data: { status: data.status },
    });
    return NextResponse.json({ inquiry });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
