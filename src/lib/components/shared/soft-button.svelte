<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		class: className = '',
		variant = 'primary',
		href = undefined,
		onclick = undefined,
		type = 'button',
		withGlow = false,
		children
	}: {
		class?: string;
		variant?: 'primary' | 'secondary' | 'ghost';
		href?: string;
		onclick?: () => void;
		type?: 'button' | 'submit' | 'reset';
		withGlow?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	const Component = href ? 'a' : 'button';

	const baseStyles =
		'inline-flex items-center justify-center gap-2 rounded-(--radius-button) px-6 py-3 font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';

	const variantStyles = {
		primary:
			'bg-primary text-primary-foreground border border-primary/20 hover:-translate-y-0.5 hover:shadow-(--shadow-matte-hover) active:translate-y-0 active:shadow-(--shadow-matte-active)',
		secondary:
			'bg-card text-card-foreground border border-border hover:-translate-y-0.5 hover:shadow-(--shadow-matte-hover) active:translate-y-0 active:shadow-(--shadow-matte-active)',
		ghost:
			'bg-transparent text-foreground hover:bg-muted/50 hover:-translate-y-0.5 active:translate-y-0'
	};

	const glowStyles = withGlow ? 'shadow-[0_0_20px_rgba(var(--primary),0.3)]' : '';
</script>

<svelte:element
	this={Component}
	{href}
	{type}
	{onclick}
	role="button"
	tabindex="0"
	class={cn(baseStyles, variantStyles[variant], glowStyles, className)}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
