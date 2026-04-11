import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const album = await prisma.album.findUnique({
    where: { id: params.id },
    include: { spreads: { orderBy: { order: "asc" } } },
  });

  if (!album) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true, album });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Handle spreads update
  if (body.spreads) {
    // Delete existing spreads and recreate
    await prisma.albumSpread.deleteMany({ where: { albumId: params.id } });
    for (const spread of body.spreads) {
      await prisma.albumSpread.create({
        data: {
          albumId: params.id,
          layout: spread.layout || "single",
          photoIds: spread.photoIds || [],
          order: spread.order,
        },
      });
    }
  }

  const album = await prisma.album.update({
    where: { id: params.id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.template ? { template: body.template } : {}),
      ...(body.status ? { status: body.status } : {}),
    },
    include: { spreads: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ ok: true, album });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.albumSpread.deleteMany({ where: { albumId: params.id } });
  await prisma.album.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
