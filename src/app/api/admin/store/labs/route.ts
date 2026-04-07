import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole, handleGuardError } from "@/lib/guards";
import { PrintLabType } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1),
  type: z.enum(["LOCAL", "PRODIGI", "PRINTFUL", "GOOTEN", "CUSTOM_API"]),
  apiBaseUrl: z.string().url().optional().or(z.literal("")),
  apiKey: z.string().optional(),
  markupPercent: z.coerce.number().min(0).max(500).default(50),
});

export async function POST(req: Request) {
  try {
    await requireRole(["CEO", "OPERATIONS_MANAGER"]);
    const ct = req.headers.get("content-type") || "";
    let body: any = {};
    if (ct.includes("application/json")) {
      body = await req.json().catch(() => ({}));
    } else {
      const fd = await req.formData().catch(() => null);
      if (fd) fd.forEach((v, k) => { body[k] = String(v); });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    const lab = await prisma.printLabConfig.create({
      data: {
        name: parsed.data.name,
        type: parsed.data.type as PrintLabType,
        apiBaseUrl: parsed.data.apiBaseUrl || null,
        apiKey: parsed.data.apiKey,
        markupPercent: parsed.data.markupPercent,
      },
    });
    return NextResponse.redirect(new URL("/admin/store/labs", req.url), 303);
    // For non-form callers: return NextResponse.json({ ok: true, lab });
  } catch (e) {
    const g = handleGuardError(e); if (g) return g;
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
