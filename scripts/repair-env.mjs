// Repair Vercel env vars: for each corrupted var, rm and re-add the clean value.
// Skips STRIPE_WEBHOOK_SECRET (handled separately by user).
import fs from 'fs';
import { execSync, spawnSync } from 'child_process';

const list = JSON.parse(fs.readFileSync('.env.audit-list.json', 'utf8'));
const SKIP = new Set(['STRIPE_WEBHOOK_SECRET']); // user is replacing this with a real value

console.log(`Repairing ${list.length} env vars (${list.filter(c => !SKIP.has(c.k)).length} after skip)\n`);

for (const c of list) {
  if (SKIP.has(c.k)) {
    console.log(`SKIP   ${c.k}`);
    continue;
  }
  process.stdout.write(`FIX    ${c.k.padEnd(36)} `);
  // Remove
  const rm = spawnSync('npx', ['vercel', 'env', 'rm', c.k, 'production', '--yes'], {
    encoding: 'utf8',
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (rm.status !== 0 && !rm.stderr.includes('not found')) {
    console.log('rm FAILED:', rm.stderr.slice(0, 100));
    continue;
  }
  // Add via stdin (no trailing newline)
  const add = spawnSync('npx', ['vercel', 'env', 'add', c.k, 'production'], {
    encoding: 'utf8',
    shell: true,
    input: c.clean,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (add.status === 0 && /Added/.test(add.stdout + add.stderr)) {
    console.log('OK');
  } else {
    console.log('add FAILED:', (add.stdout + add.stderr).slice(0, 200));
  }
}

console.log('\nDONE');
