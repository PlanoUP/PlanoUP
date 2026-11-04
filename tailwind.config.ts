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

        // Each resolves through its own `--brava-x-rgb` triplet (see
        // brava-tokens.css) via `rgb(... / <alpha-value>)`, the pattern
        // Tailwind needs to synthesize opacity-modifier utilities
        // (bg-brava-blue-dark/90 and the like) for a CSS-variable-backed
        // color — a plain var(--brava-x) reference can't carry an alpha
        // channel Tailwind can splice a modifier into.
        brava: {
          white: "rgb(var(--brava-white-rgb) / <alpha-value>)",
          blue: "rgb(var(--brava-blue-rgb) / <alpha-value>)",
          "blue-dark": "rgb(var(--brava-blue-dark-rgb) / <alpha-value>)",
          accent: "rgb(var(--brava-accent-rgb) / <alpha-value>)",
          bg: "rgb(var(--brava-bg-rgb) / <alpha-value>)",
          border: "rgb(var(--brava-border-rgb) / <alpha-value>)",
          "text-secondary": "rgb(var(--brava-text-secondary-rgb) / <alpha-value>)",
          text: "rgb(var(--brava-text-rgb) / <alpha-value>)",
          warning: "rgb(var(--brava-warning-rgb) / <alpha-value>)",
          "warning-bg": "rgb(var(--brava-warning-bg-rgb) / <alpha-value>)",
          "warning-border": "rgb(var(--brava-warning-border-rgb) / <alpha-value>)",
          danger: "rgb(var(--brava-danger-rgb) / <alpha-value>)",
          "danger-bg": "rgb(var(--brava-danger-bg-rgb) / <alpha-value>)",
          "danger-border": "rgb(var(--brava-danger-border-rgb) / <alpha-value>)",
          success: "rgb(var(--brava-success-rgb) / <alpha-value>)",
          "success-bg": "rgb(var(--brava-success-bg-rgb) / <alpha-value>)",
          "success-border": "rgb(var(--brava-success-border-rgb) / <alpha-value>)",
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
        "radar-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "70%": { transform: "scale(2.3)", opacity: "0" },
          "100%": { transform: "scale(2.3)", opacity: "0" },
        },
        "video-fade-in": {
          "0%": { opacity: "0", transform: "scale(1.03)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "video-caption-in": {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "popover-in": "popover-in 0.18s ease-out",
        "radar-pulse": "radar-pulse 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        "video-fade-in": "video-fade-in 700ms ease-out forwards",
        "video-caption-in": "video-caption-in 400ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
