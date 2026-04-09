import { NextRequest, NextResponse } from "next/server";
import { checkBalance } from "@/lib/gift-cards";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  const info = await checkBalance(code.toUpperCase().trim());

  if (!info) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: info.code,
    balance: info.balance,
    currency: info.currency,
    expiresAt: info.expiresAt,
    isActive: info.isActive,
    type: info.type,
  });
}
