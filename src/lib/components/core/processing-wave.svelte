<script lang="ts">
	import { onMount } from 'svelte';

	let {
		color,
		active = true
	}: {
		color: { r: number; g: number; b: number };
		active?: boolean;
	} = $props();
	let canvas: HTMLCanvasElement;
	let refresh = () => {};

	$effect(() => {
		void active;
		void color;
		refresh();
	});

	onMount(() => {
		const context = canvas.getContext('2d');
		if (!context) return;
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		// A small, soft light field needs no full-resolution canvas or WebGL context.
		const width = canvas.width;
		const height = canvas.height;
		const pixels = context.createImageData(width, height);
		let frame = 0;
		let visible = false;
		let previous = 0;

		const smoothstep = (value: number) => {
			const t = Math.min(1, Math.max(0, value));
			return t * t * (3 - 2 * t);
		};

		function draw(time: number) {
			const { r, g, b } = color;
			// Processing wave from gemini-dots-demo/samsy.glsl: same wiggle, envelope,
			// speed and fourth-power vertical falloff, tinted with the album's color.
			for (let x = 0; x < width; x++) {
				const u = (x + 0.5) / width;
				const vx = u * 2.5;
				const vy = time * 0.49;
				const wiggle =
					(Math.sin(vx * 3) +
						Math.cos(vy * 2.5) +
						Math.sin((vx - vy) * 4) +
						Math.cos((vx + vy) * 5)) *
					0.25;
				const base = Math.sin(u * Math.PI);
				const waveHeight = ((wiggle + 1) * 0.25 + 0.5) * base * 1.35;
				const position = ((((u - time * 0.437) * 0.73) % 1) + 1) % 1;
				const mix = smoothstep(position < 0.5 ? position * 2 : (1 - position) * 2);
				const tint = 0.15 + mix * 0.55;
				for (let y = 0; y < height; y++) {
					const i = (y * width + x) * 4;
					const mask = smoothstep(1 - (1 - y / (height - 1)) / waveHeight);
					pixels.data[i] = r + (255 - r) * tint;
					pixels.data[i + 1] = g + (255 - g) * tint;
					pixels.data[i + 2] = b + (255 - b) * tint;
					pixels.data[i + 3] = 255 * base * mask ** 4;
				}
			}
			context!.putImageData(pixels, 0, 0);
		}

		function tick(now: number) {
			if (now - previous >= 1000 / 30) {
				draw(now / 1000);
				previous = now;
			}
			frame = requestAnimationFrame(tick);
		}

		function update() {
			cancelAnimationFrame(frame);
			if (!visible || document.hidden || !active) return;
			draw(motion.matches ? 0 : performance.now() / 1000);
			if (!motion.matches) frame = requestAnimationFrame(tick);
		}
		refresh = update;
		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			update();
		});
		observer.observe(canvas);
		motion.addEventListener('change', update);
		document.addEventListener('visibilitychange', update);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			motion.removeEventListener('change', update);
			document.removeEventListener('visibilitychange', update);
		};
	});
</script>

<canvas bind:this={canvas} width="240" height="36" aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
