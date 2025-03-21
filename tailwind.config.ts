const defaultTheme = require("tailwindcss/defaultTheme");
const svgToDataUri = require("mini-svg-data-uri");
const colors = require("tailwindcss/colors");
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        theme: {
          background: {
            DEFAULT: 'var(--background)',
            dark: 'var(--background-dark)',
          },
          foreground: {
            DEFAULT: 'var(--foreground)',
            secondary: 'var(--foreground-secondary)',
            contrast: 'var(--foreground-contrast)',
          },
          card: {
            DEFAULT: 'var(--card)',
            dark: 'var(--card-dark)',
            border: 'var(--card-border)',
          }
        },
      },
      container: {
        center: true,
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
    addThemeVariables,
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

function addThemeVariables({ addBase }: any) {
  addBase({
    // Light mode variables (default)
    ":root": {
      "--background": "#ffffff",
      "--background-dark": "#f9fafb",
      "--foreground": "#111827",
      "--foreground-secondary": "#374151",
      "--foreground-contrast": "#6366f1", // indigo for light mode
      "--card": "rgba(255, 255, 255, 0.8)",
      "--card-dark": "rgba(249, 250, 251, 0.8)",
      "--card-border": "rgba(0, 0, 0, 0.1)",
      // Add gradient colors
      "--gradient-start": "#6366f1", // indigo
      "--gradient-mid": "#9333ea",  // purple
      "--gradient-end": "#ec4899",  // pink
    },
    // Dark mode variables
    ".dark": {
      "--background": "#000000",
      "--background-dark": "#0a0a0a",
      "--foreground": "#ffffff",
      "--foreground-secondary": "rgba(255, 255, 255, 0.7)",
      "--foreground-contrast": "#818cf8", // lighter indigo for dark mode
      "--card": "rgba(0, 0, 0, 0.25)",
      "--card-dark": "rgba(0, 0, 0, 0.4)",
      "--card-border": "rgba(255, 255, 255, 0.1)",
      // Add gradient colors for dark mode
      "--gradient-start": "#818cf8",  // lighter indigo
      "--gradient-mid": "#a78bfa",    // lighter purple
      "--gradient-end": "#f9a8d4",    // lighter pink
    }
  });
}