const defaultTheme = require("tailwindcss/defaultTheme");

const svgToDataUri = require("mini-svg-data-uri");

const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      container: {
        center: true,
      },

      // old
      // colors: {
      //   background: "#1e1f21",
      //   theme: {
      //     foreground: {
      //       DEFAULT: "#ded2e8",
      //       secondary: "#9e89b8",
      //     },
      //   },
      //   text: {
      //     foreground: "#d4d4d4",
      //   },
      // },

      colors: {
        background: "#131313",
        theme: {
          foreground: {
            DEFAULT: "#ded2e8",
            secondary: "#9e89b8",
            contrast: "#7e5bab"
          },
        },
        text: {
          foreground: "#d4d4d4",
        },
      },
      animation: {
        pulse: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'smooth-in': "smooth-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        'smooth-out': "smooth-out 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards",
        'spring': "spring 1s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        'bounce': "bounce 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
    },
  },
  plugins: [
    addVariablesForColors,
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-grid": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-grid-small": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
            )}")`,
          }),
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
  ],
};

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
