<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Github01Icon, Linkedin02Icon, Mail01Icon, XingIcon } from '@hugeicons/core-free-icons';

	interface ContactLink {
		name: string;
		icon: any;
		url: string;
		color: string;
	}

	const contacts: ContactLink[] = [
		{
			name: 'GitHub',
			icon: Github01Icon,
			url: 'https://github.com/mufarodev',
			color: 'hover:bg-[#333] hover:text-white'
		},
		{
			name: 'Email',
			icon: Mail01Icon,
			url: 'mailto:hello@mufaro.dev',
			color: 'hover:bg-primary hover:text-primary-foreground'
		},
		{
			name: 'X / Twitter',
			icon: XingIcon,
			url: 'https://twitter.com/mufarodev',
			color: 'hover:bg-[#000] hover:text-white'
		}
	];

	let contactButtons: HTMLElement[] = [];

	onMount(() => {
		contactButtons.forEach((button, i) => {
			if (button) {
				animate(
					button,
					{ opacity: [0, 1], transform: ['translateX(-10px)', 'translateX(0px)'] },
					{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }
				);
			}
		});
	});
</script>

<section class="space-y-4">
	<div class="space-y-1">
		<h2 class="text-2xl font-bold">Contact</h2>
		<p class="text-sm text-muted-foreground">You can find me on these platforms</p>
	</div>

	<div class="flex flex-wrap gap-2">
		{#each contacts as contact, i}
			<a
				bind:this={contactButtons[i]}
				href={contact.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-medium transition-colors {contact.color}"
			>
				<HugeiconsIcon icon={contact.icon} size={18} />
				<span>{contact.name}</span>
			</a>
		{/each}
	</div>
</section>
