<script lang="ts">
	// Stacked area chart drawn with a 4x4 ordered (Bayer) dither: the same texture as the hero
	// artwork bake in scripts/dither-hero.py, rendered live on a low-resolution canvas.
	type Series = { data: number[]; density: number };
	let {
		series,
		color,
		height = 36
	}: { series: Series[]; color: { r: number; g: number; b: number }; height?: number } = $props();

	const CELL = 2; // CSS pixels per dither cell
	const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

	let canvas: HTMLCanvasElement;
	let cols = 0;
	let rows = 0;
	let shown: number[][] = [];
	let targets: number[][] = [];
	let sweep = 0;
	let frame = 0;
	let started = 0;
	let reduced = false;

	function sample(data: number[], t: number) {
		if (data.length < 2) return data[0] ?? 0;
		const at = t * (data.length - 1);
		const i = Math.min(data.length - 2, Math.floor(at));
		return data[i] + (data[i + 1] - data[i]) * (at - i);
	}

	function draw() {
		if (!canvas || !cols) return;
		const context = canvas.getContext('2d')!;
		const image = context.createImageData(cols, rows);
		const { r, g, b } = color;
		// Back to front: the first series sits behind the others.
		series.forEach(({ density }, s) => {
			for (let x = 0; x < cols; x++) {
				if (x / cols > sweep) break;
				const value = sample(shown[s] ?? [], cols > 1 ? x / (cols - 1) : 0);
				const top = Math.round((1 - Math.min(100, value) / 100) * (rows - 1));
				for (let y = top; y < rows; y++) {
					// Brightest at the value line, fading toward the floor.
					const level = y === top ? 1 : (1 - 0.95 * ((y - top) / rows)) * density;
					const threshold = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
					if (level <= threshold) continue;
					const offset = (y * cols + x) * 4;
					image.data[offset] = r;
					image.data[offset + 1] = g;
					image.data[offset + 2] = b;
					image.data[offset + 3] = y === top ? 255 : 210;
				}
			}
		});
		context.putImageData(image, 0, 0);
	}

	function tick(now: number) {
		frame = 0;
		started ||= now;
		sweep = reduced ? 1 : Math.min(1, 1 - (1 - (now - started) / 900) ** 3);
		let moving = sweep < 1;
		shown = targets.map((target, s) => {
			const current = shown[s];
			if (reduced || current?.length !== target.length) return target;
			return target.map((value, i) => {
				const gap = value - current[i];
				if (Math.abs(gap) > 0.05) moving = true;
				return Math.abs(gap) > 0.05 ? current[i] + gap * 0.2 : value;
			});
		});
		draw();
		if (moving) frame = requestAnimationFrame(tick);
	}

	function run() {
		if (!frame) frame = requestAnimationFrame(tick);
	}

	$effect(() => {
		targets = series.map((item) => [...item.data]);
		void color; // redraw when the accent changes
		run();
	});

	$effect(() => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const observer = new ResizeObserver(([entry]) => {
			cols = Math.max(1, Math.round(entry.contentRect.width / CELL));
			rows = Math.max(1, Math.round(height / CELL));
			canvas.width = cols;
			canvas.height = rows;
			draw();
		});
		observer.observe(canvas);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
			frame = 0;
		};
	});
</script>

<canvas bind:this={canvas} style:height="{height}px" aria-hidden="true"></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		image-rendering: pixelated;
	}
</style>
