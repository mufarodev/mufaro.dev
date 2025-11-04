<script lang="ts">
	import MatteCard from '$lib/components/shared/matte-card.svelte';
	import Chip from '$lib/components/shared/chip.svelte';
	import { uiPrefs } from '$lib/stores/ui-prefs.svelte';

	let {
		name,
		description,
		image,
		tech,
		liveUrl,
		githubUrl,
		featured = false
	}: {
		name: string;
		description: string;
		image: string;
		tech: string[];
		liveUrl?: string;
		githubUrl?: string;
		featured?: boolean;
	} = $props();

	let isHovered = $state(false);
</script>

<div
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	role="article"
>
	<MatteCard
		class="group relative transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-matte-hover)"
	>
		<div class="aspect-video w-full overflow-hidden bg-muted">
			<img
				src={image}
				alt={name}
				class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		</div>

		<div class="p-6">
			<h3 class="mb-2 text-xl font-semibold">{name}</h3>
			<p class="mb-4 text-sm text-muted-foreground">{description}</p>

			<div class="mb-4 flex flex-wrap gap-2">
				{#each tech as item}
					<Chip class="text-xs">{item}</Chip>
				{/each}
			</div>
		</div>

		{#if isHovered && (liveUrl || githubUrl)}
			<div
				class="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-4 border-t border-border bg-card/95 px-6 py-3 backdrop-blur-sm transition-all"
				style:transform={isHovered && !uiPrefs.reducedMotion ? 'translateY(0)' : 'translateY(100%)'}
				style:transition={!uiPrefs.reducedMotion ? 'transform 120ms ease-out' : 'none'}
			>
				{#if liveUrl}
					<a
						href={liveUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-accent transition-colors hover:text-accent/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						Live →
					</a>
				{/if}
				{#if githubUrl}
					<span class="text-muted-foreground">•</span>
					<a
						href={githubUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-accent transition-colors hover:text-accent/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						Repo →
					</a>
				{/if}
			</div>
		{/if}
	</MatteCard>
</div>
