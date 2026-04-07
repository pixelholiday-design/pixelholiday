import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "logs", "hr-applications.json");
const STATUSES = ["RECEIVED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "REJECTED"];

function read(): any[] { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; } }
function write(arr: any[]) { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(arr, null, 2)); }

export async function GET() { return NextResponse.json({ applications: read(), statuses: STATUSES }); }

export async function POST(req: Request) {
  const body = await req.json();
  const arr = read();
  const app = {
    id: `app_${Date.now()}`,
    jobId: body.jobId,
    applicantName: body.applicantName,
    applicantEmail: body.applicantEmail,
    cvUrl: body.cvUrl || null,
    status: "RECEIVED",
    createdAt: new Date().toISOString(),
  };
  arr.push(app);
  write(arr);
  return NextResponse.json({ ok: true, application: app });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const arr = read();
  const idx = arr.findIndex((a) => a.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  arr[idx].status = body.status;
  write(arr);
  return NextResponse.json({ ok: true, application: arr[idx] });
}
