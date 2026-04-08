# PixelHoliday

> High-volume resort photography delivery & e-commerce platform.

PixelHoliday powers the entire workflow for resort, water-park, and attraction
photography studios — from speed-camera capture all the way to printed albums,
sleeping-money campaigns, and franchise management.

See **[CLAUDE.md](./CLAUDE.md)** for the full module spec (23 modules, 150+
features) and **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the production deploy
guide.

## Quick start

```bash
# 1. Install
npm install

# 2. Postgres + env
cp .env.production.example .env
# edit .env with your DATABASE_URL, NEXTAUTH_SECRET, etc.

# 3. Database
npx prisma db push       # local dev
# OR
npx prisma migrate deploy  # production

# 4. Seed test data (8 users, 10 galleries, cash registers, ...)
npx tsx prisma/seed.ts

# 5. Run
npm run dev
# → http://localhost:3000/login
# → admin@pixelholiday.local / password123
```

## Test users (all `password123`)

| Email | Role | PIN |
|---|---|---|
| `admin@pixelholiday.local` | CEO | — |
| `ops@pixelholiday.local` | OPERATIONS_MANAGER | — |
| `super@pixelholiday.local` | SUPERVISOR | `4444` |
| `photo1@pixelholiday.local` | PHOTOGRAPHER | `1111` |
| `photo2@pixelholiday.local` | PHOTOGRAPHER | `2222` |
| `sales@pixelholiday.local` | SALES_STAFF | `3333` |
| `reception@pixelholiday.local` | RECEPTIONIST | — |
| `trainee@pixelholiday.local` | ACADEMY_TRAINEE | — |

## Architecture

- **Next.js 14** App Router · **Prisma** + **PostgreSQL** · **TailwindCSS**
- **Cloudflare R2** for original photo storage (presigned uploads, never through Next.js)
- **Cloudinary** for watermarking, AI auto-edit chain, and ZIP archive generation
- **Stripe** for online payments + Stripe Terminal for kiosk POS
- **NextAuth** (JWT + credentials) for staff auth, **PIN gate** for kiosk POS
- **Resend** for transactional email · **WhatsApp Cloud API** for delivery
- Local-network mode: sale-point kiosk acts as a LAN server for gallery kiosks
  when offline (see `/admin/kiosk-setup`).

## Module map (CLAUDE.md sections)

| # | Module | Status |
|---|---|---|
| 1 | Upload Hub | ✅ |
| 2 | Customer Gallery (Pixieset-level) | ✅ |
| 3 | Server-side watermarking | ✅ |
| 4 | Stripe + automation | ✅ |
| 5 | O2O hook engine | ✅ |
| 6 | Kiosk POS + sale point + self-service | ✅ |
| 7 | Customer ID (QR/face/room) | ⚠️ face stub |
| 8 | Sleeping money | ✅ |
| 9 | AI auto-reel | ❌ |
| 10 | Magic shots / AR | ⚠️ |
| 11 | Pre-arrival funnel + digital pass | ✅ |
| 12 | Real-time mobile streaming | ⚠️ |
| 13 | Pro retouch + AI auto-edit | ✅ |
| 14 | CEO dashboard | ✅ |
| 15 | Staff management | ✅ |
| 16 | Academy & HR | ✅ |
| 17 | Booking management | ✅ |
| 18 | Portfolio + shop | ⚠️ |
| 19 | SaaS for external photographers | ⚠️ |
| 20 | AI growth engine | ❌ |
| 21 | Franchise system | ⚠️ |
| 22 | B2B media barter | ✅ |
| 23 | Communication engine | ✅ |

(Cash management, payroll, pricing config, print queue, kiosk network, photo
flow, GDPR delete, health check, error boundary, structured logger — all built
on top of the spec.)

## Deploying

Read **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step Vercel +
Neon + R2 + Cloudinary + Stripe walkthrough with smoke tests at every stage.

## Health check

```bash
curl https://your-domain.com/api/health
# { "status": "ok", "database": "connected", "uptimeMs": 12345 }
```

## GDPR

Customers can delete all their data via:

```bash
POST /api/gdpr/delete
{ "email": "guest@example.com", "confirm": "DELETE_MY_DATA" }
```

## License

Proprietary · © PixelHoliday

<!-- Deploy trigger: 2026-04-08T12:47:15 -->
# PixelHoliday
