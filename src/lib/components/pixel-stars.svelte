<script lang="ts">
	import { onMount } from 'svelte';

	// CSS pixels per star pixel: the canvas is drawn tiny and scaled up crisp.
	const CELL = 3;
	// One star per this many square CSS pixels.
	const DENSITY = 16000;
	// Same palette and twinkle as the hero's sparks, so the two read as one sky.
	const COLORS = ['255 244 201', '246 184 214', '201 186 246', '184 226 246'];
	const TWINKLE = [0, 1, 1, 2, 2, 2, 1, 0];
	const FRAME = 200; // ms per twinkle frame; a low frame rate keeps it feeling pixel-art
	const REST = [8000, 24000]; // ms a star waits between twinkles

	type Star = { x: number; y: number; color: string; next: number };

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const context = canvas.getContext('2d')!;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const wait = () => REST[0] + Math.random() * (REST[1] - REST[0]);
		let stars: Star[] = [];
		let frame = 0;
		let last = 0;

		function layout() {
			const { width, height } = canvas.getBoundingClientRect();
			canvas.width = Math.ceil(width / CELL);
			canvas.height = Math.ceil(height / CELL);
			const now = performance.now();
			stars = Array.from({ length: Math.round((width * height) / DENSITY) }, () => ({
				x: 2 + Math.floor(Math.random() * (canvas.width - 4)),
				y: 2 + Math.floor(Math.random() * (canvas.height - 4)),
				color: COLORS[Math.random() < 0.55 ? 0 : 1 + Math.floor(Math.random() * 3)],
				// Stagger the first twinkles so they don't all fire on load.
				next: now + Math.random() * REST[1]
			}));
		}

		function plot(x: number, y: number, color: string, alpha: number) {
			context.fillStyle = `rgb(${color} / ${alpha})`;
			context.fillRect(x, y, 1, 1);
		}

		function draw(now: number) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			for (const star of stars) {
				const step = Math.floor((now - star.next) / FRAME);
				if (step >= TWINKLE.length) star.next = now + wait();
				// Reduced motion: a fixed handful of stars sit fully open instead of blinking.
				const arms = still ? (star.next % 5 < 1 ? 2 : 0) : (TWINKLE[step] ?? 0);
				plot(star.x, star.y, arms ? '255 255 255' : star.color, arms ? 0.4 : 0.14);
				for (let k = 1; k <= arms; k++) {
					const alpha = k === 1 ? 0.24 : 0.1;
					plot(star.x + k, star.y, star.color, alpha);
					plot(star.x - k, star.y, star.color, alpha);
					plot(star.x, star.y + k, star.color, alpha);
					plot(star.x, star.y - k, star.color, alpha);
				}
			}
		}

		// rAF already stops in background tabs; this just caps redraws to the twinkle frame rate.
		function tick(now: number) {
			frame = requestAnimationFrame(tick);
			if (now - last < FRAME) return;
			last = now;
			draw(now);
		}

		function refresh() {
			layout();
			draw(performance.now());
		}

		refresh();
		if (!still) frame = requestAnimationFrame(tick);
		addEventListener('resize', refresh);
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('resize', refresh);
		};
	});
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		image-rendering: pixelated;
		pointer-events: none;
	}
	/* On desktop the sky only sits behind the content column, beside the hero. */
	@media (min-width: 900px) {
		canvas {
			left: max(360px, 42vw);
			width: calc(100% - max(360px, 42vw));
		}
	}
</style>
