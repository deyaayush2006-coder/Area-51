/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#030712",       // deep base background
        panel: "#0b1526",      // card / panel background
        "panel-raised": "#101f38",
        steel: "#1c3a5e",      // borders / dividers
        "steel-light": "#28527f",
        blue: {
          mid: "#2563a8",
          deep: "#0e2a4d",
        },
        cyan: {
          glow: "#5eead4",
          bright: "#67e8f9",
          sky: "#38bdf8",
        },
        radar: "#34d399",      // active / granted green
        amber: "#fbbf24",      // warning / classified stamp
        redalert: "#f87171",
        ink: {
          primary: "#e6f1ff",
          muted: "#7fa0c4",
          faint: "#3d5a7d",
        },
      },
      fontFamily: {
        display: ["'Orbitron'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      keyframes: {
        "radar-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "blip-pulse": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.6" },
          "97%": { opacity: "1" },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 100%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "radar-spin": "radar-spin 4s linear infinite",
        "blip-pulse": "blip-pulse 2.4s ease-in-out infinite",
        flicker: "flicker 6s linear infinite",
        scan: "scan 8s linear infinite",
        "fade-up": "fade-up 0.7s ease-out both",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
