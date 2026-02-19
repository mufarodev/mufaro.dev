<script lang="ts">
</script>

<div class="pointer-events-none fixed inset-0 z-[9998] h-full w-full overflow-hidden">
	<!-- Vignette: Darken corners -->
	<div
		class="absolute inset-0 bg-radial-[circle_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%]"
	></div>

	<!-- Lens Blur -->
	<!-- We use mask-image to only apply the backdrop-filter to the edges -->
	<div
		class="absolute inset-0 backdrop-blur-[2px]"
		style="mask-image: radial-gradient(circle at center, transparent 60%, black 100%); -webkit-mask-image: radial-gradient(circle at center, transparent 60%, black 100%);"
	></div>

	<!-- Subtle chromatic fringe overlay image? For now, just the blur gives the 'lens' feel -->
</div>
