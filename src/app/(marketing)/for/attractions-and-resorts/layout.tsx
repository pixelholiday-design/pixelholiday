import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photography for Hotels, Water Parks & Attractions — Fotiqo",
  description:
    "Zero cost setup. Commission-only pricing. Kiosk POS, face recognition, staff management, multi-location. Apply now.",
  openGraph: {
    title: "Photography for Hotels, Water Parks & Attractions — Fotiqo",
    description:
      "Zero cost setup. Commission-only pricing. Kiosk POS, face recognition, staff management, multi-location. Apply now.",
    url: "https://fotiqo.com/for/attractions-and-resorts",
    type: "website",
  },
};

export default function AttractionsAndResortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
