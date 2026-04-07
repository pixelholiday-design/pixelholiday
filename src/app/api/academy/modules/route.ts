import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Mock store — production would use Prisma AcademyModule
const STORE = path.join(process.cwd(), "logs", "academy-modules.json");

function read(): any[] {
  try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; }
}
function write(arr: any[]) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(arr, null, 2));
}

export async function GET() {
  return NextResponse.json({ modules: read() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const arr = read();
  const mod = {
    id: `mod_${Date.now()}`,
    title: body.title,
    description: body.description || "",
    content: body.content || "",
    type: body.type || "ONBOARDING",
    isRequired: !!body.isRequired,
    requiredForRoles: body.requiredForRoles || [],
    quiz: body.quiz || "",
    sortOrder: arr.length,
    createdAt: new Date().toISOString(),
  };
  arr.push(mod);
  write(arr);
  return NextResponse.json({ ok: true, module: mod });
}
