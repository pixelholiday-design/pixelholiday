import { prisma } from "@/lib/db";
import { Gift, Search } from "lucide-react";
import GiftCardActions from "./GiftCardActions";

export const dynamic = "force-dynamic";

async function getGiftCardMetrics() {
  const [cards, totalIssued] = await Promise.all([
    prisma.giftCard.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.giftCard.aggregate({ _sum: { amount: true }, _count: true }).catch(() => ({
      _sum: { amount: 0 },
      _count: 0,
    })),
  ]);

  const issuedTotal = totalIssued._sum.amount ?? 0;
  const issuedCount = totalIssued._count ?? 0;
  // Outstanding = sum of all remaining balances on active cards
  const outstandingBalance = cards.reduce((sum, c) => sum + c.balance, 0);
  const totalRedeemedAmount = issuedTotal - outstandingBalance;

  return { cards, issuedTotal, issuedCount, totalRedeemedAmount, outstandingBalance };
}

export default async function AdminGiftCardsPage() {
  const { cards, issuedTotal, issuedCount, totalRedeemedAmount, outstandingBalance } =
    await getGiftCardMetrics();

  const TYPE_COLORS: Record<string, string> = {
    GIFT: "bg-brand-100 text-brand-700",
    STORE_CREDIT: "bg-gold-100 text-gold-700",
    HOTEL_PACKAGE: "bg-blue-100 text-blue-700",
    REFUND_CREDIT: "bg-coral-100 text-coral-700",
  };

  return (
    <div className="space-y-8">
      <header>
        <div className="label-xs">Store</div>
        <h1 className="heading text-4xl mt-1">Gift Cards</h1>
        <p className="text-navy-400 mt-1">
          Issue, track, and manage gift cards and store credits.
        </p>
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="label-xs">Total issued</div>
          <div className="font-display text-3xl text-navy-900 mt-1">{issuedCount}</div>
          <div className="text-xs text-navy-400 mt-1">cards created</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Face value</div>
          <div className="font-display text-3xl text-navy-900 mt-1">
            &euro;{issuedTotal.toFixed(0)}
          </div>
          <div className="text-xs text-navy-400 mt-1">total issued amount</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Redeemed</div>
          <div className="font-display text-3xl text-green-700 mt-1">
            &euro;{totalRedeemedAmount.toFixed(0)}
          </div>
          <div className="text-xs text-navy-400 mt-1">spent by customers</div>
        </div>
        <div className="stat-card">
          <div className="label-xs">Outstanding</div>
          <div className="font-display text-3xl text-brand-700 mt-1">
            &euro;{outstandingBalance.toFixed(0)}
          </div>
          <div className="text-xs text-navy-400 mt-1">remaining balance</div>
        </div>
      </div>

      {/* Client-side search + deactivation actions */}
      <GiftCardActions cards={JSON.parse(JSON.stringify(cards))} typeColors={TYPE_COLORS} />
    </div>
  );
}
