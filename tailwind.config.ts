import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-roboto)"],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      keyframes: {
        "progress-bar": {
          "0%": {
            width: "100%",
          },
          "100%": {
            width: "0%",
          },
        },
      },
      animation: {
        "progress-bar": "progress-bar 5s linear forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
} satisfies Config;
