import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { canCreateGallery } from "@/lib/usage";

const gallerySchema = z.object({
  name: z.string().min(1),
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  eventDate: z.string().optional(),
  expiryDays: z.number().min(1).max(365).default(30),
});

const bulkSchema = z.object({
  galleries: z.array(gallerySchema).min(1).max(500),
});

/** POST /api/galleries/bulk-create — Create multiple galleries from CSV data */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const usageCheck = await canCreateGallery(user.orgId);
  if (!usageCheck.allowed) {
    return NextResponse.json({
      error: `Gallery limit reached (${usageCheck.current}/${usageCheck.max}). Upgrade your plan.`,
    }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const results: { name: string; magicLinkToken: string; galleryId: string; clientName: string; status: string }[] = [];
  const errors: { name: string; error: string }[] = [];

  for (const g of parsed.data.galleries) {
    try {
      // Create or find customer
      let customer;
      if (g.clientEmail) {
        customer = await prisma.customer.findFirst({ where: { email: g.clientEmail } });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: g.clientName, email: g.clientEmail || null },
        });
      }

      // Create gallery
      const gallery = await prisma.gallery.create({
        data: {
          status: "PREVIEW_ECOM",
          locationId: user.locationId || (await prisma.location.findFirst({ where: { orgId: user.orgId } }))?.id || "",
          photographerId: user.id,
          customerId: customer.id,
          expiresAt: new Date(Date.now() + g.expiryDays * 24 * 60 * 60 * 1000),
          totalCount: 0,
        },
      });

      results.push({
        name: g.name,
        magicLinkToken: gallery.magicLinkToken,
        galleryId: gallery.id,
        clientName: g.clientName,
        status: "created",
      });
    } catch (e: any) {
      errors.push({ name: g.name, error: e.message || "Creation failed" });
    }
  }

  return NextResponse.json({
    ok: true,
    created: results.length,
    failed: errors.length,
    galleries: results,
    errors,
  });
}
