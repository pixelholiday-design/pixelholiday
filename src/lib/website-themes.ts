export type WebsiteTheme = "minimal" | "bold" | "classic" | "modern" | "dark" | "light";

export type SectionType = "hero" | "portfolio" | "about" | "services" | "testimonials" | "contact" | "blog";

export interface SectionConfig {
  type: SectionType;
  order: number;
  visible: boolean;
}

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { type: "hero", order: 0, visible: true },
  { type: "portfolio", order: 1, visible: true },
  { type: "about", order: 2, visible: true },
  { type: "services", order: 3, visible: true },
  { type: "testimonials", order: 4, visible: true },
  { type: "contact", order: 5, visible: true },
  { type: "blog", order: 6, visible: false },
];

export const THEMES: Record<WebsiteTheme, { name: string; description: string; preview: string }> = {
  minimal: { name: "Minimal", description: "Clean lines, lots of whitespace, elegant simplicity", preview: "bg-white text-gray-900" },
  bold: { name: "Bold", description: "High contrast, large typography, dramatic layouts", preview: "bg-black text-white" },
  classic: { name: "Classic", description: "Timeless serif fonts, warm tones, traditional elegance", preview: "bg-amber-50 text-amber-900" },
  modern: { name: "Modern", description: "Geometric shapes, vibrant accents, contemporary feel", preview: "bg-slate-50 text-slate-900" },
  dark: { name: "Dark", description: "Dark backgrounds, moody aesthetics, cinematic feel", preview: "bg-zinc-900 text-zinc-100" },
  light: { name: "Light", description: "Airy pastels, soft shadows, dreamy atmosphere", preview: "bg-rose-50 text-rose-900" },
};

export const FONT_CHOICES: Record<string, { name: string; className: string }> = {
  inter: { name: "Inter", className: "font-sans" },
  playfair: { name: "Playfair Display", className: "font-display" },
  montserrat: { name: "Montserrat", className: "font-sans" },
  lora: { name: "Lora", className: "font-display" },
  raleway: { name: "Raleway", className: "font-sans" },
};

export const SPECIALTIES = [
  "wedding", "portrait", "landscape", "event", "resort",
  "commercial", "fashion", "food", "architecture", "newborn",
  "family", "sports", "travel", "product", "real-estate",
];

export const EXPERIENCE_OPTIONS = ["1-3 years", "3-5 years", "5-10 years", "10+ years"];
