import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Camera, Menu, X, ChevronDown } from "lucide-react";
import MarketingNav from "./_components/MarketingNav";
import MarketingFooter from "./_components/MarketingFooter";

export const metadata: Metadata = {
  title: "Fotiqo  — The Complete Photography Platform",
  description:
    "Deliver stunning galleries. Sell prints worldwide. Book clients. Build your website. Manage your studio. All in one place.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
