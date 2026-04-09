import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/marketing/export-emails?locationId=xxx
 * Returns CSV of customer emails with name, email, location, createdAt.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId") || undefined;

  const where: any = { email: { not: null } };
  if (locationId) where.locationId = locationId;

  const customers = await prisma.customer.findMany({
    where,
    select: {
      name: true,
      email: true,
      locationId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve location names
  const locationIds = Array.from(new Set(customers.map((c) => c.locationId).filter(Boolean) as string[]));
  const locations = locationIds.length
    ? await prisma.location.findMany({
        where: { id: { in: locationIds } },
        select: { id: true, name: true },
      })
    : [];
  const locMap = new Map(locations.map((l) => [l.id, l.name]));

  const header = "name,email,location,createdAt";
  const rows = customers.map((c) => {
    const name = (c.name || "").replace(/,/g, " ");
    const email = c.email || "";
    const loc = c.locationId ? (locMap.get(c.locationId) || c.locationId) : "";
    const created = c.createdAt.toISOString().split("T")[0];
    return `"${name}","${email}","${loc}","${created}"`;
  });

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fotiqo-emails-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
