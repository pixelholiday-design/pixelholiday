import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "logs", "b2b-deliveries.json");
function read(): any[] { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; } }
function write(arr: any[]) { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(arr, null, 2)); }

export async function GET() { return NextResponse.json({ deliveries: read() }); }

export async function POST(req: Request) {
  const body = await req.json();
  const arr = read();
  const d = {
    id: `b2b_${Date.now()}`,
    locationId: body.locationId,
    locationName: body.locationName || "",
    month: body.month, // "2026-04"
    photoCount: Number(body.photoCount) || 0,
    photoIds: body.photoIds || [],
    rentDiscountPercent: Number(body.rentDiscountPercent) || 0,
    monthlyRent: Number(body.monthlyRent) || 0,
    notes: body.notes || "",
    deliveredAt: body.delivered ? new Date().toISOString() : null,
  };
  arr.push(d);
  write(arr);
  return NextResponse.json({ ok: true, delivery: d });
}
