import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#fafafa",
        card: {
          DEFAULT: "#121215",
          foreground: "#fafafa",
          border: "#27272a",
        },
        neon: {
          DEFAULT: "#84cc16", // Lime 500
          bright: "#a3e635", // Lime 400
          dark: "#65a30d", // Lime 600
          glow: "rgba(163, 230, 53, 0.25)",
        },
        dark: {
          950: "#09090b",
          900: "#121215",
          800: "#18181b",
          700: "#27272a",
          600: "#3f3f46",
        }
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
