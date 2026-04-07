# PixelHoliday — API Reference

## Auth
- `GET/POST /api/auth/[...nextauth]` — NextAuth handlers

## Upload
- `POST /api/upload/presigned` — Generate R2 presigned URL. Body: `{ filename, contentType }`
- `POST /api/upload/complete` — Finalize upload, create Gallery. Body: `{ photographerId, locationId, customerId, photoKeys }`

## Gallery
- `GET /api/gallery/[token]` — Get gallery by magic link
- `POST /api/gallery/[token]/favorite` — Toggle favorite. Body: `{ photoId }`
- `POST /api/gallery/[token]/book` — Create appointment. Body: `{ scheduledTime }`
- `GET /api/gallery/[token]/download` — Generate ZIP

## Webhooks
- `POST /api/webhooks/stripe` — Stripe payment webhook
- `POST /api/webhooks/whatsapp` — WhatsApp incoming
- `GET /api/webhooks/whatsapp` — WhatsApp verification

## Kiosk
- `GET /api/kiosk/gallery/[id]` — Local network gallery data
- `POST /api/kiosk/sale` — Process sale
- `POST /api/kiosk/sync` — Sync to cloud

## Admin
- `GET /api/admin/dashboard` — Analytics
- `GET/POST/PATCH/DELETE /api/admin/staff` — Staff CRUD
- `GET /api/admin/commissions` — Commission calculations
- `GET/POST /api/admin/equipment` — Equipment
- `GET/POST /api/admin/shifts` — Shifts
- `GET/POST /api/admin/transfers` — Staff transfers
- `GET/POST /api/admin/housing` — Housing

## Booking
- `POST /api/booking/create` — Create booking
- `POST /api/booking/dispatch` — Auto-assign photographer

## AI
- `POST /api/ai/cull` — AI photo culling
- `POST /api/ai/face-match` — Face recognition
- `POST /api/ai/auto-reel` — Generate reel
- `POST /api/ai/magic-shot` — AR overlay
- `GET /api/ai/growth` — Growth Engine v2 insights
- `POST /api/ai/blog` — Blog generation

## Customer
- `POST /api/customer/identify` — Face/QR/NFC/room lookup
- `GET/POST /api/customer/digital-pass` — Digital pass

## B2B
- `GET/POST /api/b2b/delivery` — B2B photo delivery tracking

## Shop
- `GET /api/shop/products` — Product list
- `POST /api/shop/checkout` — Checkout

## Franchise
- `GET /api/franchise` — List franchises
- `POST /api/franchise` — Create franchise. Body: `{ name, parentOrgId, saasCommissionRate?, sleepingMoneyShare? }`
- `GET /api/franchise/[orgId]` — Franchise details
- `PATCH /api/franchise/[orgId]` — Update franchise
- `GET /api/franchise/revenue?orgId=` — Revenue summary

## Academy
- `GET /api/academy/modules`
- `GET/POST /api/academy/progress`

## Chat
- `GET/POST /api/chat/messages`
- `GET /api/chat/channels`
