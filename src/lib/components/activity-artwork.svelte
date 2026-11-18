<script lang="ts">
	import { untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { GameController03Icon, MusicNote01Icon } from '@hugeicons/core-free-icons';

	let { image, music }: { image: string | null; music: boolean } = $props();
	type Cover = { image: string | null; music: boolean };
	// The first cover is server-rendered, so hydration doesn't flash a placeholder icon.
	let covers = $state<[Cover, Cover]>([
		untrack(() => ({ image, music })),
		{ image: null, music: untrack(() => music) }
	]);
	let current = $state(0);

	$effect(() => {
		const next = { image, music };
		const shown = untrack(() => covers[current]);
		if (shown.image === next.image && shown.music === next.music) return;
		let cancelled = false;
		const preload = new Image();
		function reveal(image: string | null) {
			if (cancelled) return;
			const target = 1 - current;
			covers[target] = { ...next, image };
			current = target;
		}
		// Keep the previous cover visible until the replacement has decoded.
		if (image) {
			preload.src = image;
			preload.decode().then(
				() => reveal(next.image),
				() => reveal(null)
			);
		} else {
			untrack(() => reveal(null));
		}
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="cover-swap t-icon-swap" data-state={current === 0 ? 'a' : 'b'} aria-hidden="true">
	{#each covers as cover, index (index)}
		<div class="cover t-icon" data-icon={index === 0 ? 'a' : 'b'}>
			{#if cover.image}
				<img src={cover.image} alt="" width="80" height="80" />
			{:else}
				<HugeiconsIcon icon={cover.music ? MusicNote01Icon : GameController03Icon} size={28} />
			{/if}
		</div>
	{/each}
</div>

<style>
	.cover-swap {
		--icon-swap-start-scale: 0.96;
		width: 100%;
		height: 100%;
	}
	.cover {
		display: grid;
		place-items: center;
		min-width: 0;
		min-height: 0;
	}
	.cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
