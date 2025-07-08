// tailwind.config.js
import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {},
  darkMode: ["class", "class"],
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#fff7ed",
              100: "#ffedd5",
              200: "#fdd8ab",
              300: "#fcbb75",
              400: "#f9943e",
              500: "#f77518",
              600: "#ec5c0e",
              700: "#c1440d",
              800: "#993613",
              900: "#7b2e13",
              950: "#431507",
              foreground: "#FFFFFF",
              DEFAULT: "#ec5c0e",
            },
          },
        },
      },
    }),
    require("tailwindcss-animate"),
  ],
};
