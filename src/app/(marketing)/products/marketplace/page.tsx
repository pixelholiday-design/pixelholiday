import { Search } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Photographer Marketplace \ — Fotiqo", description: "Get discovered by clients searching for photographers. Instant booking, verified reviews." };
export default function Page() {
  return <ProductPage icon={<Search className="h-4 w-4" />} badge="Marketplace" headline="Get discovered by clients who need you" subheadline="Your profile on Fotiqo Marketplace. Clients search by location and specialty, view your portfolio and reviews, and book instantly." productId="marketplace" color="from-green-500 to-green-400" features={[
    { title: "Professional profile", description: "Showcase your best work, services, pricing, and reviews on a beautiful profile page." },
    { title: "Search & discovery", description: "Clients search by city, specialty, budget, and rating. Appear in results when they need you." },
    { title: "Instant booking", description: "Clients pick a package, choose a date, and pay \ — no back-and-forth emails." },
    { title: "Guest booking", description: "Clients don't need an account. They book with just name, email, and phone." },
    { title: "Verified reviews", description: "Build your reputation with verified client reviews after every session." },
    { title: "Low commission", description: "Pay 10% only on marketplace bookings. Your own clients via direct link: just 3%." },
  ]} highlights={["Professional profile with portfolio", "Search by location, specialty, budget", "Instant booking with Stripe", "Guest booking (no account needed)", "Verified client reviews", "3-10% commission (only when you earn)", "Portfolio gallery showcase", "Services and pricing display", "Availability calendar integration", "Email notifications for inquiries"]} ctaText="Create your profile free" />;
}
