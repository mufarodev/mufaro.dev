<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import AnimatedLiquidBackground from './core/animated-liquid-background.svelte';
	import DiscordStatusMorphable from './discord-status-morphable.svelte';
	import {
		accentColor,
		morphProgress as morphProgressStore,
		heroScrollLocked
	} from '$lib/stores/hero-state';

	let currentColor = $state({ r: 136, g: 153, b: 170 });

	let plasmaColor1 = $derived(
		`rgb(${Math.round(currentColor.r * 0.8)}, ${Math.round(currentColor.g * 0.8)}, ${Math.round(currentColor.b * 0.8)})`
	);
	let plasmaColor2 = $derived(
		`rgb(${Math.round(currentColor.r * 0.5)}, ${Math.round(currentColor.g * 0.5)}, ${Math.round(currentColor.b * 0.5)})`
	);
	let plasmaColor3 = $derived(
		`rgb(${Math.round(currentColor.r * 0.3)}, ${Math.round(currentColor.g * 0.3)}, ${Math.round(currentColor.b * 0.3)})`
	);

	let accentColorCss = $derived(
		`--accent-r: ${currentColor.r}; --accent-g: ${currentColor.g}; --accent-b: ${currentColor.b};`
	);
	let isHomePage = $derived($page.url.pathname === '/');
	let isAnchored = $state($page.url.pathname !== '/');

	function handleAccentColorChange(color: { r: number; g: number; b: number } | null) {
		if (!color) return;
		currentColor.r = color.r;
		currentColor.g = color.g;
		currentColor.b = color.b;
		accentColor.set({ r: color.r, g: color.g, b: color.b });
	}

	function setAnchored(anchored: boolean) {
		isAnchored = anchored;
		morphProgressStore.set(anchored ? 1 : 0);
	}

	onMount(() => {
		let rafId: number | null = null;

		function updateAnchor() {
			rafId = null;
			const heroHeight = window.innerHeight;
			const threshold = heroHeight - 84;
			setAnchored(window.scrollY >= threshold);
		}

		function onScroll() {
			if (rafId !== null) return;
			rafId = requestAnimationFrame(updateAnchor);
		}

		window.addEventListener('scroll', onScroll, { passive: true });

		updateAnchor();

		return () => {
			window.removeEventListener('scroll', onScroll);
			if (rafId !== null) cancelAnimationFrame(rafId);
			morphProgressStore.set(0);
			heroScrollLocked.set(false);
		};
	});
</script>

<div
	class="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-hidden"
	style={accentColorCss}
	aria-hidden="true"
>
	<div
		class="absolute inset-0 -z-10 transition-colors duration-1000"
		style="background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba({currentColor.r},{currentColor.g},{currentColor.b},0.06) 0%, transparent 50%);"
	></div>
</div>

<div
	class="mobile-pill-anchor pointer-events-auto"
	class:is-anchored={isAnchored}
	style={accentColorCss}
	aria-hidden={!isAnchored}
>
	<div class="mobile-pill-inner overflow-hidden bg-[#050507] shadow-2xl">
		<div class="pointer-events-none absolute inset-0 opacity-80">
			<AnimatedLiquidBackground
				color1={plasmaColor1}
				color2={plasmaColor2}
				color3={plasmaColor3}
				speed={15}
			/>
			<div class="absolute inset-0 bg-black/40"></div>
		</div>

		<div class="pointer-events-none absolute inset-0 flex items-center">
			<div
				class="pointer-events-none absolute"
				style="width: 72px; left: -10px; top: 60%; transform: translateY(-50%);"
			>
				<img
					src="/images/sparkle.webp"
					alt=""
					class="w-full opacity-60"
					style="mask-image: radial-gradient(circle closest-side, black 30%, transparent 100%); -webkit-mask-image: radial-gradient(circle closest-side, black 30%, transparent 100%);"
				/>
			</div>

			<span
				class="pill-name absolute left-5 font-serif leading-none font-medium tracking-tight"
				style="color: rgba(255, 255, 255, 0.8); mix-blend-mode: color-dodge; filter: brightness(0.9);"
				>Mufaro</span
			>

			<div class="pill-discord-container pointer-events-auto absolute right-2.5">
				<DiscordStatusMorphable onAccentColorChange={handleAccentColorChange} morphProgress={1} />
			</div>
		</div>
	</div>
</div>

{#if isHomePage}
	<section
		class="mobile-hero-section pointer-events-none relative w-full overflow-hidden"
		style={accentColorCss}
		aria-label="Hero section"
	>
		<div
			class="mobile-hero-card pointer-events-auto absolute inset-x-2 top-2 bottom-2 overflow-hidden rounded-2xl bg-[#050507] shadow-2xl"
		>
			<div class="pointer-events-none absolute inset-0 opacity-80">
				<AnimatedLiquidBackground
					color1={plasmaColor1}
					color2={plasmaColor2}
					color3={plasmaColor3}
					speed={15}
				/>
				<div class="absolute inset-0 bg-black/40"></div>
			</div>

			<div class="pointer-events-none relative h-full w-full">
				<div
					class="pointer-events-none absolute origin-bottom-left"
					style="width: clamp(400px, 90vw, 660px); left: -100px; bottom: 28%;"
				>
					<img
						src="/images/sparkle.webp"
						alt="Sparkle"
						class="w-full drop-shadow-2xl"
						style="mask-image: radial-gradient(circle closest-side, black 40%, transparent 100%); -webkit-mask-image: radial-gradient(circle closest-side, black 40%, transparent 100%);"
					/>
				</div>

				<div
					class="absolute right-5 bottom-48 left-5 z-10 origin-bottom-left"
					style="bottom: clamp(11.5rem, 26vh, 15rem);"
				>
					<h2 class="font-serif text-5xl leading-[0.9] font-medium tracking-tight text-white/50">
						Hello, I'm <br />
					</h2>
				</div>

				<h1
					class="absolute right-5 left-5 z-10 origin-bottom-left font-serif leading-[0.9] font-medium tracking-tight"
					style="font-size: clamp(68px, 17vw, 80px); bottom: clamp(7.5rem, 19vh, 10rem); color: rgba(255, 255, 255, 0.8); mix-blend-mode: color-dodge; filter: brightness(0.8)"
				>
					Mufaro
				</h1>

				<div
					class="absolute right-5 left-5 z-10"
					style="bottom: max(calc(env(safe-area-inset-bottom) + 3.25rem), 4.25rem);"
				>
					<p
						class="text-[0.95rem] leading-relaxed text-white/80"
						style="max-width: min(92vw, 30rem); text-wrap: pretty;"
					>
						I'm an 18 year old from Poland who makes software, reverse engineers, plays games and is
						passionate about learning new things.
					</p>
				</div>

				<div
					class="pointer-events-auto absolute z-20 origin-top-right"
					style="top: 20px; right: calc(50% - min(80vw, 320px) / 2);"
				>
					<DiscordStatusMorphable onAccentColorChange={handleAccentColorChange} morphProgress={0} />
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.mobile-hero-section {
		height: 100svh;
		min-height: 100svh;
	}

	.mobile-pill-anchor {
		position: fixed;
		top: 12px;
		left: 50%;
		transform: translateX(-50%) translateY(-120%);
		z-index: 50;
		width: calc(100vw - 20px);
		opacity: 0;
		transition:
			transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.25s ease;
		pointer-events: none;
	}

	.mobile-pill-anchor.is-anchored {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	.mobile-pill-inner {
		position: relative;
		width: 100%;
		height: 72px;
		border-radius: 36px;
		overflow: hidden;
	}

	.pill-name {
		font-size: 24px;
		z-index: 20;
	}

	.pill-discord-container {
		z-index: 20;
		top: 50%;
		transform: translateY(-50%);
	}

	.pill-discord-container :global(.morph-container) {
		display: block;
	}
</style>
