<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Github01Icon, Mail01Icon, XingIcon } from '@hugeicons/core-free-icons';

	let isExpanded = $state(false);
	let container: HTMLElement | undefined = $state();
	let statusDot: HTMLElement | undefined = $state();

	const socials = [
		{ icon: Github01Icon, label: 'GitHub', href: 'https://github.com/mufarodev' },
		{ icon: Mail01Icon, label: 'Email', href: 'mailto:hello@mufaro.dev' },
		{ icon: XingIcon, label: 'X / Twitter', href: 'https://twitter.com/mufarodev' }
	];

	onMount(() => {
		if (container) {
			animate(
				container,
				{ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
				{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }
			);
		}

		if (statusDot) {
			animate(
				statusDot,
				{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] },
				{ duration: 2, repeat: Infinity, ease: 'easeInOut' }
			);
		}
	});

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

<div
	bind:this={container}
	class="fixed right-6 bottom-6 z-50 opacity-0"
	role="group"
	aria-label="Contact and social links"
	onmouseenter={() => (isExpanded = true)}
	onmouseleave={() => (isExpanded = false)}
>
	<div
		class="relative flex items-center gap-2 rounded-full border border-border/50 bg-card/95 p-2 shadow-lg backdrop-blur-md transition-all duration-300 {isExpanded
			? 'pr-4'
			: ''}"
	>
		{#if isExpanded}
			<div class="flex items-center gap-1.5 overflow-hidden">
				{#each socials as social, i}
					<a
						href={social.href}
						target="_blank"
						rel="noopener noreferrer"
						class="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
						aria-label={social.label}
						style="animation: slideIn 0.3s ease-out {i * 0.05}s backwards"
					>
						<HugeiconsIcon icon={social.icon} size={18} />
					</a>
				{/each}
			</div>
		{/if}

		<button
			onclick={toggleExpanded}
			class="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-all duration-200 hover:bg-primary/20"
			aria-label="Toggle contact menu"
		>
			<div
				bind:this={statusDot}
				class="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-card"
			></div>
			<div class="text-xs font-bold text-primary">M</div>
		</button>
	</div>
</div>

<style>
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(10px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
