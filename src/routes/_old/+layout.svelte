<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/caveat';
	import ProgressiveBlur from '$lib/components/core/progressive-blur.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ProgressiveBlur />

<div class="mx-auto min-h-svh max-w-4xl px-6 py-8 sm:px-8 lg:px-12">
	{@render children?.()}
</div>
