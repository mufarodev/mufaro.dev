<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { FolderLibraryIcon, Mail01Icon } from '@hugeicons/core-free-icons';

	let ctaCard: HTMLElement | undefined = $state();
	let floatingElements: HTMLElement[] = [];

	onMount(() => {
		if (ctaCard) {
			animate(
				ctaCard,
				{ opacity: [0, 1], transform: ['translateY(30px)', 'translateY(0px)'] },
				{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }
			);
		}

		floatingElements.forEach((el, i) => {
			if (el) {
				animate(
					el,
					{
						transform: [
							'translateY(-10px) rotate(-5deg)',
							'translateY(10px) rotate(5deg)',
							'translateY(-10px) rotate(-5deg)'
						]
					},
					{
						duration: 3 + i * 0.5,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: i * 0.2
					}
				);
			}
		});
	});
</script>

<section bind:this={ctaCard} class="opacity-0">
	<div
		class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 text-center"
	>
		<div class="absolute top-10 left-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>
		<div class="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl"></div>

		<div bind:this={floatingElements[0]} class="absolute top-16 left-16 text-primary/10">
			<HugeiconsIcon icon={FolderLibraryIcon} size={32} />
		</div>
		<div bind:this={floatingElements[1]} class="absolute right-16 bottom-16 text-primary/10">
			<HugeiconsIcon icon={Mail01Icon} size={32} />
		</div>

		<div class="relative space-y-5">
			<div class="space-y-2">
				<h2 class="text-3xl font-semibold tracking-tight">Want to chat? Hit me up</h2>
				<a
					href="mailto:hello@mufaro.dev"
					class="inline-block text-primary underline-offset-4 hover:underline"
				>
					hello@mufaro.dev
				</a>
			</div>
		</div>
	</div>
</section>
