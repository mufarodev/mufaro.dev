<script lang="ts">
	import { onMount } from 'svelte';
	import { uiPrefs } from '$lib/stores/ui-prefs.svelte';

	let canvas: HTMLCanvasElement | undefined = $state();
	let animationId: number;

	onMount(() => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = 256;
		canvas.height = 256;

		const imageData = ctx.createImageData(canvas.width, canvas.height);
		const data = imageData.data;

		for (let i = 0; i < data.length; i += 4) {
			const value = Math.random() * 255;
			data[i] = value;
			data[i + 1] = value;
			data[i + 2] = value;
			data[i + 3] = 255;
		}

		ctx.putImageData(imageData, 0, 0);

		let offset = 0;
		const animate = () => {
			if (!uiPrefs.reducedMotion && canvas) {
				offset += 0.1;
				canvas.style.transform = `translate(${Math.sin(offset / 50) * 2}px, ${Math.cos(offset / 50) * 2}px)`;
			}
			animationId = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationId) cancelAnimationFrame(animationId);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-(--grain-opacity-canvas) mix-blend-overlay"
	aria-hidden="true"
></canvas>
