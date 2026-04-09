import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/automation/franchise-emails";

/**
 * POST /api/franchise/onboard
 * Create a new franchise organization with an Operations Manager account.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessName,
      ownerName,
      ownerEmail,
      ownerPhone,
      country,
      revenueSharePercent,
      parentOrgId,
      locationIds,
    } = body;

    if (!businessName || !ownerName || !ownerEmail || !parentOrgId) {
      return NextResponse.json(
        { error: "businessName, ownerName, ownerEmail, and parentOrgId are required" },
        { status: 400 }
      );
    }

    // Verify parent org exists
    const parent = await prisma.organization.findUnique({ where: { id: parentOrgId } });
    if (!parent) {
      return NextResponse.json({ error: "Parent organization not found" }, { status: 404 });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create franchise organization
    const franchise = await prisma.organization.create({
      data: {
        name: businessName,
        type: "FRANCHISE",
        parentOrgId,
        subscriptionTier: "BUSINESS",
        saasCommissionRate: revenueSharePercent ? revenueSharePercent / 100 : 0.02,
        sleepingMoneyShare: 0.50,
      },
    });

    // Generate temporary password
    const tempPassword = `PH-${crypto.randomUUID().slice(0, 8)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create franchise owner as OPERATIONS_MANAGER
    const user = await prisma.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        phone: ownerPhone || null,
        password: hashedPassword,
        role: "OPERATIONS_MANAGER",
        orgId: franchise.id,
      },
    });

    // Assign locations to this franchise if provided
    if (locationIds && locationIds.length > 0) {
      await prisma.location.updateMany({
        where: { id: { in: locationIds } },
        data: { orgId: franchise.id },
      });
    }

    // Send welcome email
    await sendWelcomeEmail({
      to: ownerEmail,
      name: ownerName,
      businessName,
      tempPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
    });

    return NextResponse.json({
      ok: true,
      franchiseId: franchise.id,
      userId: user.id,
      tempPassword, // Only returned in API response for admin reference
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Franchise onboarding failed" }, { status: 500 });
  }
}
