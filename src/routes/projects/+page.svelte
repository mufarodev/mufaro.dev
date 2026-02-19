<script lang="ts">
	import { accentColor } from '$lib/stores/hero-state';
	import FeaturedProjects from '$lib/components/featured-projects.svelte';
</script>

<div class="h-24"></div>

<div
	class="pointer-events-auto relative z-10 pt-8"
	style="--accent-r: {$accentColor.r}; --accent-g: {$accentColor.g}; --accent-b: {$accentColor.b};"
>
	<div class="flex w-full flex-col items-center px-8 py-12 md:px-24">
		<div class="w-full max-w-4xl text-left">
			<h2 class="mb-8 font-serif text-6xl text-white md:text-8xl">Projects</h2>

			<p class="mb-12 max-w-2xl text-xl leading-relaxed text-white/60">
				A collection of work I've done over the years.
			</p>

			<div class="space-y-8">
				<div class="rounded-xl border border-white/10 bg-white/5 p-8">
					<h3 class="mb-2 text-2xl font-medium text-white/90">Coming Soon</h3>
					<p class="text-white/50">Projects showcase is being built.</p>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="h-32"></div>
