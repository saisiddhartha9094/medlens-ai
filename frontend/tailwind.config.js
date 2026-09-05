/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          900: "#1e3a8a",
        },
        clinical: {
          dark: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          teal: "#0d9488",
          emerald: "#059669",
          amber: "#d97706",
          rose: "#e11d48",
        }
      }
    },
  },
  plugins: [],
}
