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
      fontFamily: {
        cairo: ["var(--font-cairo)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#0F172A",
          blue: "#2563EB",
          indigo: "#6366F1",
          purple: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          danger: "#EF4444",
          surface: "#F8FAFC",
          card: "#FFFFFF",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#E2E8F0",
      },
      backgroundImage: {
        "ai-gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        "ai-subtle": "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.12) 100%)",
      },
      boxShadow: {
        "card-soft": "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "ai-glow": "0 4px 20px -2px rgba(99, 102, 241, 0.35)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
