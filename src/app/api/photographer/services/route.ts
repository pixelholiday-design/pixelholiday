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
    // Update existing
    const service = await prisma.photographerService.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        startingAt: data.startingAt ? parseFloat(data.startingAt) : null,
        currency: data.currency || "EUR",
        duration: data.duration,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ service });
  }

  const service = await prisma.photographerService.create({
    data: {
      profileId: profile.id,
      name: data.name,
      description: data.description,
      startingAt: data.startingAt ? parseFloat(data.startingAt) : null,
      currency: data.currency || "EUR",
      duration: data.duration,
      sortOrder: data.sortOrder ?? 0,
    },
  });
  return NextResponse.json({ service });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.photographerService.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
