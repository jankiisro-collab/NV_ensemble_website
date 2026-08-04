/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#05070d",
        panel: "#0d1420",
        panel2: "#0a0f1a",
        border: "#1a2436",
        accentGreen: "#34d399",
        accentBlue: "#60a5fa",
        accentOrange: "#fb923c",
        accentRed: "#f87171",
        cyan: "#22d3ee",
        violet: "#a78bfa",
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,211,238,0.15)",
        glowStrong: "0 0 30px rgba(34,211,238,0.3)",
      },
    },
  },
  plugins: [],
};
