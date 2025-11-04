<script lang="ts">
	import { uiPrefs } from '$lib/stores/ui-prefs.svelte';
	import { cn } from '$lib/utils';

	const sections = [
		{ id: 'hero', label: 'About' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'contact', label: 'Contact' }
	];

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: uiPrefs.reducedMotion ? 'auto' : 'smooth' });
			uiPrefs.setActiveSection(sectionId);
		}
	}
</script>

<header class="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
	<div class="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-6 sm:px-8">
		<div class="flex items-center gap-2">
			<span class="font-display text-xl">m.</span>
		</div>

		<nav class="flex items-center gap-1 overflow-x-auto sm:gap-2" aria-label="Main navigation">
			{#each sections as section}
				<button
					onclick={() => scrollToSection(section.id)}
					class={cn(
						'relative rounded-(--radius-chip) px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-150',
						'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
						uiPrefs.activeSection === section.id
							? 'text-foreground after:absolute after:-bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent'
							: 'text-muted-foreground'
					)}
					aria-current={uiPrefs.activeSection === section.id ? 'page' : undefined}
				>
					{section.label}
				</button>
			{/each}
		</nav>

		<div class="flex items-center gap-2">
			<button
				onclick={() => uiPrefs.toggleMotion()}
				class="rounded-(--radius-chip) p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				aria-label="Toggle motion"
				title="Toggle animations"
			>
				{uiPrefs.reducedMotion ? '▶' : '⏸'}
			</button>

			<button
				onclick={() => uiPrefs.setNoiseIntensity(uiPrefs.noiseIntensity > 0 ? 0 : 0.09)}
				class="rounded-(--radius-chip) p-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				aria-label="Toggle grain noise"
				title="Toggle grain effect"
			>
				{uiPrefs.noiseIntensity > 0 ? '◆' : '◇'}
			</button>
		</div>
	</div>
</header>
