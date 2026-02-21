import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('node_modules/gsap')) {
						return 'vendor-gsap';
					}
					if (id.includes('node_modules/motion')) {
						return 'vendor-motion';
					}
					if (id.includes('node_modules/animejs')) {
						return 'vendor-animejs';
					}
					if (id.includes('node_modules/lenis')) {
						return 'vendor-lenis';
					}
					if (id.includes('node_modules/@hugeicons') || id.includes('node_modules/@lucide')) {
						return 'vendor-icons';
					}
				}
			}
		}
	}
});
