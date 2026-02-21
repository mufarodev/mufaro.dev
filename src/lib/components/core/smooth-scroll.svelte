<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
	import Lenis from 'lenis';
	import { heroScrollLocked } from '$lib/stores/hero-state';

	onMount(() => {
		// Register all GSAP plugins once here — this component is mounted in the root
		// layout so it always runs before any page-level component needs these plugins.
		gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

		const lenis = new Lenis({
			lerp: 0.1,
			smoothWheel: true,
			syncTouch: true,
			wheelMultiplier: 0.95,
			touchMultiplier: 1.05
		});

		// Keep ScrollTrigger in sync with Lenis scroll position.
		// Coalesce updates to a single call per frame to reduce forced reflow pressure.
		let scrollTriggerRafId: number | null = null;
		const requestScrollTriggerUpdate = () => {
			if (scrollTriggerRafId !== null) return;
			scrollTriggerRafId = requestAnimationFrame(() => {
				scrollTriggerRafId = null;
				ScrollTrigger.update();
			});
		};
		lenis.on('scroll', requestScrollTriggerUpdate);

		// Drive Lenis from GSAP's ticker so both run on the same RAF frame.
		// Lenis.autoRaf defaults to false, so it needs an external tick.
		// GSAP ticker passes time in seconds; lenis.raf() expects milliseconds.
		const updateLenis = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(updateLenis);

		let isLocked = false;
		const unsubscribe = heroScrollLocked.subscribe((locked: boolean) => {
			if (locked === isLocked) return;
			isLocked = locked;

			if (locked) {
				lenis.stop();
			} else {
				lenis.start();
			}
		});

		return () => {
			unsubscribe();
			if (scrollTriggerRafId !== null) {
				cancelAnimationFrame(scrollTriggerRafId);
				scrollTriggerRafId = null;
			}
			gsap.ticker.remove(updateLenis);
			lenis.destroy();
		};
	});
</script>
