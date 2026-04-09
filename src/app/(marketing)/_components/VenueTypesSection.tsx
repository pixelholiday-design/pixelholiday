import {
  Building, Umbrella, Waves, Tent, Rabbit, Fish, Landmark,
  Mountain, Ship, Heart, Users, Trophy, Music, Sparkles, Camera,
  ShoppingBag, Utensils, GraduationCap, School, Ticket,
} from "lucide-react";
import SectionFadeIn from "./SectionFadeIn";

const ROWS = [
  {
    label: "Resorts",
    items: [
      { icon: Building, name: "Hotels", desc: "Lobby, pool, beach" },
      { icon: Umbrella, name: "Beach Resorts", desc: "Sunset sessions" },
      { icon: Waves, name: "Water Parks", desc: "Splash photography" },
      { icon: Ticket, name: "Theme Parks", desc: "Rides & characters" },
      { icon: Tent, name: "Safari Lodges", desc: "Game drives" },
    ],
  },
  {
    label: "Attractions",
    items: [
      { icon: Rabbit, name: "Zoos", desc: "Animal encounters" },
      { icon: Fish, name: "Aquariums", desc: "Tunnel walk-throughs" },
      { icon: Landmark, name: "Museums", desc: "Exhibit stations" },
      { icon: Mountain, name: "Ski Resorts", desc: "Action slopes" },
      { icon: Ship, name: "Cruise Ships", desc: "Port excursions" },
    ],
  },
  {
    label: "Events",
    items: [
      { icon: Heart, name: "Wedding Venues", desc: "Full-day coverage" },
      { icon: Users, name: "Conference Centers", desc: "Corporate events" },
      { icon: Trophy, name: "Sports Stadiums", desc: "Action photography" },
      { icon: Music, name: "Nightclubs", desc: "Event nights" },
      { icon: Sparkles, name: "Festivals", desc: "Multi-day festivals" },
    ],
  },
  {
    label: "Business",
    items: [
      { icon: Camera, name: "Studios", desc: "In-studio sessions" },
      { icon: ShoppingBag, name: "Malls", desc: "Pop-up photo stations" },
      { icon: Utensils, name: "Restaurants", desc: "Food photography" },
      { icon: School, name: "Schools", desc: "Class & team photos" },
      { icon: GraduationCap, name: "Universities", desc: "Graduation photos" },
    ],
  },
];

export default function VenueTypesSection() {
  return (
    <section className="py-24 bg-cream-100">
      <div className="mx-auto max-w-7xl px-6">
        <SectionFadeIn className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Powering photography at every destination
          </h2>
          <p className="text-lg text-navy-500 max-w-2xl mx-auto">
            From five-star resorts to local studios &mdash; our platform adapts to your venue and workflow.
          </p>
        </SectionFadeIn>

        <div className="space-y-10">
          {ROWS.map((row, ri) => (
            <SectionFadeIn key={row.label} delay={ri * 100}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-navy-400 mb-4">{row.label}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {row.items.map((v) => (
                    <div
                      key={v.name}
                      className="card p-5 text-center hover:shadow-soft transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110">
                        <v.icon className="w-5 h-5 text-brand-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-navy-900 mb-1">{v.name}</h4>
                      <p className="text-xs text-navy-400">{v.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SectionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
