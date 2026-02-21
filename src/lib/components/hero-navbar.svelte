<script lang="ts">
	import { page } from '$app/stores';

	const navItems = [
		{ label: 'Home', href: '/' },
		// { label: 'Experience', href: '/experience' },
		// { label: 'Projects', href: '/projects' },
		// { label: 'About', href: '/about' }
	];

	let currentPath = $derived($page.url.pathname);

	function isActive(href: string) {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}
</script>

<nav class="flex items-center justify-center gap-0.5 sm:gap-1">
	{#each navItems as item}
		<a
			href={item.href}
			class="group relative px-2.5 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm"
			class:active={isActive(item.href)}
		>
			<span
				class="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/10"
				class:bg-white-5={isActive(item.href)}
			></span>

			<span
				class="relative z-10 tracking-wide transition-colors duration-300"
				class:text-white={isActive(item.href)}
				class:text-white-50={!isActive(item.href)}
			>
				{item.label}
			</span>

			{#if isActive(item.href)}
				<span class="absolute bottom-0 left-1/2 h-px w-4 -translate-x-1/2 bg-white/60 sm:w-6"
				></span>
			{/if}
		</a>
	{/each}
</nav>

<style>
	.bg-white-5 {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.text-white-50 {
		color: rgba(255, 255, 255, 0.5);
	}

	.text-white-50:hover {
		color: rgba(255, 255, 255, 0.8);
	}
</style>
