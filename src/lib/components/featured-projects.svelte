<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { StarIcon, ArrowUpRight02Icon, Github01Icon } from '@hugeicons/core-free-icons';

	interface Project {
		name: string;
		description: string;
		image: string;
		stars: number | undefined;
		tech: string[];
		liveUrl?: string;
		githubUrl?: string;
	}

	const projects: Project[] = [
		{
			name: 'Project Nova Website',
			description: 'Website for Project Nova, a private Fortnite server.',
			image: '/images/nova-website.png',
			stars: undefined,
			tech: ['Astro', 'TypeScript', 'Tailwind'],
			liveUrl: 'https://novafn.dev',
			githubUrl: 'https://github.com/ProjectNovaFN'
		}
	];

	let projectCards: HTMLElement[] = $state([]);
	let hoveredIndex = $state<number | null>(null);

	onMount(() => {
		projectCards.forEach((card, i) => {
			if (card) {
				animate(
					card,
					{ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0px)'] },
					{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
				);
			}
		});
	});

	function handleMouseEnter(index: number, card: HTMLElement) {
		hoveredIndex = index;
		const borders = card.querySelectorAll('.corner-border');
		animate(
			borders as unknown as HTMLElement[],
			{ opacity: [0, 1] },
			{ duration: 0.3, ease: 'easeOut' }
		);
	}

	function handleMouseMove(e: MouseEvent, card: HTMLElement) {
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		
		const rotateX = ((y - centerY) / centerY) * -3; // Subtle tilt
		const rotateY = ((x - centerX) / centerX) * 3;
		
		card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
	}

	function handleMouseLeave(index: number, card: HTMLElement) {
		hoveredIndex = null;
		
		// Reset transform
		card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

		const borders = card.querySelectorAll('.corner-border');
		animate(
			borders as unknown as HTMLElement[],
			{ opacity: [1, 0] },
			{ duration: 0.2, ease: 'easeIn' }
		);
	}
</script>

<section class="space-y-6">
	<div class="space-y-2">
		<h2 class="text-3xl font-bold">Featured Projects</h2>
		<p class="text-muted-foreground">Some things I've built recently</p>
	</div>

	<div class="perspective-1000">
		{#each projects as project, i}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				bind:this={projectCards[i]}
				onmouseenter={(e) => handleMouseEnter(i, e.currentTarget)}
				onmouseleave={(e) => handleMouseLeave(i, e.currentTarget)}
				onmousemove={(e) => handleMouseMove(e, e.currentTarget)}
				class="group relative rounded-3xl bg-card p-6 opacity-0 transition-all duration-200 ease-out will-change-transform"
				style="transform-style: preserve-3d;"
			>
				<!-- Technical ID Decal -->
				<div class="absolute right-6 top-6 font-mono text-[10px] text-white/20 opacity-0 transition-opacity group-hover:opacity-100">
					PRJ-{String(i + 1).padStart(3, '0')} // {project.tech[0].toUpperCase()}
				</div>

				<!-- Dashed border that appears on hover -->
				<div
					class="corner-border pointer-events-none absolute inset-0 z-10 -m-px rounded-3xl border-4 border-dashed border-white/15 opacity-0"
				></div>

				<!-- Corner brackets (solid borders on top) -->
				<div
					class="corner-border pointer-events-none absolute -top-px -left-px z-20 h-8 w-8 rounded-tl-3xl border-t-4 border-l-4 border-white/90 opacity-0"
				></div>
				<div
					class="corner-border pointer-events-none absolute -top-px -right-px z-20 h-8 w-8 rounded-tr-3xl border-t-4 border-r-4 border-white/90 opacity-0"
				></div>
				<div
					class="corner-border pointer-events-none absolute -bottom-px -left-px z-20 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-white/90 opacity-0"
				></div>
				<div
					class="corner-border pointer-events-none absolute -right-px -bottom-px z-20 h-8 w-8 rounded-br-3xl border-r-4 border-b-4 border-white/90 opacity-0"
				></div>

				<div class="relative space-y-4">
					<div
						class="aspect-video w-full overflow-hidden rounded-2xl bg-muted/50 ring-1 ring-border/50"
					>
						<img
							src={project.image}
							alt={project.name}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					</div>

					<div class="space-y-3">
						<div class="flex items-start justify-between gap-2">
							<h3 class=" text-xl font-bold">{project.name}</h3>
							{#if project.stars}
								<div class="flex items-center gap-1 text-sm text-muted-foreground">
									<HugeiconsIcon icon={StarIcon} size={16} color="yellow" />
									<span>{project.stars}</span>
								</div>
							{/if}
						</div>

						<p class="text-sm leading-relaxed text-muted-foreground">
							{project.description}
						</p>

						<div class="flex flex-wrap gap-2">
							{#each project.tech as tech}
								<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
									{tech}
								</span>
							{/each}
						</div>

						<div class="flex items-center gap-3 pt-2">
							{#if project.liveUrl}
								<a
									href={project.liveUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
								>
									<span>Live Project</span>
									<HugeiconsIcon icon={ArrowUpRight02Icon} size={16} />
								</a>
							{/if}
							{#if project.githubUrl}
								<a
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
								>
									<HugeiconsIcon icon={Github01Icon} size={16} />
									<span>Repo</span>
								</a>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
