<script lang="ts">
	import Chip from '$lib/components/shared/chip.svelte';
	import { uiPrefs } from '$lib/stores/ui-prefs.svelte';

	type Milestone = {
		id: string;
		period: string;
		title: string;
		description: string;
		link?: { text: string; href: string };
	};

	const milestones: Milestone[] = [
		{
			id: '1',
			period: '2020',
			title: 'Started Self-Teaching',
			description:
				'Began learning web development through online resources, focusing on JavaScript and modern frameworks.'
		},
		{
			id: '2',
			period: '2022',
			title: 'Freelance Work',
			description:
				'Started taking on freelance projects, building websites and web applications for various clients.'
		},
		{
			id: '3',
			period: '2024',
			title: 'Project Nova',
			description:
				'Led development of Project Nova, a large-scale community platform serving thousands of users.',
			link: { text: 'Learn more', href: '#projects' }
		},
		{
			id: '4',
			period: 'Now',
			title: 'Open to Opportunities',
			description:
				'Actively seeking full-time roles where I can contribute to meaningful products and grow with a team.'
		}
	];

	let expandedId = $state<string | null>(null);

	function toggleMilestone(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<section id="timeline" class="mx-auto max-w-[1120px] px-6 py-16 sm:px-8">
	<h2 class="mb-12 text-center font-display text-3xl sm:text-4xl">Journey</h2>

	<div class="relative mx-auto max-w-3xl">
		<div class="absolute top-0 bottom-0 left-8 w-px bg-border sm:left-1/2"></div>

		<div class="space-y-8">
			{#each milestones as milestone, i}
				<div
					class="relative transition-all duration-300"
					style:opacity={!uiPrefs.reducedMotion ? 1 : 1}
					style:transition-delay={!uiPrefs.reducedMotion ? `${i * 80}ms` : '0ms'}
				>
					<div class="flex items-start gap-4 sm:gap-8">
						<div class="flex w-24 shrink-0 justify-end sm:w-1/2">
							<span class="label-text hidden text-right text-muted-foreground sm:block">
								{milestone.period}
							</span>
						</div>

						<div
							class="absolute left-8 z-10 -translate-x-1/2 sm:left-1/2"
							class:scale-125={expandedId === milestone.id}
							style="transition: transform 150ms ease-out"
						>
							<div class="size-2 rounded-full bg-accent ring-4 ring-background"></div>
						</div>

						<div class="flex-1 sm:w-1/2">
							<button
								onclick={() => toggleMilestone(milestone.id)}
								class="group w-full text-left transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
								aria-expanded={expandedId === milestone.id}
								aria-controls={`milestone-${milestone.id}`}
							>
								<div
									class="rounded-(--radius-card) border border-border bg-card p-4 transition-all duration-200 hover:shadow-(--shadow-matte-hover) sm:p-6"
								>
									<div class="mb-2 flex items-center justify-between gap-4">
										<h3 class="font-semibold text-foreground">{milestone.title}</h3>
										<span class="label-text text-muted-foreground sm:hidden">
											{milestone.period}
										</span>
									</div>

									{#if expandedId === milestone.id}
										<div
											id={`milestone-${milestone.id}`}
											class="mt-3 border-t border-border pt-3 transition-opacity duration-200"
											style:opacity={expandedId === milestone.id ? 1 : 0}
										>
											<p class="mb-3 text-sm text-muted-foreground">
												{milestone.description}
											</p>
											{#if milestone.link}
												<a
													href={milestone.link.href}
													class="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent/80"
												>
													{milestone.link.text}
													<span>→</span>
												</a>
											{/if}
										</div>
									{/if}
								</div>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
