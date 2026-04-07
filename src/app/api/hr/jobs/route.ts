import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "logs", "hr-jobs.json");
function read(): any[] { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; } }
function write(arr: any[]) { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(arr, null, 2)); }

export async function GET() { return NextResponse.json({ jobs: read() }); }

export async function POST(req: Request) {
  const body = await req.json();
  const arr = read();
  const job = {
    id: `job_${Date.now()}`,
    title: body.title,
    locationId: body.locationId || null,
    requirements: body.requirements || "",
    status: body.status || "OPEN",
    createdAt: new Date().toISOString(),
  };
  arr.push(job);
  write(arr);
  return NextResponse.json({ ok: true, job });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const arr = read();
  const idx = arr.findIndex((j) => j.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  arr[idx] = { ...arr[idx], ...body };
  write(arr);
  return NextResponse.json({ ok: true, job: arr[idx] });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const arr = read().filter((j) => j.id !== id);
  write(arr);
  return NextResponse.json({ ok: true });
}
