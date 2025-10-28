<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Layers01Icon } from '@hugeicons/core-free-icons';
	import DiscordStatus from './discord-status.svelte';

	let statusCard: HTMLElement | undefined = $state();
	let mainCard: HTMLElement | undefined = $state();
	let discordCard: HTMLElement | undefined = $state();
	let activityCard: HTMLElement | undefined = $state();

	onMount(() => {
		if (statusCard) {
			animate(
				statusCard,
				{ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
				{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }
			);
		}

		if (mainCard) {
			animate(
				mainCard,
				{ opacity: [0, 1], transform: ['scale(0.98)', 'scale(1)'] },
				{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
			);
		}

		if (discordCard) {
			animate(
				discordCard,
				{ opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
				{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }
			);
		}

		if (activityCard) {
			animate(
				activityCard,
				{ opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
				{ duration: 0.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }
			);
		}
	});
</script>

<section bind:this={statusCard} class="opacity-0">
	<div bind:this={mainCard} class="relative overflow-hidden rounded-2xl bg-card p-6 opacity-0">
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent"
		></div>

		<div class="relative space-y-5">
			<div class="space-y-2">
				<h2 class="text-2xl font-semibold tracking-tight">What I'm up to</h2>
				<p class="text-sm text-muted-foreground">Currently working on</p>
			</div>

			<div class="grid gap-3 sm:grid-cols-2">
				<div bind:this={discordCard} class="opacity-0">
					<DiscordStatus />
				</div>

				<div
					bind:this={activityCard}
					class="group space-y-3 rounded-xl bg-muted/30 p-4 opacity-0 transition-all duration-300 hover:bg-muted/50"
				>
					<div
						class="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15"
					>
						<HugeiconsIcon icon={Layers01Icon} size={18} />
					</div>

					<div class="space-y-1.5">
						<h3 class="text-sm font-semibold tracking-tight text-foreground">Currently</h3>
						<p class="text-xs leading-relaxed text-muted-foreground">Something!</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
