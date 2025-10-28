<script lang="ts">
	import type { LanyardGeneric } from 'sveltekit-lanyard';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		SpotifyIcon,
		GameController01Icon,
		ActivityIcon,
		MusicNote01Icon,
		EyeIcon
	} from '@hugeicons/core-free-icons';
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
	let tonalSpotValue = $state<{ r: number; g: number; b: number }>({ r: 0, g: 0, b: 0 });

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

	function getActivityIcon(type: number) {
		if (type === 2) return MusicNote01Icon;
		if (type === 3) return EyeIcon;
		if (type === 0 || type === 1) return GameController01Icon;
		return ActivityIcon;
	}

	function getActivityColor(type: number) {
		if (type === 2) return 'from-green-500/10 to-green-600/5';
		if (type === 3) return 'from-purple-500/10 to-purple-600/5';
		if (type === 0 || type === 1) return 'from-purple-500/10 to-purple-600/5';
		return 'from-blue-500/10 to-blue-600/5';
	}

	function getIconBg(type: number) {
		if (type === 2) return 'bg-green-500/10 group-hover:bg-green-500/15';
		if (type === 3) return 'bg-purple-500/10 group-hover:bg-purple-500/15';
		if (type === 0 || type === 1) return 'bg-purple-500/10 group-hover:bg-purple-500/15';
		return 'bg-blue-500/10 group-hover:bg-blue-500/15';
	}

	async function tonalSpotColor(
		imageBuffer: ArrayBuffer
	): Promise<{ r: number; g: number; b: number }> {
		const blob = new Blob([imageBuffer]);
		const img = await createImageFromBlob(blob);

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return { r: 100, g: 100, b: 100 };
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);

		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataView = new DataView(imageData.data.buffer);
		const pixelStep = 4 * 5;
		const colorMap = new Map<string, number>();
		let totalPixels = 0;

		for (let i = 0; i < dataView.byteLength; i += pixelStep) {
			const a = dataView.getUint8(i + 3);

			if (a < 125) continue;

			const qr = Math.round(dataView.getUint8(i) / 10) * 10;
			const qg = Math.round(dataView.getUint8(i + 1) / 10) * 10;
			const qb = Math.round(dataView.getUint8(i + 2) / 10) * 10;

			const key = `${qr},${qg},${qb}`;
			colorMap.set(key, (colorMap.get(key) || 0) + 1);
			totalPixels++;
		}

		let maxCount = 0;
		let topColorKey = '';

		for (const [key, count] of colorMap) {
			if (count > maxCount) {
				maxCount = count;
				topColorKey = key;
			}
		}

		const [r, g, b] = topColorKey.split(',').map(Number);

		return { r, g, b };
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
				.then((arrayBuffer) => tonalSpotColor(arrayBuffer))
				.then((color) => {
					tonalSpotValue = color;
					console.log('Tonal spot color:', color);
				})
				.catch((error) => {
					console.error('Error fetching or processing image:', error);
					tonalSpotValue = { r: 0, g: 0, b: 0 };
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
	{#if activity.type === 2 && largeImage}
		<div class="absolute inset-0 h-full w-full overflow-hidden rounded-xl">
			<div
				class="pointer-events-none absolute z-10 h-full w-full"
				style="
				background: radial-gradient(
					farthest-corner at 50% 50%,
					transparent 0%,
					rgb({tonalSpotValue.r}, {tonalSpotValue.g}, {tonalSpotValue.b}) 80%,
					rgb({tonalSpotValue.r}, {tonalSpotValue.g}, {tonalSpotValue.b}) 100%
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
			class="absolute top-3 right-4 z-20 flex items-center justify-center gap-2 rounded-lg px-3 py-2 backdrop-blur-sm transition-all duration-300"
		>
			<span class="text-center text-xs">{activity.name}</span>
			<HugeiconsIcon icon={getActivityIcon(activity.type)} size={14} className="text-xs" />
		</div>
	{:else}
		<div
			class="absolute top-4 right-4 z-20 inline-flex items-center justify-center rounded-lg p-2 transition-all duration-300 group-hover:scale-110 {getIconBg(
				activity.type
			)}"
		>
			<HugeiconsIcon icon={getActivityIcon(activity.type)} size={18} />
		</div>
	{/if}

	<div class="relative z-20 flex items-start gap-3">
		{#if largeImage && activity.type !== 2}
			<img
				src={largeImage}
				alt={activity.name}
				class="h-16 w-16 rounded-lg object-cover ring-1 ring-border/50"
			/>
		{/if}
		<div class="flex-1 space-y-1">
			<h3 class="text-sm font-semibold tracking-tight text-foreground">
				{activity.name}
			</h3>
			{#if activity.details}
				<p class="text-xs text-foreground/80">
					{activity.details}
				</p>
			{/if}
			{#if activity.state}
				<p class="text-xs text-muted-foreground">
					{activity.state}
				</p>
			{/if}
		</div>
	</div>

	{#if activity.timestamps?.start && activity.timestamps?.end}
		<div class="z-20 space-y-1.5">
			<div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					class="h-full rounded-full bg-linear-to-r from-primary/60 to-primary/40 transition-all duration-300"
					style="width: {progress}%"
				></div>
			</div>
			<div class="flex justify-between text-[10px] font-medium text-muted-foreground">
				<span>{currentTime}</span>
				<span>{formatDuration(activity.timestamps.end - activity.timestamps.start)}</span>
			</div>
		</div>
	{:else if activity.timestamps?.start}
		<p class="text-[10px] font-medium text-muted-foreground">
			Started {formatDuration(Date.now() - activity.timestamps.start)} ago
		</p>
	{/if}
</div>
