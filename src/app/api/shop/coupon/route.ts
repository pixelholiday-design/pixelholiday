import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided." }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.findFirst({
      where: { code, isActive: true },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Coupon not found or inactive." });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit." });
    }

    let discount = 0;
    let message = "";

    if (coupon.type === "PERCENTAGE") {
      discount = coupon.value;
      message = `${discount}% off applied!`;
    } else if (coupon.type === "FIXED_AMOUNT") {
      // Return as percentage-equivalent in response but pass fixed value too
      discount = coupon.value;
      message = `€${discount} discount applied!`;
    } else {
      discount = 0;
      message = "Free shipping applied!";
    }

    return NextResponse.json({
      valid: true,
      discount,
      type: coupon.type,
      message,
      couponId: coupon.id,
    });
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e?.message || "Server error." }, { status: 500 });
  }
}
