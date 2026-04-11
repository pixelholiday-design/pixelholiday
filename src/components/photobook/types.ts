export interface BookElement {
  id: string;
  type: "photo" | "text" | "shape" | "background";
  x: number; // percentage 0-100
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  style: Record<string, string | number | boolean>;
}

export interface BookPage {
  pageNumber: number;
  elements: BookElement[];
  background: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  isHookImage: boolean;
  isFavorited: boolean;
}

export interface SavedDesign {
  id: string;
  title: string;
  bookType: string;
  bookSize: string;
  paper: string;
  pages: unknown[];
  coverDesign: Record<string, unknown> | null;
  status: string;
}

export type ToolTab = "photos" | "layouts" | "text" | "shapes" | "backgrounds";

export interface LayoutPreset {
  name: string;
  label: string;
  elements: Omit<BookElement, "id">[];
}
