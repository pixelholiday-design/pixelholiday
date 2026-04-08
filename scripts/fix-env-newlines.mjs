// Find and clean Vercel env vars that have a literal "\n" (backslash + n) at the end
import fs from 'fs';

const text = fs.readFileSync(process.argv[2] || '.env.audit', 'utf8');
const lines = text.split('\n');
const corrupted = [];

for (const l of lines) {
  if (!l.trim() || l.startsWith('#')) continue;
  const eq = l.indexOf('=');
  if (eq < 0) continue;
  const k = l.slice(0, eq);
  let v = l.slice(eq + 1);
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);

  // Skip Vercel-managed
  if (k.startsWith('VERCEL_') || k.startsWith('TURBO_') || k === 'VERCEL' || k === 'NX_DAEMON') continue;

  // Detect literal backslash + n at end (the exact 2 chars: \ and n)
  if (v.endsWith('\\n')) {
    const clean = v.slice(0, -2);
    corrupted.push({ k, len: v.length, cleanLen: clean.length, clean });
  }
}

console.log('CORRUPTED env vars (literal trailing \\n):');
for (const c of corrupted) {
  console.log('  ' + c.k.padEnd(36) + ' len=' + c.len + ' → cleanLen=' + c.cleanLen + '  preview=' + JSON.stringify(c.clean.slice(0, 8) + '...' + c.clean.slice(-4)));
}
console.log('\nTOTAL: ' + corrupted.length);
fs.writeFileSync('.env.audit-list.json', JSON.stringify(corrupted, null, 2));
