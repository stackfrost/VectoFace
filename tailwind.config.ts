import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030305", // Deep pitch black
        surface: "#0A0A0F",    // Ultra-dark charcoal container
        surfaceBorder: "#181824",
        neonMint: "#00FF87",   // Primary high-status green
        neonViolet: "#B026FF", // Accent ragebait violet
        alertRed: "#FF003C",   // Sub-5 / Alert red
      },
      fontFamily: {
        mono: ["Consolas", "Monaco", "Courier New", "monospace"],
      },
      boxShadow: {
        'glow-mint': '0 0 25px -5px rgba(0, 255, 135, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(176, 38, 255, 0.4)',
        'glow-red': '0 0 25px -5px rgba(255, 0, 60, 0.4)',
        'bleed-mint': '0 0 50px -10px rgba(0, 255, 135, 0.25)',
        'bleed-violet': '0 0 50px -10px rgba(176, 38, 255, 0.25)',
      },
    },
  },
  plugins: [],
};
export default config;