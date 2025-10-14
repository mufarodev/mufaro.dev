<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/doto/rond.css';
	import '@fontsource-variable/google-sans-code';
	import '@fontsource/gloria-hallelujah';
	import '@fontsource-variable/source-serif-4';

	let { children } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mx-auto min-h-svh max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
	{@render children?.()}
</div>
