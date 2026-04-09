import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const elements = await prisma.magicElement.findMany({
    orderBy: [{ isActive: "desc" }, { usageCount: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({
    count: elements.length,
    active: elements.filter((e) => e.isActive).length,
    elements,
  });
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  let payload: any = {};
  if (ct.includes("application/json")) {
    payload = await req.json().catch(() => ({}));
  } else {
    const data = await req.formData();
    data.forEach((v, k) => {
      payload[k] = String(v);
    });
  }

  if (!payload.name || !payload.assetUrl || !payload.type) {
    if (ct.includes("application/json")) {
      return NextResponse.json({ error: "name, assetUrl, type required" }, { status: 400 });
    }
    return NextResponse.redirect(new URL("/admin/magic-elements?error=missing", req.url));
  }

  const created = await prisma.magicElement.create({
    data: {
      name: payload.name,
      slug: payload.slug || null,
      type: payload.type,
      assetUrl: payload.assetUrl,
      category: payload.category || null,
      position: payload.position || null,
      description: payload.description || null,
    },
  });

  if (ct.includes("application/json")) {
    return NextResponse.json({ ok: true, element: created });
  }
  return NextResponse.redirect(new URL("/admin/magic-elements", req.url));
}
