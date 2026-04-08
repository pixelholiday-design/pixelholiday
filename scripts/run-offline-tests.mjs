// Group 2 — offline tests against the local kiosk API surface.
// Uses the same Next.js server (which would be the sale-kiosk PC in production).
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE = 'http://127.0.0.1:3999';
const results = [];

function rec(id, name, status, evidence) {
  results.push({ id, name, status, evidence });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${id} ${name}: ${status} — ${evidence}`);
}

async function jget(p) {
  const r = await fetch(BASE + p);
  return { status: r.status, body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }) };
}
async function jpost(p, b) {
  const r = await fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  return { status: r.status, body: await r.text().then(t => { try { return JSON.parse(t); } catch { return t; } }) };
}

// ── 2.1 Local server status ──
async function t21() {
  try {
    const r = await jget('/api/local/status');
    const ok = r.status === 200 && r.body?.status === 'ok' && r.body?.role === 'LOCAL_SERVER';
    rec('2.1', 'Local Server', ok ? 'PASS' : 'FAIL', `status=${r.status} role=${r.body?.role} name=${r.body?.name}`);
  } catch (e) { rec('2.1', 'Local Server', 'FAIL', e.message); }
}

// ── 2.2 PIN auth ──
async function t22() {
  try {
    const wrong = await jpost('/api/kiosk/verify-pin', { pin: '9999' });
    const right = await jpost('/api/kiosk/verify-pin', { pin: '1111' });
    const ok = wrong.status === 401 && right.status === 200 && right.body?.user;
    rec('2.2', 'PIN Auth', ok ? 'PASS' : 'FAIL', `wrong→${wrong.status} right→${right.status} user=${right.body?.user?.name}`);
  } catch (e) { rec('2.2', 'PIN Auth', 'FAIL', e.message); }
}

// ── 2.3 SD card upload (offline) ──
async function t23() {
  try {
    const loc = await prisma.location.findFirst();
    const ph = await prisma.user.findFirst({ where: { role: 'PHOTOGRAPHER', pin: '1111' } });
    if (!loc || !ph) return rec('2.3', 'SD Upload', 'FAIL', 'no location or photographer-with-pin in seed');

    // 1×1 transparent PNG, base64
    const tinyPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';
    const wristband = `WB-TEST-${Date.now()}`;
    const r = await jpost('/api/local/upload', {
      locationId: loc.id,
      photographerId: ph.id,
      wristbandCode: wristband,
      photos: [
        { filename: 'IMG_001.jpg', base64: tinyPng, isHookImage: true },
        { filename: 'IMG_002.jpg', base64: tinyPng },
      ],
    });
    if (r.status !== 200) return rec('2.3', 'SD Upload', 'FAIL', `status=${r.status} body=${JSON.stringify(r.body)}`);

    // Verify gallery + photos exist + sync queue entries created
    const cust = await prisma.customer.findFirst({ where: { wristbandCode: wristband } });
    const gallery = await prisma.gallery.findFirst({ where: { customerId: cust?.id }, include: { photos: true } });
    const syncCount = await prisma.syncQueue.count({ where: { type: 'photo', status: 'pending' } });
    const galleryQueued = await prisma.syncQueue.findFirst({ where: { type: 'gallery', localId: gallery?.id } });

    const ok = !!cust && !!gallery && (gallery.photos?.length ?? 0) >= 1;
    rec('2.3', 'SD Upload', ok ? 'PASS' : 'FAIL',
      `customer=${!!cust} gallery=${!!gallery} photos=${gallery?.photos?.length} syncEntries=${syncCount} galleryQueued=${!!galleryQueued}`);
    return { gallery, customer: cust };
  } catch (e) { rec('2.3', 'SD Upload', 'FAIL', e.message); return null; }
}

// ── 2.4 Camera capture (registered camera, wristband customer) ──
async function t24() {
  try {
    const loc = await prisma.location.findFirst();
    // Need a registered camera
    const reg = await jpost('/api/camera/register', {
      externalId: 'CAM-TEST-' + Date.now(),
      name: 'Slide Cam Test',
      locationId: loc.id,
      type: 'SPEED_CAM',
    });
    if (reg.status !== 200) return rec('2.4', 'Camera Capture', 'FAIL', `register=${reg.status} body=${JSON.stringify(reg.body)}`);
    const externalId = reg.body?.camera?.externalId || reg.body?.externalId;

    const wb = `WB-CAM-${Date.now()}`;
    // Pre-create customer with wristband
    await prisma.customer.create({ data: { name: 'Cam Test', wristbandCode: wb, locationId: loc.id } });

    const cap = await jpost('/api/camera/capture', {
      externalId,
      locationId: loc.id,
      wristbandCode: wb,
      imageUrl: 'https://picsum.photos/seed/cam/600/600',
    });
    if (cap.status !== 200) return rec('2.4', 'Camera Capture', 'FAIL', `capture=${cap.status} body=${JSON.stringify(cap.body)}`);

    const cust = await prisma.customer.findFirst({ where: { wristbandCode: wb }, include: { galleries: { include: { photos: true } } } });
    const gal = cust?.galleries?.[0];
    const captureCount = await prisma.camera.findFirst({ where: { externalId } }).then(c => c?.captureCount);
    const ok = !!gal && (gal.photos?.length ?? 0) > 0;
    rec('2.4', 'Camera Capture', ok ? 'PASS' : 'FAIL',
      `register=${reg.status} capture=${cap.status} gallery=${!!gal} photos=${gal?.photos?.length} captureCount=${captureCount}`);
  } catch (e) { rec('2.4', 'Camera Capture', 'FAIL', e.message); }
}

// ── 2.5 Gallery kiosk identify (uses /api/kiosk/identify) ──
async function t25() {
  try {
    const loc = await prisma.location.findFirst();
    // Use a customer with a roomNumber from seed, OR create one
    let cust = await prisma.customer.findFirst({ where: { roomNumber: { not: null } } });
    if (!cust) {
      cust = await prisma.customer.create({ data: { name: 'Room Tester', roomNumber: '999', locationId: loc.id } });
      await prisma.gallery.create({
        data: {
          status: 'PREVIEW_ECOM',
          locationId: loc.id,
          photographerId: (await prisma.user.findFirst({ where: { role: 'PHOTOGRAPHER' } })).id,
          customerId: cust.id,
          expiresAt: new Date(Date.now() + 7 * 86400 * 1000),
        },
      });
    }
    const r = await jpost('/api/kiosk/identify', {
      locationId: cust.locationId || loc.id,
      method: 'ROOM',
      roomNumber: cust.roomNumber,
    });
    const ok = r.status === 200 && r.body?.ok && Array.isArray(r.body?.galleries) && r.body.galleries.length > 0;
    rec('2.5', 'Kiosk Identify', ok ? 'PASS' : 'FAIL', `status=${r.status} ok=${r.body?.ok} galleries=${r.body?.galleries?.length}`);
  } catch (e) { rec('2.5', 'Kiosk Identify', 'FAIL', e.message); }
}

// ── 2.6 Order flow: gallery kiosk → /api/local/order → sale kiosk pulls ──
async function t26() {
  try {
    const g = await prisma.gallery.findFirst({ where: { photos: { some: {} } }, include: { photos: { take: 3 }, location: true } });
    if (!g) return rec('2.6', 'Order Flow', 'FAIL', 'no gallery with photos');
    const photoIds = g.photos.map(p => p.id);

    // Create order from gallery kiosk
    const create = await jpost('/api/local/order', { galleryId: g.id, photoIds });
    if (create.status !== 200) return rec('2.6', 'Order Flow', 'FAIL', `create=${create.status} body=${JSON.stringify(create.body)}`);

    const orderId = create.body?.order?.id;
    const dbOrder = await prisma.saleOrder.findUnique({ where: { id: orderId } });
    const queued = await prisma.syncQueue.findFirst({ where: { type: 'saleOrder', localId: orderId } });

    // Sale kiosk pulls pending orders for the location
    const list = await jget(`/api/local/order?locationId=${g.location.id}&status=PENDING`);
    const seen = list.body?.orders?.some(o => o.id === orderId);

    const ok = !!dbOrder && dbOrder.status === 'PENDING' && seen;
    rec('2.6', 'Order Flow', ok ? 'PASS' : 'FAIL',
      `create=${create.status} dbOrder=${!!dbOrder} status=${dbOrder?.status} queued=${!!queued} pulledByKiosk=${seen}`);
  } catch (e) { rec('2.6', 'Order Flow', 'FAIL', e.message); }
}

// ── 2.7 Sync queue has pending items after offline activity ──
async function t27() {
  try {
    const total = await prisma.syncQueue.count();
    const pending = await prisma.syncQueue.count({ where: { status: 'pending' } });
    const byEntity = await prisma.syncQueue.groupBy({ by: ['type'], _count: { _all: true } });
    const ok = total > 0 && pending > 0;
    rec('2.7', 'Sync Queue', ok ? 'PASS' : 'FAIL',
      `total=${total} pending=${pending} byType=${JSON.stringify(byEntity.map(b => `${b.type}:${b._count._all}`))}`);
  } catch (e) { rec('2.7', 'Sync Queue', 'FAIL', e.message); }
}

async function main() {
  console.log('=== Running offline / local-network tests (Group 2) ===\n');
  await t21();
  await t22();
  await t23();
  await t24();
  await t25();
  await t26();
  await t27();

  console.log('\n=== OFFLINE RESULTS TABLE ===');
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
