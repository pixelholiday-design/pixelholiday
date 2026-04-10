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
      subheadline="Deliver photos with style. Watermarked previews, client favorites, FOMO timers, face recognition, and AI video reels — all included."
      productId="gallery"
      color="from-brand-500 to-brand-400"
      ctaText="Try Client Gallery free"
      stats={[
        { value: "10", label: "Languages supported" },
        { value: "187", label: "Shop products" },
        { value: "< 3s", label: "Live streaming delay" },
        { value: "100%", label: "Server-side watermarks" },
      ]}
      detailedFeatures={[
        {
          title: "Server-side watermarks that can't be removed",
          description: "Unlike CSS overlays that anyone can inspect and remove, Fotiqo watermarks are applied at the CDN level using signed Cloudinary URLs. Every transformation is cryptographically signed — modifying the URL to remove the watermark returns a 401 error.",
          bullets: [
            "Watermark baked into the image at the server level",
            "Signed URLs prevent URL manipulation",
            "Strict Transformations block unauthorized access",
            "Watermark auto-scales to 50% of image width",
            "Custom watermark upload (your logo or text)",
          ],
        },
        {
          title: "AI video reels from your session photos",
          description: "Fotiqo automatically detects burst sequences in your uploads and stitches them into cinematic video reels with ken-burns transitions, music, and your branding overlay. Clients love sharing these on social media — and each reel is an upsell opportunity.",
          bullets: [
            "Auto-generated from burst photos (5+ in sequence)",
            "Ken-burns zoom + crossfade transitions",
            "Royalty-free music library",
            "Your brand name as video overlay",
            "Sells as add-on (EUR 15-30 per reel)",
          ],
        },
        {
          title: "Face recognition — clients find themselves instantly",
          description: "At events, resorts, and large sessions, clients take a selfie and the system instantly matches their face against all photos in the gallery. No scrolling through hundreds of images — they see only their photos within seconds.",
          bullets: [
            "Powered by Face++ AI (99.5% accuracy)",
            "Works with sunglasses, hats, and expressions",
            "GDPR compliant — selfie deleted after matching",
            "Perfect for events, resorts, and group sessions",
            "Reduces support requests ('which photos are mine?')",
          ],
        },
        {
          title: "Real-time streaming — photos appear as you shoot",
          description: "Enable 'Go Live' mode on your phone and every photo you take appears on your client's screen within 2-3 seconds. No refresh needed. Powered by Server-Sent Events, not heavy WebSocket connections.",
          bullets: [
            "Photos appear in real-time (2-3 second delay)",
            "Browser push notifications for new photos",
            "Sound alert (camera shutter click)",
            "Live indicator with viewer count",
            "Works on mobile and desktop",
          ],
        },
      ]}
      useCases={[
        { title: "Wedding photographers", description: "Deliver a stunning gallery with a sneak peek hook, countdown timer, and album/print upsells. Clients can favorite photos for their album selection." },
        { title: "Event photographers", description: "Face recognition lets guests find their own photos. Real-time streaming shows photos appearing during the event. QR code access — no login needed." },
        { title: "Portrait & family", description: "Clean, elegant galleries with download options. Clients pick favorites, you deliver the finals. Photo book and print ordering built into the gallery." },
        { title: "Resort & venue", description: "Watermarked previews drive kiosk sales. Sleeping money automation recovers abandoned galleries. Multi-language for international guests." },
      ]}
      features={[
        { title: "Server-side watermarking", description: "Photos are watermarked at the CDN level using signed Cloudinary URLs. Impossible to remove by inspecting the page." },
        { title: "Client favorites & proofing", description: "Clients heart their favorite photos. Export the selection list for final editing and album design." },
        { title: "FOMO countdown timer", description: "Set an expiry date. Galleries show a countdown timer that creates urgency and drives faster purchases." },
        { title: "AI video reels", description: "Automatically generate cinematic video reels from burst photos with music, transitions, and your branding." },
        { title: "Face recognition", description: "Clients take a selfie and instantly find all photos of themselves. Powered by Face++ AI." },
        { title: "Real-time streaming", description: "Photos appear on the client's screen in real-time as you shoot — via Server-Sent Events." },
        { title: "10 languages + RTL Arabic", description: "Gallery UI auto-translates to French, German, Spanish, Italian, Arabic, Turkish, Russian, Dutch, Portuguese." },
        { title: "Magic link delivery", description: "No login required. Send a magic link via email or WhatsApp. Client taps and sees their photos instantly." },
        { title: "Download control", description: "Full-res downloads for paid galleries, watermarked previews for unpaid. You control what clients can access." },
      ]}
      highlights={[
        "Unlimited galleries",
        "Unlimited photos per gallery",
        "Watermark protection (server-side)",
        "Client favorites & proofing",
        "FOMO countdown timer",
        "AI video reels with music",
        "Face recognition selfie search",
        "Real-time photo streaming",
        "10 language translations",
        "Magic link delivery (no login)",
        "Download in multiple sizes",
        "Mobile-first responsive design",
        "In-gallery shop (prints, canvas, books)",
        "Gallery analytics (views, downloads)",
        "Password protection option",
        "Custom cover photo",
      ]}
      comparisonNote="Pixieset charges $28-55/month for galleries. Fotiqo galleries are free on the Starter plan — with features Pixieset doesn't offer at any price: face recognition, AI video reels, real-time streaming, and 10-language support."
    />
  );
}
