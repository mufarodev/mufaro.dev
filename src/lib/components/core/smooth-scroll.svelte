<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import Lenis from 'lenis';
	import { heroScrollLocked } from '$lib/stores/hero-state';

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const lenis = new Lenis({
			lerp: 0.1,
			smoothWheel: true,
			syncTouch: true,
			wheelMultiplier: 0.95,
			touchMultiplier: 1.05
		});

		lenis.on('scroll', () => {
			ScrollTrigger.update();
		});

		const updateLenis = (time: number) => {
			lenis.raf(time * 1000);
		};

		const unsubscribe = heroScrollLocked.subscribe((locked: boolean) => {
			if (locked) {
				lenis.scrollTo(window.scrollY, { immediate: true });
				lenis.stop();
			} else {
				lenis.scrollTo(window.scrollY, { immediate: true });
				lenis.start();
			}
		});

		gsap.ticker.add(updateLenis);
		gsap.ticker.lagSmoothing(0);

		return () => {
			unsubscribe();
			gsap.ticker.remove(updateLenis);
			lenis.destroy();
		};
	});
</script>
