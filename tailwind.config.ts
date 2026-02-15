import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/types/**/*.{js,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  safelist: [
    "from-gray-900", "to-gray-700",
    "from-indigo-600", "to-purple-600",
    "from-rose-500", "to-orange-500",
    "from-teal-700", "to-emerald-600",
    "from-green-600", "to-cyan-600",
  ],
  plugins: [],
};
export default config;
