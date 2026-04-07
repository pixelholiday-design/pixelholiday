import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  await prisma.magicElement.create({
    data: {
      name: String(data.get("name")),
      type: String(data.get("type")) as any,
      assetUrl: String(data.get("assetUrl")),
      category: data.get("category") ? String(data.get("category")) : null,
    },
  });
  return NextResponse.redirect(new URL("/admin/magic-elements", req.url));
}

export async function GET() {
  const elements = await prisma.magicElement.findMany();
  return NextResponse.json(elements);
}
