import type { LayoutPreset } from "./types";

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    name: "full-bleed",
    label: "Full Bleed",
    elements: [
      { type: "photo", x: 0, y: 0, width: 100, height: 100, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "centered",
    label: "Centered",
    elements: [
      { type: "photo", x: 10, y: 10, width: 80, height: 80, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "two-col",
    label: "Two Columns",
    elements: [
      { type: "photo", x: 2, y: 5, width: 46, height: 90, rotation: 0, content: "", style: {} },
      { type: "photo", x: 52, y: 5, width: 46, height: 90, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "two-row",
    label: "Two Rows",
    elements: [
      { type: "photo", x: 5, y: 2, width: 90, height: 46, rotation: 0, content: "", style: {} },
      { type: "photo", x: 5, y: 52, width: 90, height: 46, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "three-up",
    label: "Three Up",
    elements: [
      { type: "photo", x: 2, y: 10, width: 30, height: 80, rotation: 0, content: "", style: {} },
      { type: "photo", x: 35, y: 10, width: 30, height: 80, rotation: 0, content: "", style: {} },
      { type: "photo", x: 68, y: 10, width: 30, height: 80, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "hero-left",
    label: "Hero Left",
    elements: [
      { type: "photo", x: 2, y: 5, width: 60, height: 90, rotation: 0, content: "", style: {} },
      { type: "photo", x: 65, y: 5, width: 33, height: 90, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "hero-right",
    label: "Hero Right",
    elements: [
      { type: "photo", x: 2, y: 5, width: 33, height: 90, rotation: 0, content: "", style: {} },
      { type: "photo", x: 38, y: 5, width: 60, height: 90, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "grid-4",
    label: "Grid 2x2",
    elements: [
      { type: "photo", x: 2, y: 2, width: 47, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 51, y: 2, width: 47, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 2, y: 51, width: 47, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 51, y: 51, width: 47, height: 47, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "hero-strip",
    label: "Hero + Strip",
    elements: [
      { type: "photo", x: 2, y: 2, width: 96, height: 60, rotation: 0, content: "", style: {} },
      { type: "photo", x: 2, y: 65, width: 30, height: 33, rotation: 0, content: "", style: {} },
      { type: "photo", x: 35, y: 65, width: 30, height: 33, rotation: 0, content: "", style: {} },
      { type: "photo", x: 68, y: 65, width: 30, height: 33, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "collage-5",
    label: "Collage 5",
    elements: [
      { type: "photo", x: 2, y: 2, width: 58, height: 55, rotation: 0, content: "", style: {} },
      { type: "photo", x: 62, y: 2, width: 36, height: 30, rotation: 0, content: "", style: {} },
      { type: "photo", x: 62, y: 34, width: 36, height: 23, rotation: 0, content: "", style: {} },
      { type: "photo", x: 2, y: 59, width: 40, height: 39, rotation: 0, content: "", style: {} },
      { type: "photo", x: 44, y: 59, width: 54, height: 39, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "grid-6",
    label: "Grid 3x2",
    elements: [
      { type: "photo", x: 2, y: 2, width: 31, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 35, y: 2, width: 31, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 68, y: 2, width: 30, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 2, y: 51, width: 31, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 35, y: 51, width: 31, height: 47, rotation: 0, content: "", style: {} },
      { type: "photo", x: 68, y: 51, width: 30, height: 47, rotation: 0, content: "", style: {} },
    ],
  },
  {
    name: "text-page",
    label: "Text Only",
    elements: [
      { type: "text", x: 10, y: 30, width: 80, height: 40, rotation: 0, content: "", style: { fontFamily: "Playfair Display", fontSize: 32, color: "#0C2E3D", bold: false, italic: false, align: "center" } },
    ],
  },
  {
    name: "title-page",
    label: "Title Page",
    elements: [
      { type: "text", x: 10, y: 8, width: 80, height: 20, rotation: 0, content: "", style: { fontFamily: "Playfair Display", fontSize: 48, color: "#0C2E3D", bold: true, italic: false, align: "center" } },
      { type: "photo", x: 15, y: 32, width: 70, height: 60, rotation: 0, content: "", style: {} },
    ],
  },
];

export const SHAPE_CLIPS: Record<string, string> = {
  rectangle: "",
  square: "",
  circle: "circle(50%)",
  oval: "ellipse(50% 40% at 50% 50%)",
  "rounded-rect": "rounded",
  heart: "path('M50,30 A20,20,0,0,1,90,30 A20,20,0,0,1,50,80 A20,20,0,0,1,10,30 A20,20,0,0,1,50,30')",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  arch: "ellipse(50% 60% at 50% 40%)",
  hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  polaroid: "polaroid",
};

export const BG_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#FFF8F0" },
  { name: "Blush", value: "#FDE8E8" },
  { name: "Sage", value: "#D1E7DD" },
  { name: "Dusty Blue", value: "#CFE2F3" },
  { name: "Navy", value: "#0C2E3D" },
  { name: "Black", value: "#000000" },
  { name: "Coral", value: "#FF7F7F" },
  { name: "Lavender", value: "#E6E0F8" },
  { name: "Mint", value: "#D5F5E3" },
];

export const BG_GRADIENTS = [
  "linear-gradient(135deg, #FFF8F0, #FDE8E8)",
  "linear-gradient(135deg, #CFE2F3, #D1E7DD)",
  "linear-gradient(135deg, #E6E0F8, #CFE2F3)",
  "linear-gradient(135deg, #0C2E3D, #0EA5A5)",
  "linear-gradient(135deg, #FDE8E8, #E6E0F8)",
];

export const FONTS = [
  "Playfair Display",
  "DM Sans",
  "Georgia",
  "Lora",
  "Dancing Script",
  "Montserrat",
  "Cormorant Garamond",
  "Raleway",
];

export const TEXT_PRESETS = [
  { label: "Heading", fontSize: 48, fontFamily: "Playfair Display", bold: true },
  { label: "Subheading", fontSize: 28, fontFamily: "DM Sans", bold: false },
  { label: "Body", fontSize: 16, fontFamily: "DM Sans", bold: false },
  { label: "Caption", fontSize: 12, fontFamily: "DM Sans", bold: false },
];

export const COLOR_SWATCHES = [
  "#0C2E3D", "#0EA5A5", "#F97316", "#000000", "#FFFFFF",
  "#333333", "#666666", "#999999", "#FF4444", "#2196F3",
  "#4CAF50", "#9C27B0", "#FF9800", "#795548",
];
