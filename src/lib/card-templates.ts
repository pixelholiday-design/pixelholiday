export type CardTemplate = {
  id: string;
  name: string;
  type: "greeting" | "postcard" | "thank_you" | "holiday" | "birthday";
  borderColor: string;
  bgColor: string;
  textColor: string;
  fontStyle: "serif" | "sans" | "script";
  photoPosition: "center" | "left" | "top";
  decorations: string; // Tailwind classes for decorative elements
};

export const CARD_TYPES = [
  { key: "greeting" as const, label: "Greeting", icon: "💌", description: "A warm hello from paradise" },
  { key: "postcard" as const, label: "Postcard", icon: "🏖️", description: "Wish you were here" },
  { key: "thank_you" as const, label: "Thank You", icon: "🙏", description: "Express your gratitude" },
  { key: "holiday" as const, label: "Holiday", icon: "🌴", description: "Season's greetings from afar" },
  { key: "birthday" as const, label: "Birthday", icon: "🎂", description: "Celebrate in style" },
] as const;

export type CardType = (typeof CARD_TYPES)[number]["key"];

export const CARD_TEMPLATES: CardTemplate[] = [
  // ── Greeting ──
  {
    id: "greeting-classic",
    name: "Classic Elegance",
    type: "greeting",
    borderColor: "#1e3a5f",
    bgColor: "#faf7f2",
    textColor: "#1e3a5f",
    fontStyle: "serif",
    photoPosition: "center",
    decorations: "border-[3px] border-double",
  },
  {
    id: "greeting-modern",
    name: "Modern Minimal",
    type: "greeting",
    borderColor: "#e8ddd0",
    bgColor: "#ffffff",
    textColor: "#333333",
    fontStyle: "sans",
    photoPosition: "left",
    decorations: "border-l-4",
  },
  {
    id: "greeting-warm",
    name: "Warm Sunset",
    type: "greeting",
    borderColor: "#f97066",
    bgColor: "#fff5f3",
    textColor: "#7c2d12",
    fontStyle: "script",
    photoPosition: "top",
    decorations: "border-b-4 rounded-t-2xl",
  },

  // ── Postcard ──
  {
    id: "postcard-vintage",
    name: "Vintage Travel",
    type: "postcard",
    borderColor: "#b8860b",
    bgColor: "#fefbe8",
    textColor: "#713f12",
    fontStyle: "serif",
    photoPosition: "top",
    decorations: "border-2 rounded-lg",
  },
  {
    id: "postcard-coastal",
    name: "Coastal Breeze",
    type: "postcard",
    borderColor: "#0ea5e9",
    bgColor: "#f0f9ff",
    textColor: "#0c4a6e",
    fontStyle: "sans",
    photoPosition: "center",
    decorations: "border-b-4 border-t-4",
  },
  {
    id: "postcard-tropic",
    name: "Tropical Paradise",
    type: "postcard",
    borderColor: "#16a34a",
    bgColor: "#f0fdf4",
    textColor: "#14532d",
    fontStyle: "script",
    photoPosition: "left",
    decorations: "border-2 border-dashed rounded-xl",
  },

  // ── Thank You ──
  {
    id: "thankyou-graceful",
    name: "Graceful",
    type: "thank_you",
    borderColor: "#d4af37",
    bgColor: "#fffbeb",
    textColor: "#78350f",
    fontStyle: "script",
    photoPosition: "center",
    decorations: "border-[3px] border-double rounded-2xl",
  },
  {
    id: "thankyou-simple",
    name: "Simply Said",
    type: "thank_you",
    borderColor: "#a3a3a3",
    bgColor: "#fafafa",
    textColor: "#171717",
    fontStyle: "sans",
    photoPosition: "top",
    decorations: "border border-neutral-300 rounded-lg",
  },
  {
    id: "thankyou-bloom",
    name: "In Bloom",
    type: "thank_you",
    borderColor: "#ec4899",
    bgColor: "#fdf2f8",
    textColor: "#831843",
    fontStyle: "serif",
    photoPosition: "left",
    decorations: "border-l-4 rounded-r-2xl",
  },

  // ── Holiday ──
  {
    id: "holiday-festive",
    name: "Festive Joy",
    type: "holiday",
    borderColor: "#dc2626",
    bgColor: "#fef2f2",
    textColor: "#7f1d1d",
    fontStyle: "serif",
    photoPosition: "center",
    decorations: "border-4 rounded-2xl",
  },
  {
    id: "holiday-winter",
    name: "Winter Frost",
    type: "holiday",
    borderColor: "#7dd3fc",
    bgColor: "#f0f9ff",
    textColor: "#0c4a6e",
    fontStyle: "sans",
    photoPosition: "top",
    decorations: "border-2 border-dashed",
  },
  {
    id: "holiday-gold",
    name: "Golden Season",
    type: "holiday",
    borderColor: "#d4af37",
    bgColor: "#1e3a5f",
    textColor: "#fef3c7",
    fontStyle: "script",
    photoPosition: "left",
    decorations: "border-[3px] border-double rounded-xl",
  },

  // ── Birthday ──
  {
    id: "birthday-confetti",
    name: "Confetti Pop",
    type: "birthday",
    borderColor: "#f59e0b",
    bgColor: "#fffbeb",
    textColor: "#78350f",
    fontStyle: "sans",
    photoPosition: "center",
    decorations: "border-4 border-dashed rounded-2xl",
  },
  {
    id: "birthday-pastel",
    name: "Pastel Dream",
    type: "birthday",
    borderColor: "#c084fc",
    bgColor: "#faf5ff",
    textColor: "#581c87",
    fontStyle: "script",
    photoPosition: "top",
    decorations: "border-2 rounded-3xl",
  },
  {
    id: "birthday-bold",
    name: "Bold & Bright",
    type: "birthday",
    borderColor: "#f97066",
    bgColor: "#fff1f2",
    textColor: "#9f1239",
    fontStyle: "serif",
    photoPosition: "left",
    decorations: "border-l-8 rounded-r-xl",
  },
];

export function getTemplatesByType(type: CardType): CardTemplate[] {
  return CARD_TEMPLATES.filter((t) => t.type === type);
}

export function getTemplateById(id: string): CardTemplate | undefined {
  return CARD_TEMPLATES.find((t) => t.id === id);
}

export const CARD_PRICING = {
  10: 2500, // 10 cards = €25.00 (in cents)
  20: 4000, // 20 cards = €40.00 (in cents)
} as const;

export type CardQuantity = keyof typeof CARD_PRICING;
