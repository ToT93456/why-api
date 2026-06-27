import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#081121",
        surface: "#0f172a",
        accent: "#7c3aed",
        accentSoft: "#22d3ee",
      },
      boxShadow: {
        glow: "0 20px 60px rgba(124, 58, 237, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
