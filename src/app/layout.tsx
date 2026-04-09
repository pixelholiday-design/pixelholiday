import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Pixelvo — Capture your escape",
  description: "Premium resort photography delivery & e-commerce.",
  manifest: "/manifest.json",
};

export const viewport = { themeColor: "#E8593C" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="antialiased bg-cream-100 text-navy-900 font-sans">
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
