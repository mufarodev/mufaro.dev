<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);

	interface Props {
		scrollContainer?: HTMLElement | null;
	}

	let { scrollContainer = null }: Props = $props();

	let gridContainer: HTMLElement;

	const horizontalLines = 12;
	const verticalLines = 8;

	onMount(() => {
		const ctx = gsap.context(() => {
			const hLines = gridContainer.querySelectorAll('.h-line');
			hLines.forEach((line, i) => {
				const speed = 0.1 + (i % 3) * 0.15;
				const direction = i % 2 === 0 ? 1 : -1;

				gsap.to(line, {
					xPercent: direction * 20,
					ease: 'none',
					scrollTrigger: {
						trigger: scrollContainer || document.body,
						start: 'top top',
						end: 'bottom bottom',
						scrub: speed * 2
					}
				});
			});

			const vLines = gridContainer.querySelectorAll('.v-line');
			vLines.forEach((line, i) => {
				const speed = 0.05 + (i % 4) * 0.1;

				gsap.to(line, {
					yPercent: -30 * speed,
					ease: 'none',
					scrollTrigger: {
						trigger: scrollContainer || document.body,
						start: 'top top',
						end: 'bottom bottom',
						scrub: 1
					}
				});
			});

			const corners = gridContainer.querySelectorAll('.corner-bracket');
			corners.forEach((corner, i) => {
				gsap.to(corner, {
					rotation: i % 2 === 0 ? 5 : -5,
					scale: 1.1,
					ease: 'none',
					scrollTrigger: {
						trigger: scrollContainer || document.body,
						start: 'top top',
						end: '50% top',
						scrub: 1
					}
				});
			});

			const shapes = gridContainer.querySelectorAll('.geo-shape');
			shapes.forEach((shape, i) => {
				gsap.to(shape, {
					y: -200 - i * 50,
					rotation: 360 * (i % 2 === 0 ? 1 : -1),
					ease: 'none',
					scrollTrigger: {
						trigger: scrollContainer || document.body,
						start: 'top top',
						end: 'bottom bottom',
						scrub: 0.5 + i * 0.2
					}
				});
			});
		}, gridContainer);

		return () => {
			ctx.revert();
		};
	});
</script>

<div bind:this={gridContainer} class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	{#each Array(horizontalLines) as _, i}
		<div
			class="h-line absolute left-0 h-px w-[200%] -translate-x-1/4"
			style="
                top: {(i + 1) * (100 / (horizontalLines + 1))}%;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,{0.02 +
				(i % 3) * 0.01}) 20%, rgba(255,255,255,{0.02 + (i % 3) * 0.01}) 80%, transparent 100%);
            "
		></div>
	{/each}

	{#each Array(verticalLines) as _, i}
		<div
			class="v-line absolute top-0 h-[150%] w-px"
			style="
                left: {(i + 1) * (100 / (verticalLines + 1))}%;
                background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,{0.015 +
				(i % 2) * 0.01}) 30%, rgba(255,255,255,{0.015 + (i % 2) * 0.01}) 70%, transparent 100%);
            "
		></div>
	{/each}

	<div
		class="corner-bracket absolute top-8 left-8 h-16 w-16 border-t-2 border-l-2 border-white/5"
	></div>
	<div
		class="corner-bracket absolute top-8 right-8 h-16 w-16 border-t-2 border-r-2 border-white/5"
	></div>
	<div
		class="corner-bracket absolute bottom-8 left-8 h-16 w-16 border-b-2 border-l-2 border-white/5"
	></div>
	<div
		class="corner-bracket absolute right-8 bottom-8 h-16 w-16 border-r-2 border-b-2 border-white/5"
	></div>

	<div class="geo-shape absolute top-[20%] left-[15%] h-1 w-1 rotate-45 bg-white/10"></div>
	<div
		class="geo-shape absolute top-[40%] right-[20%] h-2 w-2 rotate-12 border border-white/5"
	></div>
	<div class="geo-shape absolute top-[60%] left-[70%] h-1.5 w-1.5 bg-white/5"></div>
	<div
		class="geo-shape absolute top-[80%] left-[30%] h-3 w-3 rounded-full border border-white/5"
	></div>
	<div class="geo-shape absolute top-[30%] right-[40%] h-8 w-1 bg-white/5"></div>
	<div class="geo-shape absolute top-[70%] right-[10%] h-1 w-8 bg-white/5"></div>

	<div
		class="absolute inset-0 bg-gradient-to-b from-white/[0.01] via-transparent to-white/[0.01]"
	></div>
	<div class="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
</div>
