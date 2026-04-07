import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), "logs", "b2b-deliveries.json");
function read(): any[] { try { return JSON.parse(fs.readFileSync(STORE, "utf8")); } catch { return []; } }

const PHOTO_VALUE_EUR = 50; // estimated value per delivered promo photo

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const all = read();
  const rows = month ? all.filter((d) => d.month === month) : all;

  const byLocation: Record<string, any> = {};
  let totalPhotos = 0;
  let totalDiscountValue = 0;
  let totalEstValue = 0;

  for (const d of rows) {
    const key = d.locationId;
    if (!byLocation[key]) byLocation[key] = { locationId: key, locationName: d.locationName, photos: 0, discountValue: 0, estValue: 0 };
    byLocation[key].photos += d.photoCount;
    const dv = (d.monthlyRent || 0) * ((d.rentDiscountPercent || 0) / 100);
    byLocation[key].discountValue += dv;
    byLocation[key].estValue += d.photoCount * PHOTO_VALUE_EUR;
    totalPhotos += d.photoCount;
    totalDiscountValue += dv;
    totalEstValue += d.photoCount * PHOTO_VALUE_EUR;
  }

  return NextResponse.json({
    month,
    summary: {
      totalPhotos,
      totalDiscountValue,
      totalEstPhotoValue: totalEstValue,
      roi: totalEstValue ? (totalDiscountValue / totalEstValue).toFixed(2) : "0",
      net: totalDiscountValue - totalEstValue,
    },
    byLocation: Object.values(byLocation),
  });
}
