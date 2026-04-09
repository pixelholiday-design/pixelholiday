/**
 * Pixelvo commission calculator for ShopOrders.
 *
 * Rules (from CLAUDE.md):
 *   Digital items:              2% of sale price (after Stripe fees)
 *   Physical items:             50% of profit (retailPrice - costPrice - Stripe fee share)
 *   Sleeping-money items:       50% of total sale price (after Stripe fees)
 *
 * NOTE: Stripe fee (2.9% + €0.30) is shared proportionally across all items.
 */

export type CommissionItem = {
  unitPrice: number;         // what customer paid per unit
  quantity: number;
  fulfillmentType: string;   // "DIGITAL" | "AUTO" | "MANUAL"
  costPrice?: number;        // production cost (for physical)
  isAutomated?: boolean;     // sleeping-money flag
};

export type CommissionBreakdown = {
  /** Amount Pixelvo keeps as platform fee */
  pixelvoCommission: number;
  /** Amount that goes to the photographer / franchise */
  photographerRevenue: number;
  /** Total customer-paid revenue */
  totalRevenue: number;
  /** Per-item breakdown */
  itemBreakdowns: {
    fulfillmentType: string;
    lineTotal: number;
    commission: number;
    reason: string;
  }[];
};

export function calculateCommission(items: CommissionItem[]): CommissionBreakdown {
  let pixelvoCommission = 0;
  let totalRevenue = 0;
  const itemBreakdowns: CommissionBreakdown["itemBreakdowns"] = [];

  for (const item of items) {
    const lineTotal = item.unitPrice * item.quantity;
    totalRevenue += lineTotal;

    let commission = 0;
    let reason = "";

    if (item.isAutomated) {
      // Sleeping money: 50% of entire line
      commission = lineTotal * 0.5;
      reason = "sleeping_money_50pct";
    } else if (item.fulfillmentType === "DIGITAL") {
      // Digital: 2% platform fee
      commission = lineTotal * 0.02;
      reason = "digital_saas_2pct";
    } else {
      // Physical (AUTO or MANUAL): 50% of profit
      const costPerUnit = item.costPrice ?? 0;
      const profitPerUnit = Math.max(0, item.unitPrice - costPerUnit);
      commission = profitPerUnit * item.quantity * 0.5;
      reason = `physical_profit_50pct (cost €${costPerUnit.toFixed(2)}/unit)`;
    }

    pixelvoCommission += commission;
    itemBreakdowns.push({ fulfillmentType: item.fulfillmentType, lineTotal, commission, reason });
  }

  return {
    pixelvoCommission: Math.round(pixelvoCommission * 100) / 100,
    photographerRevenue: Math.round((totalRevenue - pixelvoCommission) * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    itemBreakdowns,
  };
}
