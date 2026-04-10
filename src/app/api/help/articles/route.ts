import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SEED_ARTICLES = [
  { title: "Welcome to Fotiqo — quick start guide", slug: "quick-start-guide", category: "GETTING_STARTED", summary: "Get up and running with Fotiqo in 5 minutes. Create your first gallery, set up your website, and start accepting bookings.", tags: ["start", "setup", "beginner", "onboarding"] },
  { title: "Creating your first client gallery", slug: "creating-first-gallery", category: "GETTING_STARTED", summary: "Learn how to create a gallery, upload photos, set watermarks, and share the magic link with your client.", tags: ["gallery", "create", "upload", "first"] },
  { title: "Setting up your portfolio website", slug: "setting-up-website", category: "GETTING_STARTED", summary: "Choose a theme, add your portfolio images, write your about page, and publish your photographer website.", tags: ["website", "portfolio", "theme", "setup"] },
  { title: "Adding booking packages", slug: "creating-booking-packages", category: "GETTING_STARTED", summary: "Create packages for your photography services, set pricing, add extras, and let clients book directly.", tags: ["booking", "packages", "pricing", "setup"] },
  { title: "Connecting your Stripe account", slug: "connecting-stripe", category: "GETTING_STARTED", summary: "Set up Stripe to accept credit card payments from your clients for galleries, bookings, and print orders.", tags: ["stripe", "payment", "setup", "credit card"] },
  { title: "How to upload photos to a gallery", slug: "uploading-photos", category: "GALLERIES", summary: "Upload photos via drag-and-drop, mobile camera, or the Lightroom API. Support for JPG, RAW, and HEIC.", tags: ["upload", "photos", "gallery", "drag"] },
  { title: "Sharing galleries with clients", slug: "sharing-galleries", category: "GALLERIES", summary: "Send gallery links via email, WhatsApp, or magic link. Clients view photos without needing an account.", tags: ["share", "gallery", "link", "magic link", "whatsapp"] },
  { title: "Gallery password protection", slug: "gallery-password", category: "GALLERIES", summary: "Add a password to your gallery for extra privacy. Share the password separately from the gallery link.", tags: ["password", "protection", "privacy", "gallery"] },
  { title: "Setting gallery expiry dates", slug: "gallery-expiry", category: "GALLERIES", summary: "Set how long galleries are available. Use FOMO timers to encourage timely purchases.", tags: ["expiry", "timer", "fomo", "deadline"] },
  { title: "Photo proofing — let clients pick favorites", slug: "photo-proofing", category: "GALLERIES", summary: "Clients can favorite photos they love. Export their selections for final editing and delivery.", tags: ["proofing", "favorites", "selection", "client"] },
  { title: "Watermark settings and protection", slug: "watermark-settings", category: "GALLERIES", summary: "Server-side watermarking protects your photos. Signed URLs prevent URL manipulation.", tags: ["watermark", "protection", "signed", "security"] },
  { title: "Download permissions explained", slug: "download-photos", category: "GALLERIES", summary: "Control what clients can download: original quality, web-size, or no download until purchase.", tags: ["download", "permissions", "quality", "purchase"] },
  { title: "Choosing and customizing a theme", slug: "choosing-theme", category: "WEBSITE", summary: "Pick from 6 professionally designed themes. Customize colors, fonts, and layout to match your brand.", tags: ["theme", "customize", "design", "brand"] },
  { title: "Adding pages to your website", slug: "adding-pages", category: "WEBSITE", summary: "Add About, Portfolio, Pricing, Blog, and Contact pages. Reorder pages in your navigation.", tags: ["pages", "navigation", "website", "about"] },
  { title: "Connecting a custom domain", slug: "connect-custom-domain", category: "WEBSITE", summary: "Point your domain (e.g., photos.yourname.com) to your Fotiqo website. Step-by-step DNS instructions.", tags: ["domain", "custom", "dns", "cname"] },
  { title: "SEO settings for your portfolio", slug: "seo-settings", category: "WEBSITE", summary: "Optimize your website for search engines. Set titles, descriptions, and Open Graph images for every page.", tags: ["seo", "google", "search", "meta", "og"] },
  { title: "Adding a blog to your site", slug: "adding-blog", category: "WEBSITE", summary: "Publish blog posts to improve SEO and showcase your work. AI can help generate blog content.", tags: ["blog", "content", "seo", "writing"] },
  { title: "Custom fonts on your website", slug: "custom-fonts", category: "WEBSITE", summary: "Upload .woff2, .ttf, or .otf fonts to use on your portfolio website headings and body text.", tags: ["fonts", "custom", "typography", "upload"] },
  { title: "Setting up your online store", slug: "setting-up-store", category: "STORE", summary: "Enable your store, set product prices and markups, and start selling prints, canvas, and albums.", tags: ["store", "setup", "products", "prints"] },
  { title: "Product pricing and markups", slug: "product-pricing", category: "STORE", summary: "Set your prices for each product. See your cost, markup, and profit per item.", tags: ["pricing", "markup", "profit", "products"] },
  { title: "Print fulfillment with Prodigi and Printful", slug: "ordering-prints", category: "STORE", summary: "Orders are automatically sent to Prodigi or Printful for printing and shipping directly to your client.", tags: ["print", "fulfillment", "prodigi", "printful", "shipping"] },
  { title: "Gift cards and store credits", slug: "gift-cards", category: "STORE", summary: "Sell gift cards that clients can redeem in your store. Track balances and redemptions.", tags: ["gift card", "credit", "store", "balance"] },
  { title: "Coupons and discounts", slug: "coupons-discounts", category: "STORE", summary: "Create percentage or fixed-amount coupons. Set limits, expiry dates, and minimum order amounts.", tags: ["coupon", "discount", "promo", "code"] },
  { title: "Creating booking packages", slug: "booking-packages", category: "BOOKING", summary: "Set up packages with duration, deliverables, and pricing. Add extras like albums or extra hours.", tags: ["booking", "packages", "create", "services"] },
  { title: "Setting your availability", slug: "setting-availability", category: "BOOKING", summary: "Set your working hours, block off dates, and manage your calendar from the dashboard.", tags: ["availability", "calendar", "schedule", "hours"] },
  { title: "Accepting deposits and payments", slug: "deposits-payments", category: "BOOKING", summary: "Collect deposits at booking time and balance before the session via Stripe.", tags: ["deposit", "payment", "stripe", "balance"] },
  { title: "Managing bookings and cancellations", slug: "managing-bookings", category: "BOOKING", summary: "View, reschedule, and cancel bookings. Set your cancellation policy.", tags: ["booking", "cancel", "reschedule", "manage"] },
  { title: "Fotiqo pricing — commission model explained", slug: "pricing-explained", category: "BILLING", summary: "Fotiqo is free to use. We take a small commission only when you make a sale. No monthly fees.", tags: ["pricing", "commission", "free", "fees", "cost"] },
  { title: "Understanding your payouts", slug: "understanding-payouts", category: "BILLING", summary: "See your earnings, pending payouts, and payout history. Funds are transferred via Stripe.", tags: ["payout", "earnings", "stripe", "transfer"] },
  { title: "Refund policy", slug: "refund-policy", category: "BILLING", summary: "How refunds work for digital galleries, print orders, and booking cancellations.", tags: ["refund", "return", "cancel", "money back"] },
];

/** GET /api/help/articles — List + search articles. Auto-seeds if empty. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  // Auto-seed if no articles
  const count = await prisma.helpArticle.count();
  if (count === 0) {
    for (let i = 0; i < SEED_ARTICLES.length; i++) {
      const a = SEED_ARTICLES[i];
      await prisma.helpArticle.create({
        data: { ...a, content: `# ${a.title}\n\n${a.summary}\n\n*Full article content coming soon.*`, sortOrder: i },
      });
    }
  }

  const where: any = { isPublished: true };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.helpArticle.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, slug: true, summary: true, category: true, tags: true, viewCount: true },
  });

  const categories = await prisma.helpArticle.groupBy({ by: ["category"], _count: true, where: { isPublished: true } });

  return NextResponse.json({ articles, categories });
}
