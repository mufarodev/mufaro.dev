<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { ModeWatcher } from 'mode-watcher';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/google-sans-flex';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/instrument-serif';
	import '@fontsource/caveat';
	import SmoothScroll from '$lib/components/core/smooth-scroll.svelte';
	import PersistentHero from '$lib/components/persistent-hero.svelte';
	import MobileHero from '$lib/components/mobile-hero.svelte';
	import { initLanyard } from '$lib/stores/lanyard.svelte';

	initLanyard();

	let { children } = $props();

	let isMobile = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(max-width: 767px)');
		isMobile = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<title>Mufaro</title>
	<link rel="icon" type="image/x-icon" href="/images/embed.webp" />
	<meta name="description" content="18 year old software & reverse engineer from Poland" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Mufaro" />
	<meta property="og:description" content="18 year old software & reverse engineer from Poland" />
	<meta property="og:image" content="/images/embed.webp" />
	<meta property="og:image:type" content="image/webp" />
	<meta property="og:image:alt" content="Preview image for Mufaro's website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Mufaro" />
	<meta name="twitter:description" content="18 year old software & reverse engineer from Poland" />
	<meta name="twitter:image" content="/images/embed.webp" />
</svelte:head>

<div class="fixed inset-0 -z-10 bg-[#050508]">
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(255,255,255,0.03)_0%,_transparent_50%)]"
	></div>
	<div
		class="absolute inset-0 opacity-[0.02]"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.8%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E');"
	></div>
</div>

<SmoothScroll />

{#if !isMobile}
	<PersistentHero />
{/if}

<div id="smooth-wrapper">
	<div id="smooth-content">
		{#if isMobile}
			<MobileHero />
		{/if}

		<div class="min-h-svh min-w-svw">
			{@render children?.()}
		</div>
	</div>
</div>
