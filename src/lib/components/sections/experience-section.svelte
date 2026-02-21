<script lang="ts">
	import ScrambleText from '$lib/components/core/scramble-text.svelte';

	type ExperienceEntry = {
		title: string;
		period: string;
		role: string;
		description: string;
		tags: string[];
		image?: string;
	};

	const entries: ExperienceEntry[] = [
		{
			title: 'Project Nova',
			period: '2023 - Present',
			role: 'Contributor & Frontend',
			description:
				'Contributed to the web ecosystem for Project Nova, rebuilding the frontend architecture and implementing modern design systems.',
			tags: ['Astro', 'TypeScript'],
			image: '/images/nova-website.png'
		},
		{
			title: 'Freelance',
			period: '2021 - 2023',
			role: 'Full Stack',
			description:
				'Delivered custom web solutions for clients, focusing on performance optimization and unique interactive experiences.',
			tags: ['React', 'Node.js']
		}
	];
</script>

<div class="flex w-full flex-col items-center px-8 py-12 md:px-24">
	<div class="w-full max-w-4xl text-left">
		<h2 class="mb-12 font-serif text-6xl text-white md:text-8xl">
			<ScrambleText text="Experience" />
		</h2>

		<div class="space-y-5">
			{#each entries as entry}
				<div
					class="group relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/22"
					style="min-height: 200px;"
				>
					<!-- Background image -->
					{#if entry.image}
						<img
							src={entry.image}
							alt=""
							aria-hidden="true"
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
						/>
					{/if}

					<!-- Dark scrim -->
					<div
						class="absolute inset-0"
						style="background: linear-gradient(to right, rgba(2,2,8,{entry.image
							? '0.72'
							: '0.20'}) 0%, rgba(2,2,8,0.88) 60%, rgba(2,2,8,0.97) 100%);"
					></div>

					<!-- Accent tint -->
					<div
						class="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						style="background: linear-gradient(115deg, rgba(var(--accent-r,136), var(--accent-g,153), var(--accent-b,170),0.08), transparent 50%);"
					></div>

					<!-- Fallback gradient when no image -->
					{#if !entry.image}
						<div
							class="absolute inset-0"
							style="background: radial-gradient(circle at 8% 20%, rgba(255,255,255,0.07), rgba(2,2,8,0.85) 70%);"
						></div>
					{/if}

					<!-- Content -->
					<div class="relative z-10 flex flex-col gap-3 p-7 md:p-9">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<h3
								class="font-serif text-2xl text-white/90 transition-colors duration-300 group-hover:text-white md:text-3xl"
							>
								<ScrambleText text={entry.title} scrambleSpeed={40} />
							</h3>
							<span
								class="rounded-full border border-white/12 bg-black/30 px-3 py-1 font-mono text-xs text-white/45"
							>
								{entry.period}
							</span>
						</div>

						<p
							class="font-mono text-xs tracking-[0.2em] uppercase"
							style="color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));"
						>
							{entry.role}
						</p>

						<p class="mt-1 max-w-2xl text-base leading-relaxed text-white/65">
							{entry.description}
						</p>

						<div class="mt-2 flex flex-wrap gap-2">
							{#each entry.tags as tag}
								<span
									class="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-xs text-white/45"
								>
									{tag}
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
