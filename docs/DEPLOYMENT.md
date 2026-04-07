# PixelHoliday — Deployment Guide

## Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Git

## 1. Environment Setup
Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — random 32+ char string
- `NEXTAUTH_URL` — http://localhost:3000 (dev) or production URL
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — Cloudflare R2
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_WATERMARK_PUBLIC_ID`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_TERMINAL_LOCATION_ID`
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`
- `RESEND_API_KEY`, `FROM_EMAIL`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_KIOSK_MODE`

## 2. Database Setup
```bash
createdb pixelholiday
npx prisma migrate dev
npm run db:seed
```

## 3. Local Development
```bash
npm install
npm run dev
```

## 4. Vercel Deployment
1. Push to GitHub
2. Import project at vercel.com
3. Add all environment variables
4. Set build command: `prisma generate && next build`
5. Deploy

## 5. Kiosk Local Network Setup
- Install local Wi-Fi router (closed network, no internet needed for sale)
- Connect Nikon D7000 → SSD → Kiosk PC via local network
- Run kiosk app with `NEXT_PUBLIC_KIOSK_MODE=true`
- Background sync engine pushes data to cloud nightly

## 6. Third-Party Services
- **Cloudflare R2**: create bucket, generate API token (read+write), set CORS to allow your domain
- **Cloudinary**: create account, upload watermark to media library, note its public_id
- **Stripe**: enable webhooks at `/api/webhooks/stripe`, copy signing secret
- **WhatsApp Cloud API**: register at developers.facebook.com, configure phone number, set webhook
- **Resend**: create API key, verify sending domain

## Test Login Credentials
After running `npm run db:seed`:
- CEO: `ceo@pixelholiday.com` / `password123`
- Photographer: `photographer@pixelholiday.com` / `password123`
