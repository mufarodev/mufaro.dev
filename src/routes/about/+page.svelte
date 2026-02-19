<script lang="ts">
	import AboutSection from '$lib/components/sections/about-section.svelte';
	import { accentColor } from '$lib/stores/hero-state';
</script>

<div class="h-24"></div>

<div
	class="pointer-events-auto relative z-10 pt-8"
	style="--accent-r: {$accentColor.r}; --accent-g: {$accentColor.g}; --accent-b: {$accentColor.b};"
>
	<AboutSection />
</div>

<div class="h-32"></div>
