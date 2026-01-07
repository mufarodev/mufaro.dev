<script lang="ts">
	import AnimatedLiquidBackground from '$lib/components/core/animated-liquid-background.svelte';
	import DiscordStatus from '$lib/components/discord-status.svelte';
	import { onDestroy } from 'svelte';

	let { children } = $props();

	const defaultColor = { r: 181, g: 102, b: 255 };

	let currentColor = $state({ r: defaultColor.r, g: defaultColor.g, b: defaultColor.b });
	let targetColor = $state({ r: defaultColor.r, g: defaultColor.g, b: defaultColor.b });

	let animationFrameId: number | null = null;
	const transitionSpeed = 0.02;

	function rgbToHex(r: number, g: number, b: number): string {
		const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
		return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	}

	function lerp(start: number, end: number, t: number): number {
		return start + (end - start) * t;
	}

	function animateColors() {
		const dr = Math.abs(currentColor.r - targetColor.r);
		const dg = Math.abs(currentColor.g - targetColor.g);
		const db = Math.abs(currentColor.b - targetColor.b);

		if (dr < 0.5 && dg < 0.5 && db < 0.5) {
			currentColor = { ...targetColor };
			animationFrameId = null;
			return;
		}

		currentColor = {
			r: lerp(currentColor.r, targetColor.r, transitionSpeed),
			g: lerp(currentColor.g, targetColor.g, transitionSpeed),
			b: lerp(currentColor.b, targetColor.b, transitionSpeed)
		};

		animationFrameId = requestAnimationFrame(animateColors);
	}

	function startAnimation() {
		if (animationFrameId === null) {
			animationFrameId = requestAnimationFrame(animateColors);
		}
	}
	let plasmaColor1 = $derived.by(() => {
		const brighterR = Math.min(255, currentColor.r + 40);
		const brighterG = Math.min(255, currentColor.g + 40);
		const brighterB = Math.min(255, currentColor.b + 40);
		return rgbToHex(brighterR, brighterG, brighterB);
	});
	let plasmaColor2 = '#000000';
	let plasmaColor3 = '#000000';

	function handleAccentColorChange(color: { r: number; g: number; b: number } | null) {
		if (color && (color.r !== 0 || color.g !== 0 || color.b !== 0)) {
			targetColor = { r: color.r, g: color.g, b: color.b };
			startAnimation();
		}
	}

	onDestroy(() => {
		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
		}
	});
</script>

<section class="relative flex min-h-svh flex-col justify-end overflow-hidden bg-background pb-0">
	<div class="absolute inset-0 z-0">
		<AnimatedLiquidBackground
			color1={plasmaColor1}
			color2={plasmaColor2}
			color3={plasmaColor3}
			speed={15}
		/>
		<div class="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
	</div>

	<div
		class="pointer-events-none absolute bottom-80 left-0 z-0 w-[500px] translate-x-[-10%] opacity-60 mix-blend-lighten md:w-[700px] lg:w-[800px]"
	>
		<div
			class="absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-colors duration-1000"
			style="background-color: rgba({Math.round(currentColor.r)}, {Math.round(
				currentColor.g
			)}, {Math.round(currentColor.b)}, 0.2);"
		></div>

		<img
			src="/images/sparkle.webp"
			alt=""
			class="w-full drop-shadow-2xl filter"
			style="mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);"
		/>
	</div>

	<div class="absolute top-4 right-4 z-20 w-96 md:top-6 md:right-6 lg:top-8 lg:right-8">
		<DiscordStatus onAccentColorChange={handleAccentColorChange} />
	</div>

	<div class="relative z-10 w-full px-8 pb-12 md:px-16 lg:px-24 lg:pb-24">
		<div class="flex flex-col items-start text-left">
			<h1
				class="font-serif text-6xl leading-[0.9] font-medium tracking-tight text-white md:text-8xl lg:text-9xl"
			>
				Hello, I'm <br />
				<span
					class="bg-linear-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent"
				>
					Mufaro
				</span>
			</h1>

			<p class="mt-8 max-w-xl text-lg leading-relaxed text-white/80 md:text-xl lg:max-w-md">
				I'm an 18 year old from Poland who makes software, plays games and is passionate about
				learning new things.
			</p>
		</div>
	</div>
</section>
