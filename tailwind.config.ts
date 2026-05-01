import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "secondary-fixed-dim": "#c8d5e9",
        "inverse-surface": "#0c0f10",
        "tertiary-container": "#d5cbfc",
        "on-tertiary-fixed-variant": "#524b74",
        "on-tertiary-fixed": "#352f56",
        "error-container": "#fa746f",
        "tertiary-fixed": "#d5cbfc",
        "on-primary-container": "#001429",
        "primary-fixed-dim": "#008ae5",
        "on-primary": "#f7f9ff",
        "surface-container-highest": "#dee3e6",
        "error-dim": "#67040d",
        "on-background": "#2d3335",
        "surface-dim": "#d5dbdd",
        "inverse-on-surface": "#9b9d9e",
        "inverse-primary": "#2498f5",
        "on-surface-variant": "#5a6062",
        "secondary-container": "#d7e3f7",
        "surface-container-lowest": "#ffffff",
        "on-error": "#fff7f6",
        "on-tertiary": "#fcf7ff",
        background: "#f8f9fa",
        "tertiary-dim": "#544e77",
        "on-error-container": "#6e0a12",
        primary: "#0062a5",
        "secondary-fixed": "#d7e3f7",
        "secondary-dim": "#485464",
        "on-primary-fixed": "#000000",
        outline: "#767c7e",
        "on-secondary-fixed": "#344050",
        "primary-dim": "#005691",
        "on-primary-fixed-variant": "#00203c",
        "on-secondary-fixed-variant": "#505c6d",
        "primary-container": "#2498f5",
        "on-surface": "#2d3335",
        "surface-bright": "#f8f9fa",
        "surface-container": "#ebeef0",
        "surface-variant": "#dee3e6",
        tertiary: "#615a84",
        error: "#a83836",
        "primary-fixed": "#2498f5",
        "on-tertiary-container": "#49426a",
        secondary: "#546071",
        "outline-variant": "#adb3b5",
        "on-secondary-container": "#465363",
        surface: "#f8f9fa",
        "surface-container-high": "#e5e9eb",
        "tertiary-fixed-dim": "#c7beee",
        "surface-container-low": "#f1f4f5",
        "on-secondary": "#f7f9ff",
        "surface-tint": "#0062a5"
      },
      fontFamily: {
        headline: ["var(--font-headline)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        label: ["var(--font-body)", "Inter", "sans-serif"]
      },
      boxShadow: {
        ambient: "0 24px 60px rgba(45, 51, 53, 0.06)",
        soft: "0 18px 42px rgba(0, 98, 165, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
