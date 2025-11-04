<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		withGrain = true,
		children
	}: {
		class?: string;
		withGrain?: boolean;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	class={cn(
		'relative overflow-hidden rounded-(--radius-card) border border-border bg-card',
		'shadow-[var(--shadow-matte-inner),var(--shadow-matte-keylight)]',
		'transition-all duration-150 ease-out',
		withGrain &&
			'before:pointer-events-none before:absolute before:inset-0 before:bg-[url(/grain.png)] before:bg-repeat before:opacity-(--grain-opacity-card) before:mix-blend-overlay',
		className
	)}
>
	{#if children}
		{@render children()}
	{/if}
</div>
