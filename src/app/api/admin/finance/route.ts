/**
 * Financial Summary API — P&L Dashboard
 *
 * Provides complete financial overview for CEO:
 * - Revenue by stream (resort, SaaS, marketplace, print, gift cards)
 * - Costs by category (Stripe fees, lab costs, photographer payouts, operating)
 * - Profit margin by location, product, and time period
 * - Cash flow summary
 * - Unit economics per business model
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";
import { getGiftCardFinancials } from "@/lib/gift-cards";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "month"; // month, quarter, year, all
    const locationId = url.searchParams.get("locationId") || null;

    // Calculate date range
    const now = new Date();
    let periodStart: Date;
    switch (period) {
      case "quarter":
        periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      case "all":
        periodStart = new Date(2020, 0, 1);
        break;
      default: // month
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const orderWhere: any = {
      status: "COMPLETED",
      createdAt: { gte: periodStart },
    };
    if (locationId) {
      orderWhere.gallery = { locationId };
    }

    // ── 1. REVENUE STREAMS ──────────────────────

    // Resort gallery sales (orders linked to galleries)
    const resortSales = await prisma.order.aggregate({
      _sum: { amount: true, stripeFee: true, netAmount: true, taxAmount: true },
      _count: true,
      where: { ...orderWhere, isAutomatedSale: false },
    });

    // Sleeping money (automated sales)
    const sleepingSales = await prisma.order.aggregate({
      _sum: { amount: true, stripeFee: true, netAmount: true },
      _count: true,
      where: { ...orderWhere, isAutomatedSale: true },
    });

    // Shop orders (prints, products)
    let shopRevenue = { total: 0, labCosts: 0, commission: 0, count: 0 };
    try {
      const shopOrders = await prisma.shopOrder.findMany({
        where: {
          status: { in: ["FULFILLED", "SHIPPED", "DELIVERED"] },
          createdAt: { gte: periodStart },
        },
        include: { items: { include: { product: true } } },
      });
      for (const so of shopOrders) {
        shopRevenue.total += so.total;
        shopRevenue.commission += so.pixelvoCommission ?? 0;
        shopRevenue.count++;
        for (const item of so.items) {
          if (item.product) {
            shopRevenue.labCosts += (item.product.costPrice ?? 0) * item.quantity;
          }
        }
      }
    } catch {
      // ShopOrder table may not exist yet
    }

    // Marketplace bookings
    let marketplaceRevenue = { totalBookings: 0, platformFees: 0, stripeFees: 0, count: 0 };
    try {
      const bookings = await prisma.marketplaceBooking.findMany({
        where: {
          isPaid: true,
          createdAt: { gte: periodStart },
        },
      });
      for (const b of bookings) {
        marketplaceRevenue.totalBookings += b.totalPrice;
        marketplaceRevenue.platformFees += b.platformFee ?? 0;
        marketplaceRevenue.stripeFees += b.stripeFee ?? 0;
        marketplaceRevenue.count++;
      }
    } catch {
      // Table may not exist
    }

    // Gift card financials
    let giftCardFinancials = {
      totalIssued: 0, cardsIssued: 0, totalRedeemed: 0, totalBreakage: 0,
      outstandingLiability: 0, revenueRecognized: 0,
    };
    try {
      giftCardFinancials = await getGiftCardFinancials();
    } catch {
      // Table may not exist
    }

    // ── 2. COSTS ────────────────────────────────

    // Total Stripe fees
    const totalStripeFees = await prisma.order.aggregate({
      _sum: { stripeFee: true },
      where: orderWhere,
    });

    // Commission costs (photographer payouts)
    const monthStr = periodStart.toISOString().slice(0, 7);
    const commissionCosts = await prisma.commission.aggregate({
      _sum: { amount: true },
      where: {
        month: { gte: monthStr },
        amount: { gt: 0 }, // Exclude reversals
      },
    });

    // Refund losses (Stripe fees we absorbed on refunds)
    const refundLosses = await prisma.order.aggregate({
      _sum: { refundedAmount: true, stripeFee: true },
      _count: true,
      where: {
        status: "REFUNDED",
        refundedAt: { gte: periodStart },
      },
    });

    // Cash expenses
    let cashExpenses = 0;
    try {
      const expenses = await prisma.cashExpense.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: periodStart } },
      });
      cashExpenses = expenses._sum.amount ?? 0;
    } catch {
      // Table may not exist
    }

    // ── 3. PROFIT CALCULATION ───────────────────

    const grossRevenue =
      (resortSales._sum.amount ?? 0) +
      (sleepingSales._sum.amount ?? 0) +
      shopRevenue.total +
      marketplaceRevenue.platformFees +
      giftCardFinancials.revenueRecognized;

    const totalCosts =
      (totalStripeFees._sum.stripeFee ?? 0) +
      (commissionCosts._sum.amount ?? 0) +
      shopRevenue.labCosts +
      cashExpenses;

    const netProfit = Math.round((grossRevenue - totalCosts) * 100) / 100;
    const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 10000) / 100 : 0;

    // ── 4. UNIT ECONOMICS ───────────────────────

    const resortCount = resortSales._count || 1;
    const avgResortSale = (resortSales._sum.amount ?? 0) / resortCount;
    const avgResortStripeFee = (resortSales._sum.stripeFee ?? 0) / resortCount;
    const avgResortCommission = (commissionCosts._sum.amount ?? 0) / resortCount;
    const avgResortMargin = avgResortSale - avgResortStripeFee - avgResortCommission;

    // ── 5. REVENUE BY PAYMENT METHOD ────────────

    const byPaymentMethod = await prisma.order.groupBy({
      by: ["paymentMethod"],
      _sum: { amount: true, stripeFee: true },
      _count: true,
      where: orderWhere,
    });

    // ── 6. REVENUE BY LOCATION ──────────────────

    let byLocation: any[] = [];
    try {
      const locationOrders = await prisma.order.findMany({
        where: orderWhere,
        include: { gallery: { include: { location: { select: { id: true, name: true, type: true } } } } },
      });
      const locMap = new Map<string, { name: string; type: string; revenue: number; fees: number; count: number }>();
      for (const o of locationOrders) {
        const loc = o.gallery?.location;
        if (!loc) continue;
        const entry = locMap.get(loc.id) ?? { name: loc.name, type: loc.type, revenue: 0, fees: 0, count: 0 };
        entry.revenue += o.amount;
        entry.fees += o.stripeFee;
        entry.count++;
        locMap.set(loc.id, entry);
      }
      byLocation = Array.from(locMap.entries()).map(([id, data]) => ({
        locationId: id,
        ...data,
        margin: Math.round((data.revenue - data.fees) / data.revenue * 10000) / 100,
      })).sort((a, b) => b.revenue - a.revenue);
    } catch {
      // May fail if relations don't exist
    }

    return NextResponse.json({
      period,
      periodStart: periodStart.toISOString(),
      periodEnd: now.toISOString(),

      // P&L Summary
      pnl: {
        grossRevenue: Math.round(grossRevenue * 100) / 100,
        totalCosts: Math.round(totalCosts * 100) / 100,
        netProfit,
        profitMargin: `${profitMargin}%`,
      },

      // Revenue Streams
      revenue: {
        resortSales: {
          total: resortSales._sum.amount ?? 0,
          count: resortSales._count,
          stripeFees: resortSales._sum.stripeFee ?? 0,
          netReceived: resortSales._sum.netAmount ?? 0,
          taxCollected: resortSales._sum.taxAmount ?? 0,
        },
        sleepingMoney: {
          total: sleepingSales._sum.amount ?? 0,
          count: sleepingSales._count,
          stripeFees: sleepingSales._sum.stripeFee ?? 0,
        },
        shopSales: {
          total: shopRevenue.total,
          count: shopRevenue.count,
          labCosts: Math.round(shopRevenue.labCosts * 100) / 100,
          platformCommission: Math.round(shopRevenue.commission * 100) / 100,
          grossProfit: Math.round((shopRevenue.total - shopRevenue.labCosts) * 100) / 100,
        },
        marketplace: {
          totalBookingValue: marketplaceRevenue.totalBookings,
          platformFees: Math.round(marketplaceRevenue.platformFees * 100) / 100,
          stripeFees: Math.round(marketplaceRevenue.stripeFees * 100) / 100,
          netPlatformRevenue: Math.round((marketplaceRevenue.platformFees - marketplaceRevenue.stripeFees) * 100) / 100,
          count: marketplaceRevenue.count,
        },
        giftCards: giftCardFinancials,
      },

      // Costs
      costs: {
        stripeFees: Math.round((totalStripeFees._sum.stripeFee ?? 0) * 100) / 100,
        photographerCommissions: Math.round((commissionCosts._sum.amount ?? 0) * 100) / 100,
        labCosts: Math.round(shopRevenue.labCosts * 100) / 100,
        cashExpenses: Math.round(cashExpenses * 100) / 100,
        refundLosses: {
          refundedAmount: refundLosses._sum.refundedAmount ?? 0,
          stripeFeeAbsorbed: refundLosses._sum.stripeFee ?? 0,
          refundCount: refundLosses._count,
        },
      },

      // Unit Economics
      unitEconomics: {
        resort: {
          avgSalePrice: Math.round(avgResortSale * 100) / 100,
          avgStripeFee: Math.round(avgResortStripeFee * 100) / 100,
          avgCommission: Math.round(avgResortCommission * 100) / 100,
          avgMarginPerSession: Math.round(avgResortMargin * 100) / 100,
          marginPercent: avgResortSale > 0
            ? `${Math.round(avgResortMargin / avgResortSale * 10000) / 100}%`
            : "0%",
        },
        marketplace: {
          avgBookingValue: marketplaceRevenue.count > 0
            ? Math.round(marketplaceRevenue.totalBookings / marketplaceRevenue.count * 100) / 100
            : 0,
          avgPlatformFee: marketplaceRevenue.count > 0
            ? Math.round(marketplaceRevenue.platformFees / marketplaceRevenue.count * 100) / 100
            : 0,
          avgNetPerBooking: marketplaceRevenue.count > 0
            ? Math.round((marketplaceRevenue.platformFees - marketplaceRevenue.stripeFees) / marketplaceRevenue.count * 100) / 100
            : 0,
        },
      },

      // Breakdowns
      byPaymentMethod: byPaymentMethod.map((pm) => ({
        method: pm.paymentMethod,
        revenue: pm._sum.amount ?? 0,
        stripeFees: pm._sum.stripeFee ?? 0,
        count: pm._count,
      })),
      byLocation,
    });
  } catch (e) {
    const g = handleGuardError(e);
    if (g) return g;
    console.error("finance route error", e);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
