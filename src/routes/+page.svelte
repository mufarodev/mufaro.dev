<script lang="ts">
	import HeroMinimal from '$lib/components/hero-minimal.svelte';
	import CredibilityStrip from '$lib/components/credibility-strip.svelte';
	import TimelineRail from '$lib/components/timeline-rail.svelte';
	import ProjectsGrid from '$lib/components/projects-grid.svelte';
	import ActivityPanel from '$lib/components/activity-panel.svelte';
	import ContactFooter from '$lib/components/contact-footer.svelte';
</script>

<main>
	<HeroMinimal />

	<div id="credibility">
		<CredibilityStrip />
	</div>

	<TimelineRail />

	<div id="projects" class="mx-auto max-w-[1120px] px-6 py-16 sm:px-8">
		<h2 class="mb-12 text-center font-display text-3xl sm:text-4xl">Featured Work</h2>
		<ProjectsGrid />
	</div>

	<div id="activity" class="mx-auto max-w-[1120px] px-6 py-16 sm:px-8">
		<h2 class="mb-12 text-center font-display text-3xl sm:text-4xl">Current Activity</h2>
		<ActivityPanel />
	</div>

	<ContactFooter />
</main>
