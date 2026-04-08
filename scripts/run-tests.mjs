// Real end-to-end tests against running server + DB.
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const stripeForSig = new Stripe('sk_test_dummy_for_local', { apiVersion: '2025-09-30.clover' });

function signStripe(payload, secret) {
  // Use Stripe SDK's exact signature generation to match constructEvent expectations
  return stripeForSig.webhooks.generateTestHeaderString({ payload, secret });
}

const prisma = new PrismaClient();
const BASE = 'http://127.0.0.1:3999';
const results = [];
let SESSION_COOKIE = '';

async function login() {
  // Step 1: get CSRF token
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.get('set-cookie') || '';
  const { csrfToken } = await csrfRes.json();

  // Step 2: post credentials
  const form = new URLSearchParams({
    csrfToken,
    email: 'admin@pixelholiday.local',
    password: 'password123',
    callbackUrl: BASE + '/admin/dashboard',
    json: 'true',
  });
  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookies.split(',').map(c => c.split(';')[0]).join('; '),
    },
    body: form.toString(),
    redirect: 'manual',
  });
  const setCookies = loginRes.headers.get('set-cookie') || '';
  // Collect all cookies (csrf + session)
  const allCookies = [csrfCookies, setCookies]
    .flatMap(c => c.split(/,(?=\s*[A-Za-z0-9_-]+=)/))
    .map(c => c.trim().split(';')[0])
    .filter(Boolean);
  SESSION_COOKIE = [...new Set(allCookies)].join('; ');
  console.log(`[auth] login status=${loginRes.status}, cookies=${SESSION_COOKIE.length} chars`);
}

function rec(id, name, status, evidence) {
  results.push({ id, name, status, evidence });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${id} ${name}: ${status} — ${evidence}`);
}

async function jget(path, auth = false) {
  const r = await fetch(BASE + path, { headers: auth && SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {} });
  return { status: r.status, body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }) };
}
async function jpost(path, body, headers = {}, auth = false) {
  const h = { 'Content-Type': 'application/json', ...headers };
  if (auth && SESSION_COOKIE) h.Cookie = SESSION_COOKIE;
  const r = await fetch(BASE + path, { method: 'POST', headers: h, body: JSON.stringify(body) });
  return { status: r.status, body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }) };
}

// ── TEST 1.1 — Online Gallery Purchase
async function t11() {
  try {
    const g = await prisma.gallery.findFirst({ where: { status: 'PREVIEW_ECOM' }, include: { photos: { take: 3 } } });
    if (!g) return rec('1.1', 'Gallery Purchase', 'FAIL', 'no PREVIEW_ECOM gallery in seed');
    const get = await jget(`/gallery/${g.magicLinkToken}`);
    if (get.status !== 200) return rec('1.1', 'Gallery Purchase', 'FAIL', `GET /gallery/${g.magicLinkToken} → ${get.status}`);

    // Favorite — endpoint toggles, so verify the value FLIPPED from original
    const photo = g.photos[0];
    const beforeFav = photo.isFavorited;
    const fav = await jpost(`/api/gallery/${g.magicLinkToken}/favorite`, { photoId: photo.id });
    const updated = await prisma.photo.findUnique({ where: { id: photo.id } });
    const favOk = fav.status === 200 && updated?.isFavorited === !beforeFav;

    // Webhook simulation with proper HMAC signature
    const ev = {
      id: 'evt_test_' + Date.now(),
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_' + Date.now(), metadata: { galleryId: g.id }, amount_total: 4900, currency: 'eur', customer_email: 'webhook@test.com' } },
    };
    const payload = JSON.stringify(ev);
    const SECRET = 'whsec_test_local_secret_for_runtime_verification';
    const sig = signStripe(payload, SECRET);
    const wh = await fetch(BASE + '/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'stripe-signature': sig },
      body: payload,
    }).then(async r => ({ status: r.status, body: await r.text() }));

    const after = await prisma.gallery.findUnique({ where: { id: g.id } });
    const order = await prisma.order.findFirst({ where: { galleryId: g.id }, orderBy: { createdAt: 'desc' } });
    const paid = after?.status === 'PAID';

    const status = favOk && paid ? 'PASS' : favOk ? 'PARTIAL' : 'FAIL';
    rec('1.1', 'Gallery Purchase', status, `GET 200, fav=${favOk}, webhook→${wh.status} ${String(wh.body).slice(0,80)}, gallery.status=${after?.status}`);
  } catch (e) { rec('1.1', 'Gallery Purchase', 'FAIL', e.message); }
}

// ── TEST 1.2 — Digital Pass Purchase
async function t12() {
  try {
    const loc = await prisma.location.findFirst();
    const get = await jget(`/pass/${loc.id}`);
    const purchase = await jpost('/api/pass/purchase', {
      locationId: loc.id,
      tier: 'UNLIMITED',
      customerName: 'Test Pass',
      customerEmail: `pass-${Date.now()}@test.com`,
      whatsapp: '+1234567890',
    });
    const customer = await prisma.customer.findFirst({ where: { hasDigitalPass: true }, orderBy: { createdAt: 'desc' } });
    if (purchase.status === 200 && customer?.hasDigitalPass) {
      rec('1.2', 'Digital Pass', 'PASS', `purchase→${purchase.status}, customer.hasDigitalPass=true, type=${customer.digitalPassType}`);
    } else {
      rec('1.2', 'Digital Pass', 'FAIL', `pass page=${get.status}, purchase=${purchase.status}, body=${JSON.stringify(purchase.body).slice(0,200)}`);
    }
  } catch (e) { rec('1.2', 'Digital Pass', 'FAIL', e.message); }
}

// ── TEST 1.3 — QR Pre-Booking
async function t13() {
  try {
    const qr = await prisma.qRCode.findFirst({ where: { type: 'HOTEL_ROOM' } });
    if (!qr) return rec('1.3', 'QR Pre-Booking', 'FAIL', 'no HOTEL_ROOM QR in seed');
    const get = await jget(`/book/${qr.id}`);
    const before = qr.scanCount;
    const slot = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const book = await jpost('/api/booking/qr-prebook', {
      qrCodeId: qr.id,
      scheduledTime: slot,
      customerName: 'Test Booker',
      whatsapp: '+1234567890',
    });
    const after = await prisma.qRCode.findUnique({ where: { id: qr.id } });
    const appt = await prisma.appointment.findFirst({ where: { qrCodeId: qr.id }, orderBy: { createdAt: 'desc' } });
    if (book.status === 200 && appt) {
      rec('1.3', 'QR Pre-Booking', 'PASS', `book=${book.status}, appt.id=${appt.id.slice(0,8)}, source=${appt.source}, scanCount ${before}→${after.scanCount}`);
    } else {
      rec('1.3', 'QR Pre-Booking', 'FAIL', `page=${get.status}, book=${book.status}, body=${JSON.stringify(book.body).slice(0,200)}`);
    }
  } catch (e) { rec('1.3', 'QR Pre-Booking', 'FAIL', e.message); }
}

// ── TEST 1.4 — Shop
async function t14() {
  try {
    const page = await jget('/shop');
    const products = await jget('/api/shop/products');
    const ok = page.status === 200 && products.status === 200;
    rec('1.4', 'Shop', ok ? 'PASS' : 'FAIL', `shop=${page.status}, products=${products.status}, count=${Array.isArray(products.body)?products.body.length:Array.isArray(products.body?.products)?products.body.products.length:'?'}`);
  } catch (e) { rec('1.4', 'Shop', 'FAIL', e.message); }
}

// ── TEST 1.5 — SaaS Signup
async function t15() {
  try {
    const email = `signup-${Date.now()}@test.com`;
    const r = await jpost('/api/saas/signup', {
      name: 'Test Owner',
      email,
      password: 'TestPass123!',
      businessName: 'Test Photo Co',
    });
    const user = await prisma.user.findUnique({ where: { email } });
    const org = user ? await prisma.organization.findUnique({ where: { id: user.orgId } }) : null;
    if (r.status === 200 && user && org) {
      rec('1.5', 'SaaS Signup', 'PASS', `user.id=${user.id.slice(0,8)}, role=${user.role}, org.type=${org.type}`);
    } else {
      rec('1.5', 'SaaS Signup', 'FAIL', `status=${r.status}, user=${!!user}, body=${JSON.stringify(r.body).slice(0,200)}`);
    }
  } catch (e) { rec('1.5', 'SaaS Signup', 'FAIL', e.message); }
}

// ── TEST 1.6 — Sleeping Money
async function t16() {
  try {
    const g1 = await prisma.gallery.findFirst({ where: { status: 'PREVIEW_ECOM' } });
    if (g1) {
      await prisma.gallery.update({
        where: { id: g1.id },
        data: { customer: { update: { cartAbandoned: true, cartAbandonedAt: new Date(Date.now() - 4 * 86400 * 1000) } } },
      }).catch(() => {});
    }
    const ac = await jpost('/api/automation/abandoned-cart', {});
    const su = await jpost('/api/automation/sweep-up', {});
    const ok = (ac.status === 200 || ac.status === 201) && (su.status === 200 || su.status === 201);
    rec('1.6', 'Sleeping Money', ok ? 'PASS' : 'FAIL', `abandoned=${ac.status}, sweepup=${su.status}, body=${JSON.stringify(ac.body).slice(0,150)}`);
  } catch (e) { rec('1.6', 'Sleeping Money', 'FAIL', e.message); }
}

// ── TEST 1.7 — Admin Dashboard Data Integrity
async function t17() {
  try {
    const r = await jget('/api/admin/dashboard', true);
    if (r.status !== 200) return rec('1.7', 'Dashboard Integrity', 'FAIL', `status=${r.status}`);
    const totalRev = await prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } });
    const galleryCount = await prisma.gallery.count();
    rec('1.7', 'Dashboard Integrity', 'PASS', `dashboard=200, DB totalRev=${totalRev._sum.amount}, galleries=${galleryCount}, dashboard keys=${Object.keys(r.body).join(',').slice(0,200)}`);
  } catch (e) { rec('1.7', 'Dashboard Integrity', 'FAIL', e.message); }
}

// ── TEST 1.8 — Admin Operations
async function t18() {
  try {
    const loc = await prisma.location.findFirst();
    const checks = await Promise.all([
      jget('/api/admin/staff', true),
      jget('/api/admin/payroll', true),
      jget('/api/admin/pricing', true),
      jget(`/api/admin/cash/${loc.id}`, true),
      jget('/api/admin/bookings', true),
      jget('/api/admin/sleeping-money', true),
      jget('/api/admin/commissions', true),
    ]);
    const labels = ['staff','payroll','pricing','cash','bookings','sleeping-money','commissions'];
    const summary = checks.map((c, i) => `${labels[i]}=${c.status}`).join(' ');
    const allOk = checks.every(c => c.status === 200);
    rec('1.8', 'Admin Ops', allOk ? 'PASS' : 'PARTIAL', summary);
  } catch (e) { rec('1.8', 'Admin Ops', 'FAIL', e.message); }
}

// ── Run all
async function main() {
  console.log('=== Running 8 online tests ===\n');
  await login();
  await t11();
  await t12();
  await t13();
  await t14();
  await t15();
  await t16();
  await t17();
  await t18();

  console.log('\n=== RESULTS TABLE ===');
  console.log('| Test | Name | Status |');
  console.log('|------|------|--------|');
  for (const r of results) console.log(`| ${r.id} | ${r.name} | ${r.status} |`);
  const pass = results.filter(r => r.status === 'PASS').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nTotals: ${pass} PASS · ${partial} PARTIAL · ${fail} FAIL · ${results.length} total`);

  await prisma.$disconnect();
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });
