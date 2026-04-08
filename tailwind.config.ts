import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── PixelHoliday brand (real logo colors) ──
        brand: {
          50:  "#E8F6FC",
          100: "#C5E9F7",
          200: "#8FD4EF",
          300: "#4FC4F0",  // Light Blue (highlights)
          400: "#29ABE2",  // PRIMARY — turquoise cyan (THE PixelHoliday blue)
          500: "#29ABE2",
          600: "#1F93C5",
          700: "#1A7BB5",  // Dark Blue (deeper elements, sidebar bg)
          800: "#156291",
          900: "#0F4868",
        },
        // Legacy coral (kept — accent + secondary CTA)
        coral: {
          50:  "#FEF3F0",
          100: "#FCE4DC",
          200: "#F8C4B2",
          300: "#F39E82",
          400: "#EE7A58",
          500: "#E8593C",
          600: "#CF4428",
          700: "#A8351F",
          800: "#7E2818",
          900: "#551A10",
        },
        // Navy — dark backgrounds for kiosks + text
        navy: {
          50:  "#F0F3F8",
          100: "#D9E0EC",
          200: "#A9B7CC",
          300: "#7A8EAC",
          400: "#52678B",
          500: "#334766",
          600: "#1F3352",
          700: "#162642",
          800: "#0F1B2D",
          900: "#0C1829",  // Dark Background
        },
        // Cream — warm page backgrounds
        cream: {
          50:  "#FFFFFE",
          100: "#FAFAF7",  // Cream Background
          200: "#F3F2EC",
          300: "#E9E7DD",
        },
        // Gold — premium/VIP elements
        gold: {
          400: "#E3BC6D",
          500: "#D4A853",
          600: "#B38B3C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(15, 27, 45, 0.12)",
        card: "0 1px 3px rgba(15, 27, 45, 0.06), 0 4px 16px -4px rgba(15, 27, 45, 0.08)",
        lift: "0 12px 36px -12px rgba(15, 27, 45, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
