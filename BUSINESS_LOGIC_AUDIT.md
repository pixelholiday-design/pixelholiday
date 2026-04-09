# BUSINESS LOGIC AUDIT REPORT - Fotiqo
**Date:** 2026-04-09
**Auditor:** Business Logic Expert (Claude)

---

## REVENUE STREAMS VERIFIED

| Stream | Status | Commission Logic | Issues Found |
|--------|--------|-----------------|--------------|
| Resort gallery sales (online) | FIXED | Commission on NET (after Stripe fees) | Was calculated on GROSS - silent 3% margin leak |
| Kiosk cash sales | FIXED | Cash register reconciliation OK | Was using hardcoded prices, bypassing PricingConfig |
| Kiosk card sales | FIXED | Stripe Terminal fee tracked | Stripe fee was not recorded on Order |
| Online print/product sales | OK | 2% digital / 50% physical profit | Lab cost tracking exists |
| Digital pass sales | OK | 15% commission rate | Correct |
| Gift card sales | FIXED | Now tracked as deferred revenue | Was recognized as immediate income - accounting violation |
| Marketplace bookings | FIXED | 10% platform fee now calculated | Was COMPLETELY MISSING - zero commission logic |
| SaaS platform fees | OK | 2% via fulfillment commission | Correct |
| Sleeping money (automated) | OK | 20% commission, 50% revenue share | Correct |

---

## MONEY FLOW ISSUES FOUND & FIXED

### CRITICAL: Commission calculated on GROSS, not NET
**Impact:** On every Stripe transaction, we were paying 10% commission on the full amount but only receiving ~97% (after Stripe's 2.9% + EUR0.30). On EUR100 sale: we paid EUR10 commission but only received EUR96.80. Real margin was 86.8%, not 90%.

**Fix:** `src/lib/commissions.ts` — `calculateLocationCommission()` now deducts Stripe fee before calculating commission. Added `calculateStripeFee()` and `calculateNetAmount()` helpers.

**Annual impact at EUR1M revenue:** ~EUR3,000 saved per year in over-paid commissions.

### CRITICAL: Marketplace had ZERO commission logic
**Impact:** Photographers were being booked through the marketplace but Fotiqo received nothing. No platform fee calculated, no Stripe fee tracked, no payout mechanism.

**Fix:**
- `prisma/schema.prisma` — Added `platformFee`, `platformFeeRate`, `photographerPayout`, `stripeFee`, `payoutStatus`, `PayoutStatus` enum to MarketplaceBooking
- `src/lib/commissions.ts` — Added `recordMarketplaceCommission()` function
- `src/app/api/marketplace/book/route.ts` — Now calculates and records 10% platform fee at booking creation
- `src/app/api/webhooks/stripe/route.ts` — Handles `bookingId` metadata for marketplace payments

### CRITICAL: Gift card revenue recognized immediately
**Impact:** Accounting compliance violation. Gift card purchase should create a LIABILITY (deferred revenue), not income. Revenue is only recognized when the card is redeemed. Unredeemed cards after 12 months become breakage revenue.

**Fix:**
- `prisma/schema.prisma` — Added `totalRedeemed`, `breakageRecognized`, `breakageAmount`, `breakageDate` to GiftCard. Created `GiftCardRedemption` model for audit trail.
- `src/lib/gift-cards.ts` — Complete rewrite with: proper deferred revenue tracking, `processBreakage()` for expired cards, `getGiftCardFinancials()` for reporting, anti-fraud limits (EUR500 max, 10 cards per purchase)

### HIGH: Kiosk using hardcoded prices
**Impact:** The kiosk sale route used `PRICES.FULL_GALLERY` (EUR99) and `PRICES.SINGLE_PHOTO` (EUR15) from `stripe.ts` instead of the PricingConfig system. Location-specific pricing (luxury +30%, splash -25%) was completely bypassed at kiosks - the highest-volume sales channel.

**Fix:** `src/app/api/kiosk/sale/route.ts` — Now uses `getPrice()` from pricing.ts with location ID for proper per-location pricing. Also adds Stripe fee tracking and cash register transaction recording.

### HIGH: Refund only reversed unpaid commissions
**Impact:** If a photographer's commission was already marked as paid (e.g., monthly payroll already processed) and the customer got a refund, the commission was never clawed back. On partial refunds, no commission adjustment was made at all.

**Fix:** `src/lib/commissions.ts` — Added `reverseCommissions()` that handles both full and partial refunds:
- Full refund: zeros unpaid commissions, creates negative adjustment for paid ones
- Partial refund: proportional reduction of unpaid, negative adjustment for paid
`src/app/api/refund/route.ts` — Now calls `reverseCommissions()` for both full and partial refunds, surfaces `stripeFeeAbsorbed` to CEO dashboard.

### HIGH: No Stripe fee tracking on orders
**Impact:** Impossible to calculate real margins. The Order model had no fields to store Stripe processing fees, net amounts, or tax.

**Fix:** `prisma/schema.prisma` — Added `stripeFee`, `netAmount`, `taxAmount`, `taxRate` to Order model. All payment handlers now populate these fields.

### MEDIUM: Gallery expiry coupon not restricted
**Impact:** The 48-hour auto-coupon (20% off) was created as a general coupon with no gallery restriction. Any customer could use any expiry coupon on any gallery.

**Fix:** Added `galleryId` to Coupon model. Gallery expiry automation now ties the coupon to the specific gallery.

### MEDIUM: No financial dashboard
**Impact:** CEO had no way to see P&L, margin by location, or unit economics.

**Fix:** Created `src/app/api/admin/finance/route.ts` — Complete P&L dashboard with:
- Revenue by stream (resort, sleeping money, shop, marketplace, gift cards)
- Costs by category (Stripe fees, commissions, lab costs, cash expenses, refund losses)
- Profit calculation and margin percentage
- Unit economics per business model
- Breakdowns by payment method and location

---

## MISSING LOGIC BUILT

| What | Files |
|------|-------|
| Commission ledger with status tracking | `prisma/schema.prisma` (CommissionStatus enum), `src/lib/commissions.ts` |
| Marketplace commission calculation | `src/lib/commissions.ts` (recordMarketplaceCommission) |
| Gift card deferred revenue & breakage | `src/lib/gift-cards.ts`, `prisma/schema.prisma` (GiftCardRedemption) |
| Financial P&L API | `src/app/api/admin/finance/route.ts` |
| Anti-fraud: refund rate limiting | `src/app/api/refund/route.ts` (max 3/customer/month) |
| Anti-fraud: gift card limits | `src/lib/gift-cards.ts` (EUR500 max, 10 cards max) |
| Anti-fraud: high-value booking verification | `src/app/api/marketplace/book/route.ts` (phone required >EUR300) |
| Commission reversal for paid commissions | `src/lib/commissions.ts` (reverseCommissions) |
| Stripe fee calculation helper | `src/lib/commissions.ts` (calculateStripeFee) |
| Marketplace payout tracking | `prisma/schema.prisma` (PayoutStatus enum, escrow fields) |

---

## UNIT ECONOMICS SUMMARY

### Resort Photography (Core Business)
- **Average sale price:** EUR85 (weighted across luxury/splash)
- **Stripe fee per sale:** ~EUR2.77 (3.2% effective)
- **Photographer commission:** ~EUR8.22 (10% of NET)
- **NET margin per session:** ~EUR74 (87%)
- **Break-even:** 14 sessions/month to cover 1 photographer salary (EUR1,000/month)

### SaaS Platform (External Photographers)
- **Platform fee:** 2% of digital sales
- **Cost to serve:** ~EUR2/month (storage + compute)
- **NET per photographer:** ~EUR8/month
- **Break-even:** 250 photographers for EUR2,000/month platform revenue

### Marketplace (Photographer-to-Go)
- **Platform fee:** 10% of booking price
- **Average booking:** EUR150
- **Stripe fee:** ~EUR4.65
- **NET per booking:** EUR10.35
- **Break-even:** 200 bookings/month for EUR2,070/month

---

## SCHEMA CHANGES

Added to `prisma/schema.prisma`:
- **Order:** `stripeFee`, `netAmount`, `taxAmount`, `taxRate`
- **Commission:** `bookingId`, `grossAmount`, `netAmount`, `status` (CommissionStatus enum), `notes`, `createdAt`
- **CommissionStatus:** PENDING, APPROVED, PAID, REVERSED, ADJUSTED
- **MarketplaceBooking:** `platformFeeRate`, `platformFee`, `photographerPayout`, `stripeFee`, `payoutStatus`, `payoutAt`, `escrowReleasedAt`
- **PayoutStatus:** PENDING, HELD, RELEASED, PAID, CANCELLED
- **GiftCard:** `totalRedeemed`, `breakageRecognized`, `breakageAmount`, `breakageDate`, `redemptions` relation
- **GiftCardRedemption:** New model for audit trail (giftCardId, amount, orderId, shopOrderId, redeemedBy)
- **Coupon:** `galleryId` for gallery-specific coupons
