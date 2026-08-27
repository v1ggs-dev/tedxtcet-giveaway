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
        tedx: {
          red: "#EB0028",          // Official TED Red (PMS 485 C)
          darkred: "#99001A",
          brightred: "#FF1F42",
          black: "#000000",        // Official TED Black
          dark: "#0B0B0E",
          card: "#131317",
          surface: "#1C1C22",
          border: "#2E2E38",
          white: "#FFFFFF",        // Official TED White
          offwhite: "#F5F5F7",
          muted: "#9E9EA8",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 35px -5px rgba(235, 0, 40, 0.55)',
        'glow-red-lg': '0 0 70px 0px rgba(235, 0, 40, 0.75)',
        'glow-white': '0 0 30px -5px rgba(255, 255, 255, 0.4)',
        'glow-green': '0 0 30px -5px rgba(34, 197, 94, 0.4)',
        'machine-inner': 'inset 0 4px 15px 0 rgba(0, 0, 0, 0.8), inset 0 -2px 10px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lever-glow': 'leverGlow 2s ease-in-out infinite',
      },
      keyframes: {
        leverGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(235, 0, 40, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 32px rgba(235, 0, 40, 0.95))' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
