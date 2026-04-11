import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Fotiqo | Free Plan, Pro €19/mo, Studio €30/mo",
  description:
    "Start free. Save 60% vs Pixieset. Unlimited galleries, contracts, CRM, AI tools, marketplace. Compare plans and choose yours.",
  openGraph: {
    title: "Pricing — Fotiqo | Free Plan, Pro €19/mo, Studio €30/mo",
    description:
      "Start free. Save 60% vs Pixieset. Unlimited galleries, contracts, CRM, AI tools, marketplace.",
    url: "https://fotiqo.com/pricing",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
