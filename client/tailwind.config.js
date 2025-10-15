// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#0ea5ff",
        surface: "#0f1720",
        bg: "#06070a",
      },
      boxShadow: {
        glow: "0 0 15px rgba(14, 165, 255, 0.3)",
      },
      keyframes: {
        dropdownEnter: {
          "0%": { opacity: 0, transform: "translateY(-0.5rem)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        dropdownLeave: {
          "0%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-0.5rem)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
      },
      animation: {
        dropdownEnter: "dropdownEnter 0.2s ease-out forwards",
        dropdownLeave: "dropdownLeave 0.2s ease-in forwards",
        fadeIn: "fadeIn 0.3s ease-in forwards",
        fadeOut: "fadeOut 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
