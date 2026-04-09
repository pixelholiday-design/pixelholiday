import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

// ── commission calculation ────────────────────────────────────────────────────
// DIGITAL: 2% of retail price
// PHYSICAL (AUTO/MANUAL): 50% of (retailPrice - costPrice) profit margin

function calcCommission(fulfillmentType: string, retailPrice: number, costPrice: number, qty: number): number {
  if (fulfillmentType === "DIGITAL") {
    return retailPrice * qty * 0.02;
  }
  const profitPerUnit = Math.max(0, retailPrice - costPrice);
  return profitPerUnit * qty * 0.5;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const { items, shipping, galleryToken, couponCode } = body as {
      items: {
        productKey: string;
        quantity?: number;
        qty?: number;
        size?: string;
        option?: string;
        photoId?: string;
        bookPhotoIds?: string[];
      }[];
      shipping?: {
        name: string;
        address: string;
        city: string;
        country: string;
        postal: string;
        phone?: string;
        method?: string;
      };
      galleryToken?: string;
      couponCode?: string;
    };

    // Resolve optional gallery from token
    let galleryId: string | null = null;
    if (galleryToken) {
      const gallery = await prisma.gallery.findUnique({
        where: { magicLinkToken: galleryToken },
        select: { id: true },
      }).catch(() => null);
      galleryId = gallery?.id ?? null;
    }

    // Load products
    const productKeys = items.map((i) => i.productKey);
    const products = await prisma.shopProduct.findMany({
      where: { productKey: { in: productKeys }, isActive: true },
    });
    const byKey = new Map(products.map((p) => [p.productKey, p]));

    // Validate all items
    const lines: {
      product: (typeof products)[0];
      qty: number;
      size?: string;
      option?: string;
      photoId?: string;
      bookPhotoIds?: string[];
    }[] = [];
    for (const item of items) {
      const product = byKey.get(item.productKey);
      if (!product) continue;
      const qty = Math.max(1, Math.min(20, item.quantity ?? item.qty ?? 1));
      lines.push({
        product,
        qty,
        size: item.size,
        option: item.option,
        photoId: item.photoId,
        bookPhotoIds: item.bookPhotoIds,
      });
    }
    if (lines.length === 0) {
      return NextResponse.json({ error: "No valid products" }, { status: 400 });
    }

    // Apply coupon if any
    let discountPercent = 0;
    if (couponCode) {
      try {
        const coupon = await prisma.coupon.findFirst({
          where: { code: couponCode, isActive: true },
        });
        if (coupon && coupon.type === "PERCENTAGE") {
          discountPercent = coupon.value;
        }
      } catch {}
    }

    const subtotal = lines.reduce((s, l) => s + l.product.retailPrice * l.qty, 0);
    const discount = subtotal * (discountPercent / 100);
    const hasPhysical = lines.some((l) => l.product.fulfillmentType !== "DIGITAL");
    const shippingCost = hasPhysical ? (shipping?.method === "EXPRESS" ? 15 : 5) : 0;
    const total = subtotal - discount + shippingCost;

    // Fotiqo commission: 2% on digital, 50% of margin on physical
    const fotiqoCommission = lines.reduce(
      (sum, l) => sum + calcCommission(l.product.fulfillmentType, l.product.retailPrice, l.product.costPrice, l.qty),
      0,
    );

    // Check if we need a shipping address for physical items
    if (hasPhysical && !shipping?.name) {
      return NextResponse.json({ error: "Shipping address required for physical items", needsShipping: true }, { status: 400 });
    }

    // Create or find anonymous customer
    let customer = await prisma.customer.findFirst({ where: { email: shipping?.name ? undefined : "shop@guest" } }).catch(() => null);
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name: shipping?.name || "Shop Guest", email: shipping?.name ? undefined : undefined },
      }).catch(() => null);
    }
    if (!customer) {
      return NextResponse.json({ error: "Could not create customer record" }, { status: 500 });
    }

    // Create ShopOrder
    const shopOrder = await prisma.shopOrder.create({
      data: {
        customerId: customer.id,
        galleryId: galleryId,
        status: "PENDING",
        subtotal,
        discount,
        shippingCost,
        total,
        fotiqoCommission: Math.round(fotiqoCommission * 100) / 100,
        couponCode: couponCode || null,
        shippingName: shipping?.name || null,
        shippingAddress: shipping?.address || null,
        shippingCity: shipping?.city || null,
        shippingCountry: shipping?.country || null,
        shippingPostal: shipping?.postal || null,
        shippingPhone: shipping?.phone || null,
        shippingMethod: shipping?.method || "STANDARD",
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            size: l.size || l.product.defaultSize || null,
            option: l.option || l.product.defaultOption || null,
            photoId: l.photoId || null,
            bookPhotoIds: l.bookPhotoIds ? JSON.stringify(l.bookPhotoIds) : null,
            quantity: l.qty,
            unitPrice: l.product.retailPrice,
            totalPrice: l.product.retailPrice * l.qty,
            status: "PENDING",
          })),
        },
      },
    });

    // Create Stripe session
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          ...lines.map(({ product, qty }) => ({
            price_data: {
              currency: "eur",
              product_data: { name: product.name, description: product.description || undefined },
              unit_amount: Math.round(product.retailPrice * 100),
            },
            quantity: qty,
          })),
          ...(shippingCost > 0 ? [{
            price_data: {
              currency: "eur",
              product_data: { name: "Shipping" },
              unit_amount: Math.round(shippingCost * 100),
            },
            quantity: 1,
          }] : []),
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop?order=${shopOrder.id}&ok=1`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
        metadata: {
          shopOrderId: shopOrder.id,
          productKeys: lines.map((l) => l.product.productKey).join(","),
        },
      });

      await prisma.shopOrder.update({
        where: { id: shopOrder.id },
        data: { stripeSessionId: session.id },
      });

      return NextResponse.json({ sessionUrl: session.url, orderId: shopOrder.id });
    } catch (stripeErr: any) {
      // Mock mode if Stripe not configured
      return NextResponse.json({
        mock: true,
        sessionUrl: null,
        orderId: shopOrder.id,
        total,
        message: `Order ${shopOrder.id} created (Stripe not configured). Total: €${total.toFixed(2)}`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
