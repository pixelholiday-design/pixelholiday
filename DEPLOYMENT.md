# Fotiqo — Deployment Guide

This walks you through getting Fotiqo from local dev onto Vercel + Neon
+ Cloudflare R2 + Cloudinary + Stripe + Resend.

Each section ends with a **smoke test** so you can stop and verify before
moving on. Don't enable Stripe live mode until *every* prior step is green.

---

## 0. Prerequisites

- Repo pushed to GitHub
- A Vercel account (free hobby plan is fine)
- About 30 min for the first run-through

---

## 1. Database — Neon Postgres (free)

1. https://console.neon.tech → **Create Project**
2. Region: pick one close to your Vercel region (default `iad1` → US East)
3. Postgres version: **16**
4. Project name: `fotiqo`
5. After creation, click **Connection Details** and copy the **pooled** connection string. It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
6. Save this as `DATABASE_URL` for later.

**Smoke test:**
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx tsx prisma/seed.ts
```
You should see "All migrations have been successfully applied" and the seed
summary (8 users, 10 galleries, etc.).

---

## 2. Object storage — Cloudflare R2

R2 holds the original photo files. Cloudinary handles watermarking on top of
them.

1. https://dash.cloudflare.com → **R2 Object Storage** → **Create bucket**
   - Name: `fotiqo-photos`
   - Location: Automatic
2. **Settings → Public Access**: enable a public dev URL or attach a custom
   domain like `photos.your-domain.com`. Save this as `R2_PUBLIC_URL`.
3. **Manage R2 API Tokens** → **Create API token**
   - Permissions: **Object Read & Write**
   - TTL: forever
   - Save the **Access Key ID** and **Secret Access Key**
4. From the Cloudflare dashboard URL grab your **Account ID** (the 32-char hex).

You now have:
```
R2_ACCOUNT_ID=<32-hex>
R2_ACCESS_KEY_ID=<from token>
R2_SECRET_ACCESS_KEY=<from token>
R2_BUCKET_NAME=fotiqo-photos
R2_PUBLIC_URL=https://photos.your-domain.com
```

**Smoke test (after deploy):** open `/admin/upload`, upload a single JPG,
check the bucket in the Cloudflare dashboard for the new object key.

---

## 3. Image transforms — Cloudinary

Cloudinary handles dynamic watermarking and the `download_zip_url` archive.

1. https://cloudinary.com → sign up (free tier is plenty for testing)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. **Media Library** → upload a PNG with the Fotiqo logo + `WATERMARK`
   text. Note its public ID (e.g. `fotiqo_watermark`).
4. Save:
   ```
   CLOUDINARY_CLOUD_NAME=<cloud name>
   CLOUDINARY_API_KEY=<api key>
   CLOUDINARY_API_SECRET=<api secret>
   CLOUDINARY_WATERMARK_PUBLIC_ID=fotiqo_watermark
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud name>
   NEXT_PUBLIC_CLOUDINARY_WATERMARK_PUBLIC_ID=fotiqo_watermark
   ```

**Smoke test:** open any seeded gallery — the watermarked images should
load (URLs contain `l_fotiqo_watermark,w_0.5,g_center,o_40`).

---

## 4. Payments — Stripe (TEST MODE FIRST)

> ⚠️ Do **not** start with live keys. Use test keys for at least one
> end-to-end checkout, then a webhook signature replay, then switch to live.

1. https://dashboard.stripe.com → toggle **Test mode** (top right)
2. **Developers → API keys** — copy `sk_test_...` and `pk_test_...`
3. **Developers → Webhooks → Add endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: **`checkout.session.completed`**
   - Save and copy the **Signing secret** (`whsec_...`)
4. Save:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Smoke test:** in test mode, create a checkout session, pay with card
`4242 4242 4242 4242`, watch the webhook fire in the Stripe dashboard,
verify the gallery flips to `PAID` and an `Order` row appears in Neon.

**Switching to live:** swap `sk_test_` → `sk_live_`, create a new live-mode
webhook with its own `whsec_`, redeploy. Run a real €1 charge through
yourself before opening the kiosk to customers.

---

## 5. Email — Resend (optional)

1. https://resend.com → **API Keys** → Create
2. **Domains** → add and verify your sending domain (DNS records)
3. Save:
   ```
   RESEND_API_KEY=re_...
   FROM_EMAIL=hello@your-domain.com
   ```

When unset, the app logs `[Email MOCK → ...]` to stdout instead of sending.

---

## 6. WhatsApp — Meta Cloud API (optional)

Required for the O2O hook flow and real-time speed-camera pings.

1. https://developers.facebook.com → Create app → **Business → WhatsApp**
2. **WhatsApp → Getting Started**
3. Add a phone number, copy the **Phone number ID** and the **Permanent
   access token**
4. Set a **Webhook verify token** (any random string) — you'll need it
   for the webhook subscription URL `/api/webhooks/whatsapp`
5. Save:
   ```
   WHATSAPP_TOKEN=EAA...
   WHATSAPP_PHONE_NUMBER_ID=1234567890
   WHATSAPP_VERIFY_TOKEN=<your random string>
   ```

---

## 7. Vercel deploy

1. https://vercel.com → **Add New… → Project** → import the GitHub repo
2. **Framework Preset:** Next.js (auto-detected)
3. **Build & Output Settings:**
   - Build Command: leave default — `package.json` already exposes
     `vercel-build` which runs `prisma generate && prisma migrate deploy && next build`
4. **Environment Variables:** paste every var from `.env.production.example`
   that you've collected. Required minimum to even *boot*:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` = `https://<your-vercel-url>`
   - `NEXT_PUBLIC_APP_URL` = same as above
5. Click **Deploy**

The very first deploy will:
- Run `prisma generate`
- Run `prisma migrate deploy` against Neon (applies the baseline
  `20260407_init` migration)
- Build the Next.js app

After it finishes, **manually run the seed once** from your local terminal
against the production DB:
```bash
DATABASE_URL="<neon prod url>" npx tsx prisma/seed.ts
```

Then visit `https://<your-vercel-url>/login` and sign in as
`admin@fotiqo.local` / `password123`. **Change this password
immediately** in `/admin/staff` once you confirm everything works.

---

## 8. Post-deploy checklist

- [ ] `/login` loads, premium split-screen renders
- [ ] Sign in as CEO → land on `/admin/dashboard` with real revenue tile
- [ ] `/admin/cameras` shows seeded cameras (0 if none yet)
- [ ] `/admin/pricing` is editable
- [ ] `/admin/payroll` shows a current-month row
- [ ] `/kiosk/self-service` opens without auth
- [ ] `/kiosk/sale-point` PinPad accepts `1111` (test PIN — change in seed for prod)
- [ ] `/api/webhooks/stripe` returns 400 to a GET (correct — only POST allowed)
- [ ] Create a real Stripe test checkout and confirm `Gallery.status = PAID`
- [ ] Replay the same webhook event ID — should return `{duplicate: true}`
- [ ] Upload a file at `/admin/upload` → check the R2 bucket
- [ ] Open `/api/gallery/<token>/download` for a paid gallery → 302 to
      Cloudinary archive URL

---

## 9. Custom domain

In Vercel: **Project → Domains → Add** → enter your domain → follow the
DNS instructions. Then update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
to the new domain and redeploy.

---

## 10. Production hardening before launch

1. **Change all seeded passwords** — `admin@fotiqo.local` / `password123`
   is a known credential. Change in `/admin/staff` or via SQL.
2. **Change all kiosk PINs** — `1111`, `2222`, `3333`, `4444` are seed
   values. Update via the staff page or SQL.
3. **Rotate `NEXTAUTH_SECRET`** to a fresh `openssl rand -base64 32`.
4. **Stripe live keys** — only after a green test-mode dry run.
5. **Enable Sentry / log drain** in Vercel for runtime errors.
6. **Set up Neon point-in-time recovery** in their console.
7. **Add a Cloudflare WAF rule** in front of `/api/webhooks/*` to allow
   only known IPs (Stripe, Meta).
8. **Run `scripts/health-check.ts`** as a post-deploy hook to confirm
   every external service responds.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails with `Environment variable not found: DATABASE_URL` | env not set in Vercel | Add it under Project → Settings → Environment Variables and redeploy |
| `prisma migrate deploy` says "no migrations" | `prisma/migrations` folder not committed | Commit it; the baseline `20260407_init` must be in git |
| `/api/checkout` returns 503 | `STRIPE_SECRET_KEY` not set | Set it in Vercel and redeploy |
| Watermark URLs 404 | Cloudinary not configured OR watermark public ID wrong | Check `CLOUDINARY_*` vars and that the watermark exists in your media library |
| Login works locally but 500s in prod | `NEXTAUTH_SECRET` not set or `NEXTAUTH_URL` mismatch | Set both, ensure URL matches the actual prod domain |
| Neon "too many connections" | Using direct connection instead of pooled | Switch `DATABASE_URL` to the `-pooler` host |
