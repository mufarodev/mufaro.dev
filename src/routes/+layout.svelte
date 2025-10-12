<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from "mode-watcher";
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource-variable/doto/rond.css';

	let { children } = $props();
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-svh mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4">
	{@render children?.()}
</div>
