import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import CookieConsent from "@/components/CookieConsent";
import SuggestionButton from "@/components/SuggestionButton";
import ChatWidget from "@/components/support/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
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
    <html lang="en" className={`${inter.variable} ${dmSans.variable} ${playfair.variable}`}>
      <head>
        <link rel="manifest" href="/manifest-saas.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fotiqo" />
      </head>
      <body className="antialiased bg-cream-100 text-navy-900 font-sans">
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw-saas.js').catch(()=>{});}` }} />
        <Providers>{children}</Providers>
        <CookieConsent />
        <SuggestionButton />
        <ChatWidget />
      </body>
    </html>
  );
}
