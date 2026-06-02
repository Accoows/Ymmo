import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C0C0C",
        parchment: "#F5F0E8",
        stone: "#8C8680",
        gold: "#B89A5E",
        "gold-light": "#D4B87A",
        surface: "#FAFAF8",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.25em",
        title: "0.08em",
      },
      maxWidth: {
        editorial: "1440px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
