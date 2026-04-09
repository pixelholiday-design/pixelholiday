import HeroSection from "./_components/HeroSection";
import AudienceSection from "./_components/AudienceSection";
import FeaturesSection from "./_components/FeaturesSection";
import PhotographerTypesSection from "./_components/PhotographerTypesSection";
import VenueTypesSection from "./_components/VenueTypesSection";
import PricingSection from "./_components/PricingSection";
import TestimonialsSection from "./_components/TestimonialsSection";
import FinalCTASection from "./_components/FinalCTASection";

export const metadata = {
  title: "Fotiqo — The Complete Photography Platform",
  description:
    "Deliver stunning galleries. Sell prints worldwide. Book clients. Build your website. Manage your studio. All in one place. Free to start.",
};

export default function MarketingHome() {
  return (
    <>
      <HeroSection />
      <AudienceSection />
      <FeaturesSection />
      <PhotographerTypesSection />
      <VenueTypesSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTASection />
    </>
  );
}
