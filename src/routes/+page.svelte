<script lang="ts">
	import HomeExperienceSection from '../lib/components/sections/home-experience-section.svelte';
	import AboutSection from '../lib/components/sections/about-section.svelte';
	import { accentColor } from '../lib/stores/hero-state';
</script>

<div
	class="pointer-events-auto relative z-10 pt-36 md:pt-40"
	style="--accent-r: {$accentColor.r}; --accent-g: {$accentColor.g}; --accent-b: {$accentColor.b};"
>
	<HomeExperienceSection />
	<AboutSection showSocials={true} />
</div>
