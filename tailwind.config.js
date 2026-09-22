/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        char: {
          950: "#0c0a08",
          900: "#15120e",
          800: "#211c16",
          700: "#2f2820",
          600: "#453a2c",
        },
        ochre: {
          300: "#e8c48a",
          400: "#d9a85f",
          500: "#c1873f",
          600: "#a06a2c",
        },
        ember: {
          400: "#e8703a",
          500: "#c9522a",
          600: "#a63f22",
        },
        parchment: "#ece1c8",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "'Times New Roman'", "serif"],
      },
      boxShadow: {
        glow: "0 0 24px 6px rgba(232, 112, 58, 0.35)",
      },
    },
  },
  plugins: [],
};
