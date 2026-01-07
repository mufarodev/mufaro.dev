<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/jetbrains-mono';
	import '@fontsource/instrument-serif';
	import '@fontsource/caveat';
	import ProgressiveBlur from '$lib/components/core/progressive-blur.svelte';

	let { children } = $props();
</script>

<ModeWatcher defaultMode="dark" />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ProgressiveBlur />

<div class="min-h-svh min-w-svw">
	{@render children?.()}
</div>
