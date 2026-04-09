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
        // ── Fotiqo brand colors ──
        fotiqo: {
          50:  "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",  // Mint — highlights
          400: "#2DD4BF",
          500: "#0EA5A5",  // PRIMARY — teal
          600: "#0D9488",  // Button hover
          700: "#0F766E",  // Active/pressed
          800: "#115E59",
          900: "#134E4A",
        },
        // brand alias for backward compat
        brand: {
          50:  "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#0EA5A5",
          500: "#0EA5A5",
          600: "#0D9488",
          700: "#0C2E3D",
          800: "#115E59",
          900: "#134E4A",
        },
        // Coral → CTA orange
        coral: {
          50:  "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",  // CTA orange
          600: "#EA580C",  // CTA hover
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        // Mint accent
        mint: {
          200: "#A7F3D0",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
        },
        "cta-orange": "#F97316",
        "cta-orange-hover": "#EA580C",
        // Navy — deep dark backgrounds
        navy: {
          50:  "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          300: "#9FB3C8",
          400: "#829AB1",
          500: "#627D98",
          600: "#486581",
          700: "#334E68",
          800: "#243B53",
          900: "#0C2E3D",  // Deep Navy — primary dark
        },
        // Cream — warm page backgrounds
        cream: {
          50:  "#FFFFFE",
          100: "#FAFAF9",  // Warm White background
          200: "#F5F5F4",
          300: "#E7E5E4",
        },
        // Gold — premium/VIP elements
        gold: {
          400: "#E3BC6D",
          500: "#D4A853",
          600: "#B38B3C",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(12, 46, 61, 0.12)",
        card: "0 1px 3px rgba(12, 46, 61, 0.06), 0 4px 16px -4px rgba(12, 46, 61, 0.08)",
        lift: "0 12px 36px -12px rgba(12, 46, 61, 0.25)",
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
