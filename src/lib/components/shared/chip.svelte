<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		href = undefined,
		onclick = undefined,
		children
	}: {
		class?: string;
		href?: string;
		onclick?: () => void;
		children?: import('svelte').Snippet;
	} = $props();

	const isInteractive = href || onclick;
	const Component = href ? 'a' : 'button';
</script>

{#if isInteractive}
	<svelte:element
		this={Component}
		{href}
		{onclick}
		role="button"
		tabindex="0"
		class={cn(
			'label-text inline-flex items-center gap-1.5 rounded-(--radius-chip) border border-border bg-muted px-3 py-1.5',
			'transition-all duration-120 ease-out',
			'hover:-translate-y-0.5 hover:shadow-(--shadow-matte-hover)',
			'active:translate-y-0 active:shadow-(--shadow-matte-active)',
			'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</svelte:element>
{:else}
	<span
		class={cn(
			'label-text inline-flex items-center gap-1.5 rounded-(--radius-chip) border border-border bg-muted px-3 py-1.5',
			className
		)}
	>
		{#if children}
			{@render children()}
		{/if}
	</span>
{/if}
