import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "node:crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = crypto.randomBytes(8).toString("hex");
  const qr = await prisma.qRCode.create({
    data: {
      code,
      type: body.type || "WRISTBAND",
      locationId: body.locationId,
      assignedToStaffId: body.assignedToStaffId,
    },
  });
  return NextResponse.json({ qr, scanUrl: `/qr/${qr.code}` });
}
