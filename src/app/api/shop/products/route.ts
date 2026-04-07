import { NextResponse } from "next/server";

export const PRODUCTS = [
  { id: "album-lux", name: "Luxury Printed Album", price: 150 },
  { id: "canvas-large", name: "Large Canvas Print", price: 85 },
  { id: "digital-gallery", name: "Full Digital Gallery", price: 49 },
  { id: "social-pack", name: "Social Media Package", price: 35 },
];

export async function GET() {
  return NextResponse.json(PRODUCTS);
}
