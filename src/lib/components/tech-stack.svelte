<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { SourceCodeIcon, Settings01Icon, PaintBoardIcon } from '@hugeicons/core-free-icons';

	interface TechItem {
		name: string;
		category: 'frontend' | 'backend' | 'tools';
	}

	interface TechCategory {
		title: string;
		icon: any;
		technologies: TechItem[];
	}

	const techStack: TechCategory[] = [
		{
			title: 'Frontend',
			icon: PaintBoardIcon,
			technologies: [
				{ name: 'SvelteKit', category: 'frontend' },
				{ name: 'TypeScript', category: 'frontend' },
				{ name: 'Tailwind CSS', category: 'frontend' },
				{ name: 'React', category: 'frontend' }
			]
		},
		{
			title: 'Backend',
			icon: SourceCodeIcon,
			technologies: [
				{ name: 'Bun', category: 'backend' },
				{ name: 'PostgreSQL', category: 'backend' },
				{ name: 'REST APIs', category: 'backend' },
				{ name: 'WebSockets', category: 'backend' }
			]
		},
		{
			title: 'Tools',
			icon: Settings01Icon,
			technologies: [
				{ name: 'Docker', category: 'tools' },
				{ name: 'Vite', category: 'tools' },
				{ name: 'Cloudflare Workers', category: 'tools' }
			]
		}
	];

	let sectionContainer: HTMLElement | undefined = $state();
	let techCards: HTMLElement[] = [];

	onMount(() => {
		if (sectionContainer) {
			animate(
				sectionContainer,
				{ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
				{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }
			);
		}

		techCards.forEach((card, i) => {
			if (card) {
				animate(
					card,
					{ opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0)'] },
					{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }
				);
			}
		});
	});
</script>

<section bind:this={sectionContainer} class="space-y-6 opacity-0">
	<div class="space-y-2">
		<h2 class="text-2xl font-semibold tracking-tight">Tech Stack</h2>
		<p class="text-sm text-muted-foreground">
			Technologies I find myself most comfortable with while working on projects
		</p>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		{#each techStack as category, i}
			<div
				bind:this={techCards[i]}
				class="group relative overflow-hidden rounded-2xl bg-card p-6 opacity-0 transition-all duration-300"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
				></div>

				<div class="relative space-y-4">
					<div
						class="inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15"
					>
						<HugeiconsIcon icon={category.icon} size={20} />
					</div>

					<h3 class="text-base font-semibold tracking-tight text-foreground">
						{category.title}
					</h3>

					<div class="space-y-2">
						{#each category.technologies as tech}
							<div
								class="group/item rounded-lg bg-muted/50 px-3 py-2 text-left transition-all duration-200 hover:bg-accent hover:pl-4"
							>
								<span
									class="text-xs font-medium text-muted-foreground transition-colors duration-200 group-hover/item:text-accent-foreground"
								>
									{tech.name}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
