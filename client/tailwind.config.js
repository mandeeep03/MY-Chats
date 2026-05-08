/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0d0d0f",
          800: "#141417",
          700: "#1c1c21",
          600: "#25252c",
          500: "#2e2e38",
        },
        accent: {
          DEFAULT: "#6c63ff",
          hover: "#574fd6",
          light: "#8b85ff",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
