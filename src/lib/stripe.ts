import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_xxx", {
  apiVersion: "2024-06-20" as any,
});

export const PRICES = {
  SINGLE_PHOTO: 1500, // 15 EUR
  PARTIAL_GALLERY: 4900, // 49 EUR — 10 photos
  FULL_GALLERY: 9900, // 99 EUR
  PRINTED_ALBUM: 15000,
  VIDEO_CLIP: 3000,
  AUTO_REEL: 3000,
  MAGIC_SHOT: 2000,
  DIGITAL_PASS: 15000,
  SOCIAL_MEDIA_PACKAGE: 6900,
};
