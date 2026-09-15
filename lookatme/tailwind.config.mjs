/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        blue: "var(--al-blue)",
        surface: "var(--al-surface)",
        "surface-raised": "var(--al-surface-raised)",
        border: "var(--al-border)",
        "border-soft": "var(--al-border-soft)",
        "text-card": "var(--al-text-card)",
        "text-muted": "var(--al-text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        script: ["var(--font-script)"],
      },
    },
  },
  plugins: [],
};
