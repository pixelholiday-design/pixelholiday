import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fotiqo — The complete photography platform",
  description: "Capture. Deliver. Sell. Grow. The all-in-one photography platform for resorts, studios, and freelancers.",
  manifest: "/manifest.json",
};

export const viewport = { themeColor: "#0EA5A5" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="antialiased bg-cream-100 text-navy-900 font-sans">
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
