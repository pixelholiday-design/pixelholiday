import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "logs", "academy-progress.json");

function read(): any[] { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; } }
function write(arr: any[]) { fs.mkdirSync(path.dirname(STORE), { recursive: true }); fs.writeFileSync(STORE, JSON.stringify(arr, null, 2)); }

export async function GET() {
  const entries = read();
  // Compute aggregate
  const byUser: Record<string, any> = {};
  for (const e of entries) {
    if (!byUser[e.userId]) byUser[e.userId] = { userId: e.userId, completed: 0, totalScore: 0, modules: [] };
    if (e.completed) byUser[e.userId].completed++;
    byUser[e.userId].totalScore += e.score || 0;
    byUser[e.userId].modules.push(e);
  }
  return NextResponse.json({ entries, byUser });
}

export async function POST(req: Request) {
  const body = await req.json();
  const arr = read();
  const entry = {
    id: `prog_${Date.now()}`,
    userId: body.userId,
    moduleId: body.moduleId,
    completed: !!body.completed,
    completedAt: body.completed ? new Date().toISOString() : null,
    score: body.score || null,
  };
  arr.push(entry);
  write(arr);
  return NextResponse.json({ ok: true, entry });
}
