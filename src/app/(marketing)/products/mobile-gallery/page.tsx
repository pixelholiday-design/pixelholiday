import { Smartphone } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Mobile Gallery App \ — Fotiqo", description: "Your brand in your client's pocket. PWA gallery app with offline viewing and push notifications." };
export default function Page() {
  return <ProductPage icon={<Smartphone className="h-4 w-4" />} badge="Mobile Gallery" headline="Your brand, in your client&apos;s pocket" subheadline="Clients add your gallery to their home screen as a branded app. Offline viewing, push notifications, and instant access \ — no app store required." productId="mobile" color="from-blue-500 to-blue-400" features={[
    { title: "Progressive Web App", description: "Galleries are installable as a PWA. Clients tap 'Add to Home Screen' and get a native-app experience." },
    { title: "Your branding", description: "The app icon, name, and theme color match your photography brand \ — not Fotiqo's." },
    { title: "Offline viewing", description: "Photos are cached after first load. Clients can browse their gallery without internet." },
    { title: "Push notifications", description: "Notify clients when new photos are added to their gallery." },
    { title: "Full-screen experience", description: "Opens without browser chrome. Looks and feels like a native app." },
    { title: "No app store needed", description: "No approval process, no downloads from app stores. Instant installation from the gallery link." },
  ]} highlights={["Installable PWA (Add to Home Screen)", "Photographer branding (not Fotiqo)", "Offline photo viewing", "Push notifications for new photos", "Full-screen native-like experience", "No app store submission needed", "Works on iOS and Android", "Dynamic manifest per gallery", "Instant access from home screen", "Lightweight (no app download)"]} ctaText="Try it free" />;
}
