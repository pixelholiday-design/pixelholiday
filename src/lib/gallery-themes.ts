export type GalleryTheme = {
  id: string;
  name: string;
  description: string;
  gridCols: string;
  gap: string;
  photoClass: string;
  containerClass: string;
  bgClass: string;
  headerClass: string;
};

export const GALLERY_THEMES: Record<string, GalleryTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Clean grid layout with consistent spacing",
    gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    gap: "gap-4",
    photoClass: "rounded-lg shadow-sm",
    containerClass: "max-w-6xl mx-auto px-4",
    bgClass: "bg-white",
    headerClass: "text-navy-900",
  },
  masonry: {
    id: "masonry",
    name: "Masonry",
    description: "Pinterest-style staggered layout",
    gridCols: "columns-2 sm:columns-3 lg:columns-4",
    gap: "gap-3 space-y-3",
    photoClass: "rounded-lg break-inside-avoid",
    containerClass: "max-w-6xl mx-auto px-4",
    bgClass: "bg-cream-50",
    headerClass: "text-navy-900",
  },
  filmstrip: {
    id: "filmstrip",
    name: "Filmstrip",
    description: "Horizontal scroll with film-like borders",
    gridCols: "flex overflow-x-auto snap-x snap-mandatory",
    gap: "gap-4 pb-4",
    photoClass: "rounded-none border-4 border-navy-900 snap-center shrink-0 w-[300px] sm:w-[400px]",
    containerClass: "max-w-full px-4",
    bgClass: "bg-navy-900",
    headerClass: "text-white",
  },
  magazine: {
    id: "magazine",
    name: "Magazine",
    description: "Editorial layout with mixed sizes",
    gridCols: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
    gap: "gap-2",
    photoClass: "rounded-sm",
    containerClass: "max-w-7xl mx-auto px-4",
    bgClass: "bg-cream-100",
    headerClass: "text-navy-900 font-serif",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Spacious single-column with generous whitespace",
    gridCols: "grid-cols-1 sm:grid-cols-2",
    gap: "gap-8",
    photoClass: "rounded-none",
    containerClass: "max-w-4xl mx-auto px-8",
    bgClass: "bg-white",
    headerClass: "text-navy-800 tracking-wide",
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Dark background that makes photos pop",
    gridCols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    gap: "gap-3",
    photoClass: "rounded-lg shadow-lg",
    containerClass: "max-w-6xl mx-auto px-4",
    bgClass: "bg-navy-900",
    headerClass: "text-white",
  },
};

export function getTheme(themeId: string): GalleryTheme {
  return GALLERY_THEMES[themeId] || GALLERY_THEMES.classic;
}

export function getThemeList(): GalleryTheme[] {
  return Object.values(GALLERY_THEMES);
}
