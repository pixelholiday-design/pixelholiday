import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.position === "string") data.position = body.position;
  if (typeof body.assetUrl === "string") data.assetUrl = body.assetUrl;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields" }, { status: 400 });
  }

  try {
    const updated = await prisma.magicElement.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ ok: true, element: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 404 });
  }
}
