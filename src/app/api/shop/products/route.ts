import { NextResponse } from "next/server";
import { loadShopProducts } from "@/lib/shopProducts";

export const dynamic = "force-dynamic";

export async function GET() {
  const { all, byCategory } = await loadShopProducts();
  return NextResponse.json({ products: all, byCategory });
}
