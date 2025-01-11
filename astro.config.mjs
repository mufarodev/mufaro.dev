// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import cloudflare from "@astrojs/cloudflare";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true 
    }
  }),
});