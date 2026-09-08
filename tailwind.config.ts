import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#080A0B",
        surface: "#101314",
        "surface-light": "#171B1D",
        accent: "#D2F51E",
        "accent-hover": "#E0FF3F",
        "text-secondary": "#A7ADB0",
        border: "rgba(255,255,255,.08)",

        brava: {
          white: "var(--brava-white)",
          blue: "var(--brava-blue)",
          "blue-dark": "var(--brava-blue-dark)",
          accent: "var(--brava-accent)",
          bg: "var(--brava-bg)",
          border: "var(--brava-border)",
          "text-secondary": "var(--brava-text-secondary)",
          text: "var(--brava-text)",
          warning: "var(--brava-warning)",
          "warning-bg": "var(--brava-warning-bg)",
          "warning-border": "var(--brava-warning-border)",
          danger: "var(--brava-danger)",
          "danger-bg": "var(--brava-danger-bg)",
          "danger-border": "var(--brava-danger-border)",
          success: "var(--brava-success)",
          "success-bg": "var(--brava-success-bg)",
          "success-border": "var(--brava-success-border)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
        brava: ["var(--font-brava)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
      boxShadow: {
        "brava-sm": "var(--brava-shadow-sm)",
        "brava-md": "var(--brava-shadow-md)",
        "brava-lg": "var(--brava-shadow-lg)",
      },
      borderRadius: {
        "brava-sm": "var(--brava-radius-sm)",
        "brava-md": "var(--brava-radius-md)",
        "brava-lg": "var(--brava-radius-lg)",
      },
      backgroundImage: {
        "grid-technical":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "popover-in": {
          "0%": { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "popover-in": "popover-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
