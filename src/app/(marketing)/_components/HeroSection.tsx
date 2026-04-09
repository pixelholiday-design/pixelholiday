"use client";

import Image from "next/image";
import { CTAPrimary, CTAGhost } from "./CTAButton";
import { Star, ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-brand-700 to-navy-900 animate-hero-gradient" />

      {/* Bokeh light particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bokeh-particle bokeh-1" />
        <div className="bokeh-particle bokeh-2" />
        <div className="bokeh-particle bokeh-3" />
        <div className="bokeh-particle bokeh-4" />
        <div className="bokeh-particle bokeh-5" />
        <div className="bokeh-particle bokeh-6" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center pt-24 pb-16">
        <div className="mb-8 flex justify-center">
          <Image
            src="/fotiqo-icon.svg"
            alt="Fotiqo"
            width={80}
            height={80}
            className="w-20 h-20 drop-shadow-2xl brightness-0 invert"
          />
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 text-balance">
          The complete photography{" "}
          <span className="text-brand-300">platform</span>
        </h1>

        <p className="text-lg md:text-xl text-brand-100/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Deliver stunning galleries. Sell prints worldwide. Book clients. Build your website. Manage your studio. All in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <CTAPrimary>Get Started Free</CTAPrimary>
          <CTAGhost href="#how-it-works">See How It Works</CTAGhost>
        </div>

        {/* Social proof */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/70">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
            ))}
          </div>
          <span className="text-sm">Trusted by 500+ photographers across 12 countries</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/50" />
      </div>

      <style jsx>{`
        @keyframes hero-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-hero-gradient {
          background-size: 200% 200%;
          animation: hero-gradient-shift 12s ease infinite;
        }
        .bokeh-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: bokeh-float 8s ease-in-out infinite;
        }
        .bokeh-1 { width: 200px; height: 200px; background: radial-gradient(circle, rgba(41,171,226,0.15) 0%, transparent 70%); top: 15%; left: 10%; animation-delay: 0s; }
        .bokeh-2 { width: 150px; height: 150px; background: radial-gradient(circle, rgba(232,89,60,0.1) 0%, transparent 70%); top: 60%; right: 15%; animation-delay: 2s; }
        .bokeh-3 { width: 120px; height: 120px; background: radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%); bottom: 20%; left: 25%; animation-delay: 4s; }
        .bokeh-4 { width: 180px; height: 180px; background: radial-gradient(circle, rgba(41,171,226,0.1) 0%, transparent 70%); top: 30%; right: 30%; animation-delay: 1s; }
        .bokeh-5 { width: 100px; height: 100px; background: radial-gradient(circle, rgba(232,89,60,0.08) 0%, transparent 70%); top: 70%; left: 60%; animation-delay: 3s; }
        .bokeh-6 { width: 160px; height: 160px; background: radial-gradient(circle, rgba(212,168,83,0.1) 0%, transparent 70%); top: 10%; right: 10%; animation-delay: 5s; }
        @keyframes bokeh-float {
          0%, 100% { opacity: 0; transform: translateY(20px) scale(0.8); }
          30%, 70% { opacity: 1; }
          50% { opacity: 1; transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </section>
  );
}
