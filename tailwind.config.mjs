/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      container: {
        center: true,
      },

      colors: {
        background: "#1e1f21",
        theme: {
          foreground: {
            DEFAULT: "#ded2e8",
            secondary: "#9e89b8",
          },
        },
        text: {
          foreground: "#d4d4d4",
        },
      },
    },
  },
  plugins: [],
};
