<script lang="ts">
	import SoftButton from '$lib/components/shared/soft-button.svelte';
	import { uiPrefs } from '$lib/stores/ui-prefs.svelte';
	import { onMount } from 'svelte';

	const socials = [
		{ label: 'GitHub', href: 'https://github.com/mufarodev', icon: '→' },
		{ label: 'Email', href: 'mailto:hello@mufaro.dev', icon: '✉' }
	];

	let heroVisible = $state(false);

	onMount(() => {
		setTimeout(() => {
			heroVisible = true;
		}, 100);
	});

	function scrollToContact() {
		const element = document.getElementById('contact');
		if (element) {
			element.scrollIntoView({ behavior: uiPrefs.reducedMotion ? 'auto' : 'smooth' });
		}
	}

	function scrollToProjects() {
		const element = document.getElementById('projects');
		if (element) {
			element.scrollIntoView({ behavior: uiPrefs.reducedMotion ? 'auto' : 'smooth' });
		}
	}
</script>

<section
	id="hero"
	class="relative mx-auto flex min-h-[85vh] max-w-[1120px] flex-col items-center justify-center px-6 py-24 text-center sm:px-8"
>
	<div
		class="relative z-10 transition-all duration-500"
		style:opacity={heroVisible && !uiPrefs.reducedMotion ? 1 : heroVisible ? 1 : 0}
		style:transform={heroVisible && !uiPrefs.reducedMotion ? 'translateY(0)' : 'translateY(8px)'}
	>
		<p class="mb-4 text-sm text-muted-foreground">Hey, I'm</p>

		<h1 class="mb-6 font-display text-5xl font-normal tracking-tight sm:text-6xl lg:text-7xl">
			Mufaro Mukotami
		</h1>

		<p class="lead mx-auto mb-12 max-w-2xl text-muted-foreground">
			Full-stack developer crafting premium web experiences with modern tools. Focused on building
			products that matter.
		</p>

		<div class="mb-8 flex flex-wrap items-center justify-center gap-4">
			<SoftButton variant="primary" onclick={scrollToContact} withGlow>Get in Touch</SoftButton>
			<SoftButton variant="secondary" onclick={scrollToProjects}>View Projects</SoftButton>
		</div>

		<div class="flex items-center justify-center gap-6">
			{#each socials as social}
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					<span class="mr-1">{social.icon}</span>
					{social.label}
				</a>
			{/each}
		</div>

		<button
			onclick={() => {
				const element = document.getElementById('credibility');
				if (element) {
					element.scrollIntoView({ behavior: uiPrefs.reducedMotion ? 'auto' : 'smooth' });
				}
			}}
			class="label-text mt-16 inline-flex items-center gap-2 rounded-(--radius-chip) border border-border bg-muted/50 px-4 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			aria-label="Scroll down"
		>
			Scroll to explore
			<span class="text-xs">↓</span>
		</button>
	</div>

	<div
		class="absolute inset-0 -z-10 opacity-10"
		style="background: linear-gradient(transparent 0%, transparent 50%, var(--card) 100%), repeating-linear-gradient(0deg, transparent, transparent 2px, var(--border) 2px, var(--border) 3px), repeating-linear-gradient(90deg, transparent, transparent 2px, var(--border) 2px, var(--border) 3px);"
	></div>
</section>
