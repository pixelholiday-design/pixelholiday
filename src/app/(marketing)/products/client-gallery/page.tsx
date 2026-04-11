import { Camera } from "lucide-react";
import ProductPage from "../ProductPage";

export const metadata = {
  title: "Client Gallery — Fotiqo",
  description: "Beautiful photo galleries with watermark protection, client favorites, AI video reels, face recognition, and real-time streaming.",
};

export default function Page() {
  return (
    <ProductPage
      icon={<Camera className="h-4 w-4" />}
      badge="Client Gallery"
      headline="Beautiful galleries your clients will love"
      subheadline="6 themes, per-photo purchasing, Canva-style photo book designer, AI reel upsells, auto language detection, and PayPal + Stripe checkout."
      productId="gallery"
      color="from-brand-500 to-brand-400"
      ctaText="Try Client Gallery free"
      stats={[
        { value: "6", label: "Gallery themes" },
        { value: "10", label: "Languages auto-detected" },
        { value: "13", label: "Photo book layouts" },
        { value: "3", label: "Reel upsell tiers" },
      ]}
      detailedFeatures={[
        {
          title: "6 stunning gallery themes",
          description: "Choose the perfect look for each gallery. Classic, masonry, filmstrip, magazine, minimal, and dark themes transform the browsing experience. Each theme adapts beautifully across desktop, tablet, and mobile.",
          bullets: [
            "Classic — clean grid layout with elegant spacing",
            "Masonry — Pinterest-style flowing layout",
            "Filmstrip — horizontal scrolling cinema feel",
            "Magazine — editorial spread layout",
            "Minimal — maximum white space, photos speak",
            "Dark — moody background for dramatic shots",
          ],
        },
        {
          title: "Per-photo purchasing with bulk discounts",
          description: "Clients can buy individual photos (web-size €3, full-res €5), select multiples with progressive bulk discounts (10% off for 5+, 20% off for 10+), or unlock the entire gallery with a digital pass at 3 price tiers.",
          bullets: [
            "Single photo: web-size €3, full-res €5",
            "Wall art prints from €8, premium canvas from €25",
            "Multi-select with visual selection counter",
            "Bulk discounts: 5+ photos = 10% off, 10+ = 20% off",
            "Digital pass tiers scale with photo count",
            "PayPal + Stripe dual checkout options",
          ],
        },
        {
          title: "Canva-style photo book designer",
          description: "Clients design their own photo books right inside the gallery. Drag photos onto pages, resize and rotate freely, choose from 13 layouts and 11 clip-path shapes (heart, diamond, hexagon, star, arch). Auto-save and AI auto-fill.",
          bullets: [
            "13 pre-built page layouts",
            "11 clip-path shapes (heart, circle, diamond, star, hexagon, arch...)",
            "Drag, resize, and rotate photos on canvas",
            "10 background colors + 5 gradients + 8 Google Fonts",
            "AI auto-fill: one click populates entire book",
            "3 book types: softcover, hardcover, premium layflat",
          ],
        },
        {
          title: "AI cinematic reel upsell",
          description: "After gallery purchase, clients are offered a cinematic video reel created from their session photos. Three tiers with Stripe checkout — pure profit with zero production cost.",
          bullets: [
            "Short reel (15s) — €9",
            "Standard reel (30s) — €15 (most popular)",
            "Premium reel (60s) — €25 with transitions & effects",
            "Auto-presented after gallery payment",
            "Stripe checkout for instant purchase",
            "Your branding overlay on every reel",
          ],
        },
      ]}
      useCases={[
        { title: "Wedding photographers", description: "Deliver with the magazine theme. Clients favorite photos for album selection, design their own photo book, and add a cinematic reel. Auto-detected language for destination weddings." },
        { title: "Event photographers", description: "Face recognition lets guests find their own photos. Per-photo purchasing lets them buy just the shots they love. Bulk discounts encourage buying more." },
        { title: "Portrait & family", description: "Clean minimal theme. Clients buy individual photos or unlock all with a digital pass. Photo book designer for grandparents wanting a printed keepsake." },
        { title: "International clients", description: "Auto language detection from phone number or email. Gallery automatically displays in French, German, Spanish, Arabic, and 6 more languages." },
      ]}
      features={[
        { title: "6 gallery themes", description: "Classic, masonry, filmstrip, magazine, minimal, dark. Pick the perfect look for each gallery." },
        { title: "Per-photo purchasing", description: "Individual photo buying with web-size and full-res options. Prints and wall art available." },
        { title: "Multi-select + bulk discounts", description: "Select multiple photos with progressive discounts. 5+ = 10% off, 10+ = 20% off." },
        { title: "Digital pass tiers", description: "Unlock all photos at 3 price points. Tiers scale with gallery photo count." },
        { title: "Photo book designer", description: "Canva-style editor with 13 layouts, 11 shapes, drag/resize/rotate, AI auto-fill." },
        { title: "AI reel upsell", description: "3 pricing tiers (€9/€15/€25) with Stripe checkout. Auto-presented after purchase." },
        { title: "Auto language detection", description: "Detects language from phone number, email TLD, or browser. 10 languages + Arabic RTL." },
        { title: "Password protection", description: "Optional password gate with cookie-based 24h access. Download limits per gallery." },
        { title: "PayPal + Stripe checkout", description: "Dual payment options. Clients choose their preferred payment method." },
        { title: "Server-side watermarks", description: "Signed Cloudinary URLs. Cannot be removed or screenshotted." },
        { title: "Client favorites", description: "Heart photos, filter by favorites, export selection list for album design." },
        { title: "Magic link delivery", description: "No login required. Share via email, WhatsApp, or short link with OG tags." },
      ]}
      highlights={[
        "6 gallery themes",
        "Per-photo purchasing (€3-€5)",
        "Multi-select with bulk discounts",
        "Digital pass tiers",
        "Photo book designer (13 layouts, 11 shapes)",
        "AI reel upsell (€9/€15/€25)",
        "Auto language detection (10 languages)",
        "Password protection + download limits",
        "PayPal + Stripe dual checkout",
        "Server-side watermark protection",
        "Client favorites & proofing",
        "FOMO countdown timer",
        "Face recognition selfie search",
        "Real-time photo streaming",
        "Mobile-first responsive design",
        "In-gallery shop (prints, canvas, books)",
        "Short share links with OG tags",
        "Gallery analytics (views, downloads)",
      ]}
      comparisonNote="Pixieset charges $28-55/month for galleries with no per-photo purchasing, no photo book designer, no AI reel upsells, and no auto language detection. Fotiqo includes all of this free on the Starter plan."
    />
  );
}
