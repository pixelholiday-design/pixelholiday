import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const locations = await prisma.location.findMany();
  const users = await prisma.user.findMany();
  const channels = [
    { id: "global", name: "Global", type: "global" },
    ...locations.map((l) => ({ id: `location:${l.id}`, name: l.name, type: "location" })),
    ...users.map((u) => ({ id: `user:${u.id}`, name: u.name, type: "direct" })),
  ];
  return NextResponse.json({ channels });
}
