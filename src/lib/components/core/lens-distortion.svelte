<script lang="ts">
</script>

<div class="pointer-events-none fixed inset-0 z-[9998] h-full w-full overflow-hidden">
	<div
		class="absolute inset-0 bg-radial-[circle_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%]"
	></div>

	<!-- split into 4 thin edge strips instead of one full-screen blurred layer.
	     Each strip only covers ~15% of each edge, so the compositor only samples those pixels
	     rather than the entire viewport. -->
	<div
		class="absolute top-0 right-0 left-0 h-[10%] "
		style="mask-image: linear-gradient(to bottom, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);"
	></div>
	<div
		class="absolute right-0 bottom-0 left-0 h-[10%] "
		style="mask-image: linear-gradient(to top, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, black 0%, transparent 100%);"
	></div>
	<div
		class="absolute top-0 bottom-0 left-0 w-[10%] "
		style="mask-image: linear-gradient(to right, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 0%, transparent 100%);"
	></div>
	<div
		class="absolute top-0 right-0 bottom-0 w-[10%]"
		style="mask-image: linear-gradient(to left, black 0%, transparent 100%); -webkit-mask-image: linear-gradient(to left, black 0%, transparent 100%);"
	></div>
</div>
