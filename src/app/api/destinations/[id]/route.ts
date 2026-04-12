import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  venueType: z.string().min(1).optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  currency: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
});

/** PUT /api/destinations/[id] -- Update a destination */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;

  // Verify the destination belongs to the user's org
  const destination = await prisma.destination.findFirst({
    where: { id: params.id, organizationId: orgId },
  });

  if (!destination) {
    return NextResponse.json(
      { error: "Destination not found" },
      { status: 404 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.destination.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true, destination: updated });
}

/** GET /api/destinations/[id] -- Get a single destination */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = (session.user as any).orgId;

  const destination = await prisma.destination.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: { staff: { include: { destination: true } } },
  });

  if (!destination) {
    return NextResponse.json(
      { error: "Destination not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ destination });
}
