<script lang="ts">
	import { onMount } from 'svelte';

	let scrollY = $state(0);
	let innerHeight = $state(0);
	let scrollHeight = $state(0);

	function updateDimensions() {
		scrollHeight = document.documentElement.scrollHeight;
	}

	let progress = $derived.by(() => {
		if (!innerHeight || !scrollHeight) return 0;
		const maxScroll = scrollHeight - innerHeight;
		return maxScroll > 0 ? Math.min(100, Math.max(0, (scrollY / maxScroll) * 100)) : 0;
	});

	const markers = [0, 25, 50, 75, 100];

	onMount(() => {
		updateDimensions();
		const observer = new ResizeObserver(updateDimensions);
		observer.observe(document.body);
		return () => observer.disconnect();
	});
</script>

<svelte:window bind:scrollY bind:innerHeight onresize={updateDimensions} />

<div
	class="pointer-events-none fixed top-1/2 right-6 z-50 hidden -translate-y-1/2 flex-col items-end gap-1 mix-blend-difference md:flex"
>
	<div class="mb-2 h-[1px] w-4 bg-current opacity-50"></div>

	<div class="relative flex h-[300px] w-[2px] bg-white/10">
		<div
			class="absolute top-0 w-full bg-white transition-all duration-75 ease-out"
			style="height: {progress}%"
		>
			<div
				class="absolute right-0 bottom-0 h-1 w-3 bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]"
			></div>
		</div>

		{#each markers as marker}
			<div class="absolute -right-2 h-[1px] w-2 bg-white/30" style="top: {marker}%">
				<span class="absolute -top-[5px] right-3 font-mono text-[9px] opacity-40">
					{marker.toString().padStart(3, '0')}
				</span>
			</div>
		{/each}
	</div>

	<div class="mt-2 h-[1px] w-4 bg-current opacity-50"></div>

	<div class="mt-2 font-mono text-xs tracking-wider opacity-80">
		<span class="text-[9px] opacity-50">SCROLL</span>
		<br />
		{Math.floor(progress).toString().padStart(3, '0')}%
	</div>
</div>
