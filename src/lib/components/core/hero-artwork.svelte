<script module lang="ts">
	// Shared by the desktop and mobile instances; resizing must not replay the intro.
	let hasOpened = false;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let { morphProgress = 0 }: { morphProgress?: number } = $props();
	let cover = $state<HTMLCanvasElement>();
	let opening = $state(true);
	let finishOpening = () => {};
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let imageTransform = $derived.by(() => {
		if (viewportWidth < 768 || !viewportHeight) return undefined;
		const aspect = 1200 / 608;
		const heroWidth = viewportWidth - 24;
		const width = Math.max(heroWidth, (viewportHeight - 24) * aspect);
		const pillWidth = Math.min(1200, viewportWidth * 0.9);
		const scale = (width + (pillWidth - width) * morphProgress) / 1200;
		const x = (heroWidth - width) * 0.7 * (1 - morphProgress);
		const y = (80 - pillWidth / aspect) * 0.36 * morphProgress;

		// Keep the texture's layout fixed; only its transform follows the changing frame.
		return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
	});

	$effect(() => {
		if (morphProgress > 0) finishOpening();
	});

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;

		function finish() {
			cancelAnimationFrame(frame);
			opening = false;
		}
		finishOpening = finish;

		function start() {
			if (hasOpened || motion.matches || morphProgress > 0 || document.hidden) {
				finish();
				return;
			}

			const canvas = cover;
			if (!canvas) {
				finish();
				return;
			}

			const context = canvas.getContext('2d');
			if (!context) {
				finish();
				return;
			}

			// One canvas pixel per 3 CSS pixels; no full-resolution rendering loop.
			const columns = Math.max(1, Math.ceil(canvas.clientWidth / 3));
			const rows = Math.max(1, Math.ceil(canvas.clientHeight / 3));
			canvas.width = columns;
			canvas.height = rows;
			const pixels = context.createImageData(columns, rows);
			const thresholds = new Float32Array(columns * rows);
			const centerX = (columns - 1) / 2;
			const centerY = (rows - 1) / 2;
			const radius = Math.max(1, Math.hypot(centerX, centerY));
			for (let i = 0; i < thresholds.length; i++) {
				const distance = Math.hypot((i % columns) - centerX, Math.floor(i / columns) - centerY);
				thresholds[i] = 0.7 * (distance / radius) + 0.3 * Math.random();
				pixels.data.set([9, 9, 13, 255], i * 4);
			}
			context.putImageData(pixels, 0, 0);
			canvas.style.background = 'transparent';
			hasOpened = true;
			const started = performance.now();

			function draw(now: number) {
				const progress = (now - started) / 900;
				if (progress >= 1) {
					finish();
					return;
				}
				for (let i = 0; i < thresholds.length; i++) {
					pixels.data[i * 4 + 3] = thresholds[i] <= progress ? 0 : 255;
				}
				context!.putImageData(pixels, 0, 0);
				frame = requestAnimationFrame(draw);
			}
			frame = requestAnimationFrame(draw);
		}

		// Let the layout choose its hero, then reveal without waiting on image downloads.
		frame = requestAnimationFrame(start);
		motion.addEventListener('change', finish);
		window.addEventListener('resize', finish);
		window.addEventListener('scroll', finish, { passive: true });
		window.addEventListener('pointerdown', finish);
		window.addEventListener('keydown', finish);
		window.addEventListener('focusin', finish);
		document.addEventListener('visibilitychange', finish);

		return () => {
			cancelAnimationFrame(frame);
			motion.removeEventListener('change', finish);
			window.removeEventListener('resize', finish);
			window.removeEventListener('scroll', finish);
			window.removeEventListener('pointerdown', finish);
			window.removeEventListener('keydown', finish);
			window.removeEventListener('focusin', finish);
			document.removeEventListener('visibilitychange', finish);
		};
	});
</script>

<svelte:window bind:innerWidth={viewportWidth} bind:innerHeight={viewportHeight} />

<div class="hero-artwork" aria-hidden="true">
	<div class="scene" class:compact={morphProgress === 1}>
		<img
			class:transform-image={!!imageTransform}
			src="/images/hero-artwork-dithered.webp"
			alt=""
			width="1200"
			height="608"
			fetchpriority={morphProgress === 1 ? 'low' : 'high'}
			style:transform={imageTransform}
			style:object-position={imageTransform
				? '0% 0%'
				: `var(--artwork-x, 70%) ${36 * morphProgress}%`}
		/>
		<div class="music-tint"></div>
		<div class="shade"></div>
		<div class="pill-shade" style:opacity={morphProgress}></div>
	</div>
</div>

{#if opening && morphProgress === 0}
	<!-- Sibling of the background so the same dissolve uncovers the live hero UI. -->
	<canvas bind:this={cover} class="opening-cover" aria-hidden="true"></canvas>
{/if}

<style>
	.hero-artwork {
		position: absolute;
		inset: 0;
		overflow: hidden;
		isolation: isolate;
		pointer-events: none;
		background: #09090d;
	}

	.scene {
		position: absolute;
		inset: 0;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.transform-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 1200px;
		height: 608px;
		max-width: none;
		transform-origin: top left;
		will-change: transform;
	}

	.music-tint,
	.shade,
	.pill-shade,
	.opening-cover {
		position: absolute;
		inset: 0;
	}

	.opening-cover {
		z-index: 40;
		width: 100%;
		height: 100%;
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

	.pill-shade {
		background: linear-gradient(90deg, rgb(5 5 7 / 0.15), rgb(5 5 7 / 0.68));
	}

	.shade {
		/* Keep the full-height shade as the frame crops it, so the pill stays bright. */
		height: calc(100vh - 24px);
		background:
			linear-gradient(90deg, rgb(5 5 7 / 0.45), transparent 65%),
			linear-gradient(180deg, rgb(5 5 7 / 0.12) 15%, rgb(5 5 7 / 0.35) 45%, #050507 100%);
	}

	@media (max-width: 767px) {
		.scene {
			--artwork-x: 100%;
		}

		img {
			min-height: 700px;
		}

		.compact img {
			min-height: 0;
		}

		.shade {
			height: calc(100svh - 16px);
			background: linear-gradient(
				180deg,
				rgb(5 5 7 / 0.3),
				rgb(5 5 7 / 0.08) 28%,
				rgb(5 5 7 / 0.65) 58%,
				#050507 88%
			);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.music-tint {
			transition: none;
		}
	}
</style>
