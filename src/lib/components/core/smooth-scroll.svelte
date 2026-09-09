<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ScrollSmoother } from 'gsap/dist/ScrollSmoother';

	afterNavigate(({ to }) => {
		const smoother = ScrollSmoother.get();
		if (!smoother) return;
		// Commit SvelteKit's restored position before resizing can clamp the old route's scroll.
		smoother.scrollTop(to?.scroll?.y ?? window.scrollY);
		ScrollTrigger.refresh();
	});

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		let smoother: ScrollSmoother;

		function setup() {
			const scrollY = window.scrollY;
			smoother?.kill();
			smoother = ScrollSmoother.create({
				wrapper: '#smooth-wrapper',
				content: '#smooth-content',
				smooth: motion.matches ? 0 : 0.75,
				effects: !motion.matches,
				// Smooth the content without a second wheel/touch input controller.
				normalizeScroll: false
			});
			ScrollTrigger.refresh();
			smoother.scrollTop(scrollY);
		}

		setup();
		motion.addEventListener('change', setup);

		return () => {
			motion.removeEventListener('change', setup);
			smoother.kill();
		};
	});
</script>
