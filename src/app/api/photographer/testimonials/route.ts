import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const data = await req.json();

  const profile = await prisma.photographerProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Create profile first" }, { status: 404 });

  if (data.id) {
    const testimonial = await prisma.photographerTestimonial.update({
      where: { id: data.id },
      data: {
        clientName: data.clientName,
        content: data.content,
        rating: data.rating ?? 5,
        eventType: data.eventType,
        date: data.date ? new Date(data.date) : null,
        isVisible: data.isVisible ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ testimonial });
  }

  const testimonial = await prisma.photographerTestimonial.create({
    data: {
      profileId: profile.id,
      clientName: data.clientName,
      content: data.content,
      rating: data.rating ?? 5,
      eventType: data.eventType,
      date: data.date ? new Date(data.date) : null,
      isVisible: data.isVisible ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ testimonial });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.photographerTestimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
