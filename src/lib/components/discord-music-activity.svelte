<script lang="ts">
	import type { LanyardGeneric } from 'sveltekit-lanyard';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { MusicNote01Icon } from '@hugeicons/core-free-icons';
	import { rgbToHex, getContrastColor, extractDominantColor } from '$lib/utils';

	interface Props {
		activity: LanyardGeneric.Activity;
		onAccentColorChange?: (color: { r: number; g: number; b: number }) => void;
	}

	let { activity, onAccentColorChange }: Props = $props();

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
		return extractDominantColor(imageBuffer);
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
					onAccentColorChange?.(color);
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

<div class="relative mt-4 space-y-4">
	{#if largeImage}
		<div
			class="absolute inset-0 -m-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] overflow-hidden rounded-2xl"
		>
			<div
				class="pointer-events-none absolute z-10 h-full w-full"
				style="
				background: radial-gradient(
					circle at center,
					transparent 0%,
					rgba({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}, 0.8) 35%,
					rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}) 100%
				);
			"
			></div>
			<img
				src={largeImage}
				alt={activity.name}
				class="center pointer-events-none absolute inset-0 h-full w-full object-cover opacity-75 blur-[2px]"
			/>
		</div>
	{/if}

	{#if activity.type == 2}
		<div
			class="absolute -top-1 -right-1 z-20 flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 backdrop-blur-md transition-all duration-300 {contrastColor ===
			'black'
				? 'border-black/5 bg-black/5'
				: 'border-white/10 bg-black/30'}"
		>
			<span
				class="text-center text-[10px] font-medium {contrastColor === 'black'
					? 'text-black/80'
					: 'text-white/80'}">{activity.name}</span
			>
			<HugeiconsIcon
				icon={MusicNote01Icon}
				size={12}
				className={contrastColor === 'black' ? 'text-black/60' : 'text-white/60'}
			/>
		</div>
	{/if}

	<div class="relative z-20 flex items-center gap-3">
		{#if largeImage}
			<img
				src={largeImage}
				alt={activity.name}
				class="h-18 w-18 shrink-0 rounded-lg object-cover shadow-lg ring-1 {contrastColor ===
				'black'
					? 'ring-black/10'
					: 'ring-white/10'}"
			/>
		{/if}
		<div class="min-w-0 flex-1 space-y-0.5">
			{#if activity.details}
				<p
					class="truncate text-base font-semibold tracking-tight {contrastColor === 'black'
						? 'text-stone-900/90'
						: 'text-white/95'}"
				>
					{activity.details}
				</p>
			{/if}
			{#if activity.state}
				<p
					class="truncate text-sm {contrastColor === 'black'
						? 'text-stone-900/70'
						: 'text-white/70'}"
				>
					{activity.state}
				</p>
			{/if}
		</div>
	</div>

	{#if activity.timestamps?.start && activity.timestamps?.end}
		<div class="absolute right-0 -bottom-2 left-0 z-20 !mt-0 space-y-1">
			<div
				class="h-1 w-full overflow-hidden rounded-full {contrastColor === 'black'
					? 'bg-black/10'
					: 'bg-white/20'}"
			>
				<div
					class="h-full rounded-full transition-all duration-300 {contrastColor === 'black'
						? 'bg-black/70'
						: 'bg-white/70'}"
					style="width: {progress}%"
				></div>
			</div>
			<div
				class="flex justify-between text-[10px] font-medium {contrastColor === 'black'
					? 'text-black/50'
					: 'text-white/50'}"
			>
				<span>{currentTime}</span>
				<span>{formatDuration(activity.timestamps.end - activity.timestamps.start)}</span>
			</div>
		</div>
	{/if}
</div>
