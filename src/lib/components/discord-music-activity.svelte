<script lang="ts">
	import type { LanyardGeneric } from 'sveltekit-lanyard';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { MusicNote01Icon } from '@hugeicons/core-free-icons';
	import { createImageFromBlob, rgbToHex } from '$lib/utils';

	interface Props {
		activity: LanyardGeneric.Activity;
	}

	let { activity }: Props = $props();

	function formatDuration(milliseconds: number): string {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	let progress = $state(0);
	let currentTime = $state('0:00');
	let m3ContentColorValue = $state<{ r: number; g: number; b: number }>({ r: 0, g: 0, b: 0 });
	let contrastColor = $derived.by(() => {
		return getContrastColor(m3ContentColorValue.r, m3ContentColorValue.g, m3ContentColorValue.b);
	});

	$effect(() => console.log('Contrast color:', contrastColor));

	function calculateProgress(timestamps: { start: number; end: number }): number {
		const current = Date.now();
		const progressValue =
			((current - timestamps.start) / (timestamps.end - timestamps.start)) * 100;
		return Math.min(Math.max(Math.round(progressValue), 0), 100);
	}

	$effect(() => {
		if (activity.timestamps?.start && activity.timestamps?.end) {
			const timer = setInterval(() => {
				const current = Date.now();
				const elapsed = current - activity.timestamps!.start!;
				currentTime = formatDuration(elapsed);
				progress = calculateProgress(activity.timestamps as { start: number; end: number });
			}, 1000);

			return () => clearInterval(timer);
		}
	});

	async function m3ContentColor(
		imageBuffer: ArrayBuffer
	): Promise<{ r: number; g: number; b: number }> {
		const blob = new Blob([imageBuffer]);
		const img = await createImageFromBlob(blob);

		const canvas = document.createElement('canvas');
		canvas.width = img.naturalWidth;
		canvas.height = img.naturalHeight;

		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) return { r: 30, g: 30, b: 30 };
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

		const centerX = Math.floor(canvas.width / 2);
		const centerY = Math.floor(canvas.height / 2);
		const sampleWidth = Math.floor(canvas.width * 0.7);
		const sampleHeight = Math.floor(canvas.height * 0.7);
		const startX = Math.max(0, centerX - Math.floor(sampleWidth / 2));
		const startY = Math.max(0, centerY - Math.floor(sampleHeight / 2));

		const imageData = ctx.getImageData(startX, startY, sampleWidth, sampleHeight);
		const data = imageData.data;

		const colorMap: Record<
			string,
			{ r: number; g: number; b: number; brightness: number; count: number }
		> = {};

		let totalBrightness = 0;
		let validPixels = 0;

		for (let i = 0; i < data.length; i += 12) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];

			const brightness = (r + g + b) / 3;
			totalBrightness += brightness;
			validPixels++;

			if (brightness < 15 || brightness > 240) continue;

			const rKey = Math.round(r / 20) * 20;
			const gKey = Math.round(g / 20) * 20;
			const bKey = Math.round(b / 20) * 20;
			const key = `${rKey},${gKey},${bKey}`;

			if (!colorMap[key]) {
				colorMap[key] = { r: rKey, g: gKey, b: bKey, brightness, count: 0 };
			}
			colorMap[key].count++;
		}

		const avgBrightness = totalBrightness / validPixels;
		const isDarkImage = avgBrightness < 60;

		console.log('Average brightness:', avgBrightness, 'Dark image:', isDarkImage);

		let dominant: { r: number; g: number; b: number } = { r: 30, g: 30, b: 30 };
		let maxCount = 0;

		Object.values(colorMap).forEach((color) => {
			if (color.count > maxCount) {
				maxCount = color.count;
				dominant = color;
			}
		});

		if (maxCount === 0 || (isDarkImage && dominant.brightness > 80)) {
			return { r: 30, g: 30, b: 30 };
		}

		return { r: dominant.r, g: dominant.g, b: dominant.b };
	}

	function getLuminance(r: number, g: number, b: number): number {
		const [rs, gs, bs] = [r, g, b].map((c) => {
			c /= 255;
			return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		});
		console.log('RS, GS, BS for luminance:', rs, gs, bs);
		return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
	}

	function getContrastColor(r: number, g: number, b: number): string {
		const luminance = getLuminance(r, g, b);
		console.log('Luminance:', luminance, `rgb(${r}, ${g}, ${b})`);
		return luminance > 0.179 ? 'black' : 'white';
	}

	function toImageUrl(imageKey: string, applicationId: string): string {
		if (imageKey.startsWith('mp:external/')) {
			return imageKey.replace('mp:external/', 'https://media.discordapp.net/external/');
		} else if (imageKey.startsWith('spotify:')) {
			return `https://i.scdn.co/image/${imageKey.replace('spotify:', '')}`;
		} else {
			return `https://cdn.discordapp.com/app-assets/${applicationId}/${imageKey}.png`;
		}
	}

	$effect(() => {
		if (activity.type === 2 && activity.assets?.large_image) {
			let imageUrl = toImageUrl(activity.assets.large_image, activity.application_id);

			fetch(imageUrl)
				.then((response) => response.blob())
				.then((blob) => blob.arrayBuffer())
				.then((arrayBuffer) => m3ContentColor(arrayBuffer))
				.then((color) => {
					m3ContentColorValue = color;
					console.log('M3Content color:', color);
				})
				.catch((error) => {
					console.error('Error fetching or processing image:', error);
					m3ContentColorValue = { r: 0, g: 0, b: 0 };
				});
		}
	});

	const largeImage = $derived(
		activity.assets?.large_image
			? toImageUrl(activity.assets.large_image, activity.application_id)
			: null
	);
</script>

<div class="space-y-3">
	{#if largeImage}
		<div class="absolute inset-0 h-full w-full overflow-hidden rounded-xl">
			<div
				class="pointer-events-none absolute z-10 h-full w-full"
				style="
				background: radial-gradient(
					circle at center,
					transparent 0%,
					rgba({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}, 0.9) 40%,
					rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}) 100%
				);
			"
			></div>
			<img
				src={largeImage}
				alt={activity.name}
				class="center pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
			/>
		</div>
	{/if}

	{#if activity.type == 2}
		<div
			class="absolute top-3 right-4 z-20 flex items-center justify-center gap-2 rounded-lg px-3 py-2 shadow-neu-highlight backdrop-blur-sm transition-all duration-300"
		>
			<span class="text-center text-xs">{activity.name}</span>
			<HugeiconsIcon icon={MusicNote01Icon} size={14} className="text-xs fill-current/30" />
		</div>
	{/if}

	<div
		class="relative z-20 space-y-1.5 overflow-hidden rounded-xl p-4 shadow-neu-highlight backdrop-blur-sm transition-colors duration-300"
	>
		<div class="flex items-start gap-3">
			<div class="flex-1 space-y-1">
				{#if activity.details}
					<p
						class="text-sm font-semibold tracking-tight {contrastColor === 'black'
							? 'text-stone-900/90'
							: 'text-foreground/90'}"
					>
						{activity.details}
					</p>
				{/if}
				{#if activity.state}
					<p
						class="text-xs {contrastColor === 'black' ? 'text-stone-900/70' : 'text-foreground/70'}"
					>
						{activity.state}
					</p>
				{/if}
			</div>
		</div>

		{#if activity.timestamps?.start && activity.timestamps?.end}
			<div class="space-y-1.5">
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
					<div
						class="h-full rounded-full bg-linear-to-r from-primary/60 to-primary/40 transition-all duration-300"
						style="width: {progress}%"
					></div>
				</div>
				<!-- <div class="flex justify-between text-[10px] font-medium text-muted-foreground">
					<span>{currentTime}</span>
					<span>{formatDuration(activity.timestamps.end - activity.timestamps.start)}</span>
				</div> -->
			</div>
		{/if}
	</div>
</div>
