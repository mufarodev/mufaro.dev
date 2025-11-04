<script lang="ts">
	import ProjectCard from '$lib/components/shared/project-card.svelte';

	const projects = [
		{
			name: 'Project Nova Website',
			description: 'Website for Project Nova, a private Fortnite server with thousands of users.',
			image: '/projects/nova-website.png',
			tech: ['Astro', 'TypeScript', 'Tailwind'],
			liveUrl: 'https://novafn.dev',
			githubUrl: 'https://github.com/ProjectNovaFN',
			featured: true
		},
		{
			name: 'Portfolio Website',
			description: 'Personal portfolio showcasing my work and experience.',
			image: '/projects/portfolio.png',
			tech: ['SvelteKit', 'TypeScript', 'Tailwind'],
			liveUrl: 'https://mufaro.dev',
			githubUrl: 'https://github.com/mufarodev/mufaro.dev'
		},
		{
			name: 'Nova Dashboard',
			description: 'Admin dashboard for managing Project Nova server infrastructure.',
			image: '/projects/nova-dashboard.png',
			tech: ['React', 'Next.js', 'TailwindCSS']
		}
	];
</script>

<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each projects as project}
		<ProjectCard {...project} />
	{/each}
</div>
