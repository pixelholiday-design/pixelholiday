import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Branding stored as JSON file keyed by orgId (mock store).
// In production this would be a Prisma model.
const STORE = path.join(process.cwd(), "logs", "branding-store.json");

function readStore(): Record<string, any> {
  try {
    if (!fs.existsSync(STORE)) return {};
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch { return {}; }
}
function writeStore(s: Record<string, any>) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(s, null, 2));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
  const s = readStore();
  return NextResponse.json(s[orgId] || { logoUrl: null, primaryColor: "#ea580c", secondaryColor: "#fde68a", subdomain: null });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, logoUrl, primaryColor, secondaryColor, subdomain } = body;
    if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });
    const s = readStore();
    s[orgId] = { logoUrl, primaryColor, secondaryColor, subdomain, updatedAt: new Date().toISOString() };
    writeStore(s);
    return NextResponse.json({ ok: true, branding: s[orgId] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
