<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/caveat';
	import '@fontsource/instrument-serif';
	import HeaderBar from '$lib/components/header-bar.svelte';
	import GrainCanvas from '$lib/components/shared/grain-canvas.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative min-h-svh bg-background text-foreground">
	<GrainCanvas />
	<HeaderBar />
	{@render children?.()}
</div>
