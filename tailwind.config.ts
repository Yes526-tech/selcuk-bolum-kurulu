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
        selcuk: {
          blue: "#0A2540",
          turquoise: "#00A896",
          gold: "#D4AF37",
          dark: "#061325",
          light: "#F4F7FA",
          navy: "#0d2b45",
          accent: "#208b8b"
        }
      }
    },
  },
  plugins: [],
};
export default config;
