import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/labs — list all PrintLabPartner records
export async function GET() {
  try {
    const labs = await prisma.printLabPartner.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ labs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/admin/labs — create new lab
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.name || !body?.type) {
      return NextResponse.json({ error: "name and type are required" }, { status: 400 });
    }

    const { name, type, apiBaseUrl, apiKey, markupPercent, capabilities, isDefault } = body as {
      name: string;
      type: string;
      apiBaseUrl?: string;
      apiKey?: string;
      markupPercent?: number;
      capabilities?: string[];
      isDefault?: boolean;
    };

    // If setting as default, unset all others first
    if (isDefault) {
      await prisma.printLabPartner.updateMany({ data: { isDefault: false } });
    }

    const lab = await prisma.printLabPartner.create({
      data: {
        name,
        type,
        apiBaseUrl: apiBaseUrl || null,
        apiKey: apiKey || null,
        markupPercent: markupPercent ?? 50,
        capabilities: capabilities ? JSON.stringify(capabilities) : null,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json({ ok: true, lab });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH /api/admin/labs — update lab (active, default, markup, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.id) {
      return NextResponse.json({ error: "Missing lab id" }, { status: 400 });
    }

    const { id, isDefault, isActive, markupPercent, apiKey, apiBaseUrl, name, capabilities } = body as {
      id: string;
      isDefault?: boolean;
      isActive?: boolean;
      markupPercent?: number;
      apiKey?: string;
      apiBaseUrl?: string;
      name?: string;
      capabilities?: string[];
    };

    // If setting as default, unset all others first
    if (isDefault === true) {
      await prisma.printLabPartner.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (isDefault !== undefined) update.isDefault = isDefault;
    if (isActive !== undefined) update.isActive = isActive;
    if (markupPercent !== undefined) update.markupPercent = markupPercent;
    if (apiKey !== undefined) update.apiKey = apiKey;
    if (apiBaseUrl !== undefined) update.apiBaseUrl = apiBaseUrl;
    if (capabilities !== undefined) update.capabilities = JSON.stringify(capabilities);

    const lab = await prisma.printLabPartner.update({
      where: { id },
      data: update,
    });

    return NextResponse.json({ ok: true, lab });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
