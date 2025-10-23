<script>
	import HeroSection from '$lib/components/hero-section.svelte';
	import FeaturedProjects from '$lib/components/featured-projects.svelte';
	import TechStack from '$lib/components/tech-stack.svelte';
	import CurrentStatus from '$lib/components/current-status.svelte';
	import ContactLinks from '$lib/components/contact-links.svelte';
	import CtaSection from '$lib/components/cta-section.svelte';
</script>

<div class="container mx-auto max-w-6xl space-y-12 px-4 py-6">
	<HeroSection />
	<FeaturedProjects />
	<!-- <TechStack /> -->
	<CurrentStatus />
	<ContactLinks />
	<!-- <CtaSection /> -->
</div>
