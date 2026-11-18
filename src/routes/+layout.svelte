<script lang="ts">
	import '../app.css';
	import '$lib/styles/transitions.css';
	import { ModeWatcher } from 'mode-watcher';
	// The rond build carries the roundness axis the greeting uses, on top of weight.
	import '@fontsource-variable/google-sans-flex/rond.css';
	import '@fontsource-variable/doto';
	import sansFont from '@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-rond-normal.woff2?url';
	import dotoFont from '@fontsource-variable/doto/files/doto-latin-wght-normal.woff2?url';
	import { initLanyard } from '$lib/stores/lanyard.svelte';

	initLanyard();

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<title>Mufaro</title>
	<link rel="icon" type="image/x-icon" href="/images/embed.webp" />
	<!-- Fetched alongside the HTML so text doesn't reflow when the web font swaps in. -->
	<link rel="preload" as="font" type="font/woff2" href={sansFont} crossorigin="anonymous" />
	<link rel="preload" as="font" type="font/woff2" href={dotoFont} crossorigin="anonymous" />
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

{@render children?.()}
