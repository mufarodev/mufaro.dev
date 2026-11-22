<script module lang="ts">
	// Navigating back to the page must not replay the intro.
	let hasOpened = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	// Size of one dither cell in CSS pixels; the old 3px pixels read as noise rather than dither.
	const CELL = 6;
	const DURATION = 900;
	// Threshold weights: how much the radial sweep vs the dither pattern decides when a cell opens.
	const SWEEP = 0.62;
	const DITHER = 0.38;
	// 4x4 Bayer matrix: an ordered-dither threshold per cell instead of random noise.
	const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

	// Pixel-art sparkles thrown off the dissolve edge, drawn into the same cell grid.
	const SPARK_COLORS = [
		[246, 184, 214],
		[255, 244, 201],
		[201, 186, 246],
		[184, 226, 246]
	];
	// Sparks per millisecond, emitted on the expanding edge for as long as it's on screen.
	const SPAWN_RATE = 0.14;
	const MAX_SPARKS = 90;
	// How quickly a spark loses the speed it inherited from the edge, in milliseconds.
	const DRAG = 380;
	// Arm length over a star's life: a glint that opens into a four-point star and closes again.
	const TWINKLE = [0, 1, 1, 2, 2, 2, 1, 0];

	type Spark = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		born: number;
		life: number;
		star: boolean;
		color: number[];
	};

	let cover = $state<HTMLCanvasElement>();
	let opening = $state(!hasOpened);
	let art = $state<HTMLImageElement>();

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;

		function finish() {
			hasOpened = true;
			cancelAnimationFrame(frame);
			opening = false;
		}

		function start() {
			const context = cover?.getContext('2d');
			if (hasOpened || motion.matches || document.hidden || !cover || !context) return finish();

			const columns = Math.max(1, Math.ceil(cover.clientWidth / CELL));
			const rows = Math.max(1, Math.ceil(cover.clientHeight / CELL));
			cover.width = columns;
			cover.height = rows;
			const pixels = context.createImageData(columns, rows);
			// One packed RGBA word per cell (little-endian, so the bytes read A B G R).
			const cells = new Uint32Array(pixels.data.buffer);
			const pack = (r: number, g: number, b: number, a: number) =>
				((Math.round(a) << 24) | (b << 16) | (g << 8) | r) >>> 0;
			const COVER = pack(9, 9, 13, 255);

			const thresholds = new Float32Array(columns * rows);
			const centerX = (columns - 1) / 2;
			const centerY = (rows - 1) / 2;
			const radius = Math.max(1, Math.hypot(centerX, centerY));
			for (let i = 0; i < thresholds.length; i++) {
				const x = i % columns;
				const y = Math.floor(i / columns);
				const distance = Math.hypot(x - centerX, y - centerY) / radius;
				// The radial sweep sets when a region opens; the Bayer value sets the dither pattern
				// it opens through, so the edge is a crosshatch instead of scattered noise.
				thresholds[i] = SWEEP * distance + DITHER * ((BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16);
			}
			cells.fill(COVER);
			context.putImageData(pixels, 0, 0);
			cover.style.background = 'transparent';
			hasOpened = true;
			// The art grows into place as the cover opens around it. Under the opaque cover
			// until now, so it never shows at the small size.
			art?.animate([{ scale: 0.88 }, { scale: 1 }], {
				duration: 1300,
				easing: 'cubic-bezier(0.23, 1, 0.32, 1)'
			});

			const sparks: Spark[] = [];
			const started = performance.now();
			// The edge travels one radius per SWEEP of the timeline; sparks borrow that speed.
			const edgeSpeed = radius / (SWEEP * DURATION);
			let budget = 0;
			let last = started;

			function plot(x: number, y: number, color: number[], alpha: number) {
				if (x < 0 || y < 0 || x >= columns || y >= rows || alpha <= 0) return;
				cells[y * columns + x] = pack(color[0], color[1], color[2], alpha);
			}

			// Sparks are born on the leading fringe of the edge and launched outward at about the
			// edge's own speed, so they ride the reveal and only fall behind as drag slows them.
			function spawn(progress: number, now: number) {
				const distance = Math.max(0, (progress - DITHER * 0.25 * Math.random()) / SWEEP) * radius;
				const angle = Math.random() * Math.PI * 2;
				const x = Math.round(centerX + Math.cos(angle) * distance);
				const y = Math.round(centerY + Math.sin(angle) * distance);
				if (x < 0 || y < 0 || x >= columns || y >= rows) return;
				const star = Math.random() < 0.35;
				const speed = edgeSpeed * (0.85 + Math.random() * 0.4);
				sparks.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					born: now,
					life: star ? 600 + Math.random() * 250 : 260 + Math.random() * 160,
					star,
					color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)]
				});
			}

			function drawSpark(spark: Spark, age: number) {
				const t = age / spark.life;
				const fade = 255 * (t > 0.8 ? (1 - t) / 0.2 : 1);
				// Launch speed decays with drag; a slow upward float takes over as it settles.
				const travel = DRAG * (1 - Math.exp(-age / DRAG));
				const x = Math.round(spark.x + spark.vx * travel);
				const y = Math.round(spark.y + spark.vy * travel - age * 0.004);
				const arms = spark.star ? TWINKLE[Math.floor(t * TWINKLE.length)] : 0;
				plot(x, y, arms ? [255, 255, 255] : spark.color, fade);
				for (let k = 1; k <= arms; k++) {
					const alpha = k === arms && arms > 1 ? fade * 0.6 : fade;
					plot(x + k, y, spark.color, alpha);
					plot(x - k, y, spark.color, alpha);
					plot(x, y + k, spark.color, alpha);
					plot(x, y - k, spark.color, alpha);
				}
				if (arms === 2) {
					for (const [ox, oy] of [
						[1, 1],
						[1, -1],
						[-1, 1],
						[-1, -1]
					]) {
						plot(x + ox, y + oy, spark.color, fade * 0.4);
					}
				}
			}

			function draw(now: number) {
				const progress = (now - started) / DURATION;
				for (let i = 0; i < thresholds.length; i++) {
					cells[i] = thresholds[i] <= progress ? 0 : COVER;
				}

				// A steady stream from the first frame until the edge has left the panel.
				budget += (now - last) * SPAWN_RATE;
				last = now;
				for (; budget >= 1; budget--) {
					if (progress * (1 / SWEEP) < 1.05 && sparks.length < MAX_SPARKS) spawn(progress, now);
				}

				for (let k = sparks.length - 1; k >= 0; k--) {
					const age = now - sparks[k].born;
					if (age >= sparks[k].life) sparks.splice(k, 1);
					else drawSpark(sparks[k], age);
				}
				context!.putImageData(pixels, 0, 0);

				// Sparks outlive the cover by a beat; the hard cap guards against a stalled clock.
				if ((progress >= 1 && sparks.length === 0) || progress > 2.5) return finish();
				frame = requestAnimationFrame(draw);
			}
			frame = requestAnimationFrame(draw);
		}

		// Let layout settle, then reveal without waiting on the image download.
		frame = requestAnimationFrame(start);
		motion.addEventListener('change', finish);
		window.addEventListener('resize', finish);
		document.addEventListener('visibilitychange', finish);

		return () => {
			cancelAnimationFrame(frame);
			motion.removeEventListener('change', finish);
			window.removeEventListener('resize', finish);
			document.removeEventListener('visibilitychange', finish);
		};
	});
</script>

<div class="hero-artwork" aria-hidden="true">
	<img
		bind:this={art}
		src="/images/hero-artwork-dithered.webp"
		alt=""
		width="1200"
		height="821"
		fetchpriority="high"
	/>
	<div class="music-tint"></div>
	<div class="shade"></div>
	<div class="twinkles">
		<span style="left: 14%; top: 22%">✦</span>
		<span style="left: 78%; top: 12%; animation-delay: -1.2s">✧</span>
		<span style="left: 62%; top: 38%; animation-delay: -2.1s">⋆</span>
		<span style="left: 24%; top: 56%; animation-delay: -0.6s">✧</span>
		<span style="left: 86%; top: 64%; animation-delay: -2.8s">✦</span>
		<span style="left: 46%; top: 8%; animation-delay: -1.7s">⋆</span>
	</div>
</div>

{#if opening}
	<!-- Sibling of the artwork so the same dissolve uncovers the presence on top of it. -->
	<canvas bind:this={cover} class="opening-cover" aria-hidden="true"></canvas>
{/if}

<style>
	.hero-artwork,
	.opening-cover,
	.music-tint,
	.shade,
	.twinkles {
		position: absolute;
		inset: 0;
	}

	.hero-artwork {
		overflow: hidden;
		isolation: isolate;
		pointer-events: none;
		background: #09090d;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 52% 50%;
	}

	/* Server-rendered opaque, so the art never flashes before the intro starts. */
	.opening-cover {
		z-index: 40;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		background: #09090d;
		image-rendering: pixelated;
		pointer-events: none;
	}

	@media (scripting: none), (prefers-reduced-motion: reduce) {
		.opening-cover {
			display: none;
		}
	}

	.music-tint {
		background-color: rgb(var(--accent-r), var(--accent-g), var(--accent-b));
		mix-blend-mode: color;
		opacity: 0.4;
		transition: background-color 1.5s ease;
	}

	.shade {
		background: linear-gradient(
			180deg,
			rgb(5 5 7 / 0.35),
			rgb(5 5 7 / 0.05) 30%,
			rgb(5 5 7 / 0.2) 60%,
			rgb(5 5 7 / 0.85) 100%
		);
	}

	/* On mobile the widgets sit in the main column, so the bottom of the artwork needs only a light vignette. */
	@media (max-width: 899px) {
		.shade {
			background: linear-gradient(
				180deg,
				rgb(5 5 7 / 0.22),
				rgb(5 5 7 / 0.04) 35%,
				rgb(5 5 7 / 0.12) 70%,
				rgb(5 5 7 / 0.48) 100%
			);
		}
	}

	.twinkles span {
		position: absolute;
		font-size: 18px;
		line-height: 1;
		color: #f6b8d6;
		text-shadow: 0 0 8px rgb(246 184 214 / 0.8);
		animation: twinkle 3.4s ease-in-out infinite;
	}
	.twinkles span:nth-child(even) {
		color: #fff4c9;
		text-shadow: 0 0 8px rgb(255 244 201 / 0.7);
	}
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0;
			transform: scale(0.5) rotate(0deg);
		}
		50% {
			opacity: 0.9;
			transform: scale(1) rotate(45deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.music-tint {
			transition: none;
		}
		.twinkles span {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
