<script lang="ts">
	import Chip from '$lib/components/shared/chip.svelte';

	const stats = [
		{ label: 'Years Experience', value: '5+', icon: '📅' },
		{ label: 'Projects Shipped', value: '30+', icon: '🚀' },
		{ label: 'OSS Contributions', value: '100+', icon: '💻' }
	];
</script>

<section class="flex items-center justify-center gap-3 py-8 sm:gap-4">
	{#each stats as stat, i}
		<div class="flex items-center gap-3 sm:gap-4">
			<Chip class="group relative">
				<span class="text-xs opacity-70">{stat.icon}</span>
				<span class="font-mono text-sm font-semibold tabular-nums">{stat.value}</span>
				<span class="sr-only">{stat.label}</span>
				<span
					class="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-md bg-card px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
				>
					{stat.label}
				</span>
			</Chip>

			{#if i < stats.length - 1}
				<div class="flex items-center gap-1">
					<div class="h-px w-4 bg-border sm:w-6"></div>
					<div class="size-1 rounded-full bg-accent"></div>
					<div class="h-px w-4 bg-border sm:w-6"></div>
				</div>
			{/if}
		</div>
	{/each}
</section>
