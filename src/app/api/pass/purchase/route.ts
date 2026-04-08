import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { DigitalPassType } from "@prisma/client";

const PRICES: Record<DigitalPassType, number> = { BASIC: 5000, UNLIMITED: 15000, VIP: 30000 };

const schema = z.object({
  locationId: z.string().min(1),
  tier: z.enum(["BASIC", "UNLIMITED", "VIP"]).optional(),
  passType: z.enum(["BASIC", "UNLIMITED", "VIP"]).optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerWhatsapp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { locationId, customerName, customerEmail, customerWhatsapp } = parsed.data;
  const tier = (parsed.data.tier || parsed.data.passType || "BASIC") as DigitalPassType;
  const amount = PRICES[tier];

  // Upsert customer + mark them as a pass holder
  let customer = customerEmail
    ? await prisma.customer.findFirst({ where: { email: customerEmail } })
    : null;
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: customerName || "Pass Holder",
        email: customerEmail || null,
        whatsapp: customerWhatsapp,
        locationId,
        hasDigitalPass: true,
        digitalPassType: tier,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { hasDigitalPass: true, digitalPassType: tier, locationId },
    });
  }

  // Without Stripe configured, return a dev-mode confirmation (no fake payment URL)
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      ok: true,
      mocked: true,
      customerId: customer.id,
      tier,
      amountCents: amount,
      message: "Stripe not configured — pass marked active in dev mode.",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `Digital Pass · ${tier}` },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pass/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pass/${locationId}`,
      metadata: { customerId: customer.id, passType: tier, type: "DIGITAL_PASS" },
    });
    return NextResponse.json({ ok: true, sessionUrl: session.url, customerId: customer.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Stripe error" }, { status: 502 });
  }
}
