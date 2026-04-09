import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const modules = await prisma.academyModule.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ modules });
}

export async function POST(req: Request) {
  const body = await req.json();

  // Count existing modules to set sortOrder
  const count = await prisma.academyModule.count();

  const mod = await prisma.academyModule.create({
    data: {
      title: body.title,
      description: body.description || "",
      type: body.type || "ONBOARDING",
      contentUrl: body.contentUrl || null,
      isRequired: !!body.isRequired,
      sortOrder: body.sortOrder ?? count,
    },
  });

  return NextResponse.json({ ok: true, module: mod });
}
