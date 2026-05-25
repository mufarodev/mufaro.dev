<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ScrollSmoother } from 'gsap/dist/ScrollSmoother';
	import { heroScrollLocked, smoothScroller } from '$lib/stores/hero-state';

	// Reactively track the current page pathname using Svelte 5 state
	let pathname = $derived($page.url.pathname);

	// Automatically reset scroll position and recalculate layouts on page changes
	$effect(() => {
		if (pathname) {
			// Small timeout to allow Svelte to complete its DOM rendering cycle
			setTimeout(() => {
				const smoother = ScrollSmoother.get();
				if (smoother) {
					smoother.scrollTo(0, false);
					ScrollTrigger.refresh();
				}
			}, 50);
		}
	});

	onMount(() => {
		// Register all GSAP plugins once here — this component is mounted in the root
		// layout so it always runs before any page-level component needs these plugins.
		gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

		// Disable lag smoothing in GSAP's ticker to prevent sudden "snaps" or jumps
		// under sudden heavy frame rendering.
		gsap.ticker.lagSmoothing(0);

		// Initialize GSAP's ScrollSmoother on the wrapper and content containers.
		// Native browser scrolling input is used on desktop for flawless 120fps performance.
		const smoother = ScrollSmoother.create({
			wrapper: '#smooth-wrapper',
			content: '#smooth-content',
			smooth: 1.2, // seconds
			effects: true // enables native GSAP speed/lag parallax effects
		});

		// Set up ResizeObserver to handle content size changes (dynamic images, Svelte layout updates, etc.)
		// We debounce the refresh calls by 100ms to prevent layout thrashing and collisions with
		// ScrollSmoother's native resize handler during active window resizing.
		let resizeObserver: ResizeObserver | null = null;
		let resizeTimeout: number | null = null;
		const contentEl = document.querySelector('#smooth-content');
		if (contentEl) {
			resizeObserver = new ResizeObserver(() => {
				if (resizeTimeout !== null) {
					window.clearTimeout(resizeTimeout);
				}
				resizeTimeout = window.setTimeout(() => {
					ScrollTrigger.refresh();
					resizeTimeout = null;
				}, 100);
			});
			resizeObserver.observe(contentEl);
		}

		// Expose ScrollSmoother via our unified smoothScroller store
		smoothScroller.set({
			scrollTo: (target, options) => {
				if (options?.immediate) {
					smoother.scrollTo(target, false);
					options.onComplete?.();
				} else {
					gsap.to(smoother, {
						scrollTop: target,
						duration: options?.duration ?? 1.2,
						ease: 'power2.out',
						overwrite: 'auto',
						onComplete: () => options?.onComplete?.()
					});
				}
			}
		});

		let isLocked = false;
		const unsubscribe = heroScrollLocked.subscribe((locked: boolean) => {
			if (locked === isLocked) return;
			isLocked = locked;
			smoother.paused(locked);
		});

		return () => {
			unsubscribe();
			smoothScroller.set(null);
			if (resizeTimeout !== null) {
				window.clearTimeout(resizeTimeout);
				resizeTimeout = null;
			}
			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
			
			// Cleanly kill the smoother instance
			const currentSmoother = ScrollSmoother.get();
			if (currentSmoother) {
				currentSmoother.kill();
			}
		};
	});
</script>
