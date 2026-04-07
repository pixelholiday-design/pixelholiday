import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/shopProducts";

export async function GET() {
  return NextResponse.json(PRODUCTS);
}
