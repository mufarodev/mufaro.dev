<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/instrument-serif';
	import '@fontsource/caveat';
	import ProgressiveBlur from '$lib/components/core/progressive-blur.svelte';
	import FilmGrain from '$lib/components/core/film-grain.svelte';
	import ParallaxGrid from '$lib/components/core/parallax-grid.svelte';
	import LensDistortion from '$lib/components/core/lens-distortion.svelte';
	import SmoothScroll from '$lib/components/core/smooth-scroll.svelte';
	import PersistentHero from '$lib/components/persistent-hero.svelte';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- <ProgressiveBlur /> -->

<!-- Base background - near black with subtle noise texture -->
<div class="fixed inset-0 -z-10 bg-[#050508]">
	<!-- Very subtle top light falloff -->
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(255,255,255,0.03)_0%,_transparent_50%)]"
	></div>
	<!-- Noise texture overlay -->
	<div
		class="absolute inset-0 opacity-[0.02]"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E');"
	></div>
</div>

<ParallaxGrid />
<LensDistortion />
<FilmGrain />
<SmoothScroll />

<PersistentHero />

<div class="min-h-svh min-w-svw">
	{@render children?.()}
</div>
