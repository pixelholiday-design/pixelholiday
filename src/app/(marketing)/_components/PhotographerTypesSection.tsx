"use client";

import {
  Heart, User, Users, Baby, Flower2, PartyPopper, Palmtree, Waves, Rabbit,
  Building, Camera, Utensils, ShoppingBag, Shirt, Trophy, GraduationCap,
  Sparkles, Mountain, Map, Briefcase, Headphones, Dog, Music, Plane, ArrowUpCircle,
} from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";

const TYPES = [
  { label: "Wedding", icon: Heart },
  { label: "Portrait", icon: User },
  { label: "Family", icon: Users },
  { label: "Newborn", icon: Baby },
  { label: "Maternity", icon: Flower2 },
  { label: "Event", icon: PartyPopper },
  { label: "Resort & Hotel", icon: Palmtree },
  { label: "Water Park", icon: Waves },
  { label: "Zoo & Attraction", icon: Rabbit },
  { label: "Real Estate", icon: Building },
  { label: "Food", icon: Utensils },
  { label: "Product", icon: ShoppingBag },
  { label: "Fashion", icon: Shirt },
  { label: "Sports", icon: Trophy },
  { label: "School", icon: GraduationCap },
  { label: "Boudoir", icon: Sparkles },
  { label: "Landscape", icon: Mountain },
  { label: "Travel", icon: Map },
  { label: "Corporate", icon: Briefcase },
  { label: "Headshot", icon: User },
  { label: "Pet", icon: Dog },
  { label: "Concert", icon: Music },
  { label: "Drone / Aerial", icon: ArrowUpCircle },
  { label: "Freelance", icon: Camera },
];

export default function PhotographerTypesSection() {
  return (
    <section className="py-24 bg-navy-900">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Built for every kind of photographer
          </h2>
          <p className="text-brand-200/70 text-lg max-w-2xl mx-auto">
            No matter your specialty, Fotiqo gives you the tools to deliver, sell, and grow.
          </p>
        </SectionFadeIn>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {TYPES.map((t, i) => (
            <SectionFadeIn key={t.label} delay={i * 30}>
              <div className="group flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-300 hover:bg-navy-700/60 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/10 cursor-default">
                <div className="w-12 h-12 rounded-xl bg-navy-700/60 flex items-center justify-center transition-colors group-hover:bg-brand-500/20">
                  <t.icon className="w-5 h-5 text-brand-300 transition-colors group-hover:text-brand-200" />
                </div>
                <span className="text-xs font-medium text-navy-300 text-center transition-colors group-hover:text-white">
                  {t.label}
                </span>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
