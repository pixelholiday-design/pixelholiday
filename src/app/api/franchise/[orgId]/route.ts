import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: params.orgId },
      include: { locations: true, staff: true, children: true },
    });
    if (!org) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(org);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { orgId: string } }) {
  try {
    const body = await req.json();
    const org = await prisma.organization.update({ where: { id: params.orgId }, data: body });
    return NextResponse.json(org);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
