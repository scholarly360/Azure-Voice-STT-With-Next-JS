import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0066FF",
        primary: {
          DEFAULT: "#0066FF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f5f5f5",
          foreground: "#0066FF",
        },
        muted: {
          DEFAULT: "#f0f0f0",
          foreground: "#0055CC",
        },
        accent: {
          DEFAULT: "#0066FF",
          foreground: "#ffffff",
        },
        border: "#d0d5dd",
        input: "#d0d5dd",
        ring: "#0066FF",
        card: {
          DEFAULT: "#fafafa",
          foreground: "#0066FF",
        },
        destructive: {
          DEFAULT: "#ff3333",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(0, 102, 255, 0.3)" },
          "50%": { boxShadow: "0 0 24px rgba(0, 102, 255, 0.6)" },
        },
        "wave-bar": {
          "0%, 100%": { height: "4px" },
          "50%": { height: "20px" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "wave-bar": "wave-bar 0.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
