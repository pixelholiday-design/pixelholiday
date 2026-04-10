import { Camera } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Client Gallery \ — Fotiqo", description: "Beautiful photo galleries with watermark protection, client favorites, and AI video reels." };
export default function Page() {
  return <ProductPage icon={<Camera className="h-4 w-4" />} badge="Client Gallery" headline="Beautiful galleries your clients will love" subheadline="Deliver photos with style. Watermarked previews, client favorites, FOMO timers, face recognition, and AI video reels \ — all included." productId="gallery" color="from-brand-500 to-brand-400" features={[
    { title: "Server-side watermarking", description: "Photos are watermarked at the CDN level using signed Cloudinary URLs. No CSS tricks \ — impossible to remove." },
    { title: "Client favorites", description: "Clients can heart their favorite photos. Use favorites for proofing workflows." },
    { title: "FOMO countdown timer", description: "Set an expiry date. Galleries show a countdown timer to create urgency and drive purchases." },
    { title: "AI video reels", description: "Automatically generate cinematic video reels from burst photos with music and transitions." },
    { title: "Face recognition", description: "Clients take a selfie and instantly find all photos of themselves across the gallery." },
    { title: "Real-time streaming", description: "Photos appear on the client's screen in real-time as you shoot \ — via Server-Sent Events." },
    { title: "10 languages", description: "Gallery UI automatically translates to French, German, Spanish, Italian, Arabic (RTL), Turkish, Russian, Dutch, Portuguese." },
    { title: "Magic link delivery", description: "No login required. Send a magic link via email or WhatsApp. Client taps and sees their photos." },
    { title: "Download control", description: "Full-res downloads for paid galleries, watermarked previews for unpaid. You control access." },
  ]} highlights={["Unlimited galleries", "Unlimited photos per gallery", "Watermark protection", "Client favorites & proofing", "FOMO countdown timer", "AI video reels", "Face recognition selfie search", "Real-time photo streaming", "10 language translations", "Magic link delivery (no login)", "Download in multiple sizes", "Mobile-first responsive design"]} ctaText="Try Client Gallery free" />;
}
