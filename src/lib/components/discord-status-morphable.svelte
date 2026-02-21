<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Loading03Icon, MusicNote01Icon } from '@hugeicons/core-free-icons';
	import { getContrastColor, extractDominantColor } from '$lib/utils';
	import { getLanyard } from '$lib/stores/lanyard';

	const lanyard = getLanyard();

	interface Props {
		onAccentColorChange?: (color: { r: number; g: number; b: number } | null) => void;
		morphProgress?: number; // 0 = large, 1 = compact
	}

	let { onAccentColorChange, morphProgress = 0 }: Props = $props();

	const statusColors = {
		online: 'bg-green-500',
		idle: 'bg-yellow-500',
		dnd: 'bg-red-500',
		offline: 'bg-gray-500'
	};

	const statusLabels = {
		online: 'Online',
		idle: 'Idle',
		dnd: 'Do Not Disturb',
		offline: 'Offline'
	};

	const statusLabelsCompact = {
		online: 'Online',
		idle: 'Away',
		dnd: 'DND',
		offline: 'Offline'
	};

	let connected = $derived(lanyard.connected);
	let data = $derived(lanyard.data);
	let error = $derived(lanyard.error);
	let status = $derived(data?.discord_status || 'offline');

	let textContrastColor = $state<'black' | 'white'>('white');
	let m3ContentColorValue = $state<{ r: number; g: number; b: number }>({ r: 0, g: 0, b: 0 });

	// Music progress tracking
	let progress = $state(0);
	let currentTime = $state('0:00');

	function formatDuration(milliseconds: number): string {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function calculateProgress(timestamps: { start: number; end: number }): number {
		const current = Date.now();
		const progressValue =
			((current - timestamps.start) / (timestamps.end - timestamps.start)) * 100;
		return Math.min(Math.max(Math.round(progressValue), 0), 100);
	}

	function handleAccentColorChange(color: { r: number; g: number; b: number } | null) {
		if (color) {
			textContrastColor = getContrastColor(color.r, color.g, color.b);
			m3ContentColorValue = color;
		} else {
			textContrastColor = 'white';
			m3ContentColorValue = { r: 0, g: 0, b: 0 };
		}
		onAccentColorChange?.(color);
	}

	let latestActivity = $derived(
		data?.activities && data.activities.length > 0
			? data.activities[data.activities.length - 1]
			: null
	);

	let musicActivity = $derived(latestActivity?.type === 2 ? latestActivity : null);

	const generalActivityLargeImage = $derived(
		latestActivity && latestActivity.type !== 2 && latestActivity.assets?.large_image
			? toImageUrl(latestActivity.assets.large_image, latestActivity.application_id)
			: null
	);

	$effect(() => {
		if (!latestActivity || latestActivity.type !== 2) {
			textContrastColor = 'white';
			m3ContentColorValue = { r: 0, g: 0, b: 0 };
			onAccentColorChange?.(null);
		}
	});

	$effect(() => {
		if (musicActivity?.timestamps?.start && musicActivity?.timestamps?.end) {
			const current = Date.now();
			const elapsed = current - musicActivity.timestamps.start;
			currentTime = formatDuration(elapsed);
			progress = calculateProgress(musicActivity.timestamps as { start: number; end: number });

			const timer = setInterval(() => {
				const current = Date.now();
				const elapsed = current - musicActivity.timestamps!.start!;
				currentTime = formatDuration(elapsed);
				progress = calculateProgress(musicActivity.timestamps as { start: number; end: number });
			}, 1000);

			return () => clearInterval(timer);
		}
	});

	async function m3ContentColor(
		imageBuffer: ArrayBuffer
	): Promise<{ r: number; g: number; b: number }> {
		return extractDominantColor(imageBuffer);
	}

	function toImageUrl(imageKey: string, applicationId?: string): string {
		if (imageKey.startsWith('mp:external/')) {
			return imageKey.replace('mp:external/', 'https://media.discordapp.net/external/');
		} else if (imageKey.startsWith('spotify:')) {
			return `https://i.scdn.co/image/${imageKey.replace('spotify:', '')}`;
		} else if (applicationId) {
			return `https://cdn.discordapp.com/app-assets/${applicationId}/${imageKey}.png`;
		}
		return '';
	}

	$effect(() => {
		if (musicActivity?.assets?.large_image) {
			let imageUrl = toImageUrl(musicActivity.assets.large_image, musicActivity.application_id);

			fetch(imageUrl)
				.then((response) => response.blob())
				.then((blob) => blob.arrayBuffer())
				.then((arrayBuffer) => m3ContentColor(arrayBuffer))
				.then((color) => {
					handleAccentColorChange(color);
				})
				.catch((err) => {
					console.error('Error fetching or processing image:', err);
					handleAccentColorChange(null);
				});
		}
	});

	const largeImage = $derived(
		musicActivity?.assets?.large_image
			? toImageUrl(musicActivity.assets.large_image, musicActivity.application_id)
			: null
	);

	let contrastColor = $derived(
		getContrastColor(m3ContentColorValue.r, m3ContentColorValue.g, m3ContentColorValue.b)
	);

	let dynamicLargeHeight = $derived(musicActivity ? '180px' : '140px');
</script>

<div
	class="group morph-container relative"
	style:--morph-progress={morphProgress}
	style:--accent-r={m3ContentColorValue.r}
	style:--accent-g={m3ContentColorValue.g}
	style:--accent-b={m3ContentColorValue.b}
	style:--progress="{progress}%"
	style:--dynamic-large-height={dynamicLargeHeight}
>
	<div
		class="morph-border absolute -inset-[1.5px] bg-white/10 backdrop-blur-sm group-hover:bg-white/15"
	></div>

	<div
		class="morph-content relative overflow-hidden bg-black/40 backdrop-blur-md group-hover:bg-black/50"
	>
		{#if largeImage && musicActivity}
			<div class="morph-bg-image pointer-events-none absolute inset-0 overflow-hidden">
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
					alt={musicActivity.name}
					class="center pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px]"
				/>
			</div>
		{/if}

		{#if !connected}
			<div class="relative z-20 flex items-center gap-2">
				<span
					class="animate-spin {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}"
				>
					<HugeiconsIcon icon={Loading03Icon} size={18} />
				</span>
				<p class="text-sm {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}">
					Connecting...
				</p>
			</div>
		{:else if data}
			<div class="morph-large-content relative z-20 flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="relative h-2 w-2">
							<div class="h-full w-full rounded-full {statusColors[data.discord_status]}"></div>
							<div
								class="absolute inset-0 animate-ping rounded-full {statusColors[
									data.discord_status
								]} opacity-75"
							></div>
						</div>
						<span
							class="text-xs font-medium {data.discord_status === 'dnd'
								? 'text-white/70'
								: textContrastColor === 'black'
									? 'text-black/70'
									: 'text-white/70'}"
						>
							{statusLabels[data.discord_status]}
						</span>
					</div>

					{#if musicActivity}
						<div
							class="flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 backdrop-blur-md {contrastColor ===
							'black'
								? 'border-black/5 bg-black/5'
								: 'border-white/10 bg-black/30'}"
						>
							<span
								class="text-center text-[10px] font-medium {contrastColor === 'black'
									? 'text-black/80'
									: 'text-white/80'}"
							>
								{musicActivity.name}
							</span>
							<HugeiconsIcon
								icon={MusicNote01Icon}
								size={12}
								className={contrastColor === 'black' ? 'text-black/60' : 'text-white/60'}
							/>
						</div>
					{/if}
				</div>

				{#if musicActivity}
					<div class="flex items-center gap-3">
						{#if largeImage}
							<img
								src={largeImage}
								alt={musicActivity.name}
								class="h-18 w-18 shrink-0 rounded-lg object-cover shadow-lg ring-1 {contrastColor ===
								'black'
									? 'ring-black/10'
									: 'ring-white/10'}"
							/>
						{/if}
						<div class="min-w-0 flex-1 space-y-0.5">
							{#if musicActivity.details}
								<p
									class="truncate text-base font-semibold tracking-tight {contrastColor === 'black'
										? 'text-stone-900/90'
										: 'text-white/95'}"
								>
									{musicActivity.details}
								</p>
							{/if}
							{#if musicActivity.state}
								<p
									class="truncate text-sm {contrastColor === 'black'
										? 'text-stone-900/70'
										: 'text-white/70'}"
								>
									{musicActivity.state}
								</p>
							{/if}
						</div>
					</div>

					{#if musicActivity.timestamps?.start && musicActivity.timestamps?.end}
						<div class="space-y-1">
							<div
								class="h-1 w-full overflow-hidden rounded-full {contrastColor === 'black'
									? 'bg-black/10'
									: 'bg-white/20'}"
							>
								<div
									class="h-full rounded-full {contrastColor === 'black'
										? 'bg-black/70'
										: 'bg-white/70'}"
									style="width: {progress}%; transition: width 0.3s ease;"
								></div>
							</div>
							<div
								class="flex justify-between text-[10px] font-medium {contrastColor === 'black'
									? 'text-black/50'
									: 'text-white/50'}"
							>
								<span>{currentTime}</span>
								<span
									>{formatDuration(
										musicActivity.timestamps.end - musicActivity.timestamps.start
									)}</span
								>
							</div>
						</div>
					{/if}
				{:else if latestActivity}
					<div class="flex items-center gap-3">
						{#if generalActivityLargeImage}
							<img
								src={generalActivityLargeImage}
								alt={latestActivity.name}
								class="h-18 w-18 shrink-0 rounded-lg object-cover shadow-lg ring-1 {textContrastColor ===
								'black'
									? 'ring-black/10'
									: 'ring-white/10'}"
							/>
						{/if}
						<div class="min-w-0 flex-1 space-y-0.5">
							<p
								class="truncate text-base font-semibold tracking-tight {textContrastColor ===
								'black'
									? 'text-stone-900/90'
									: 'text-white/95'}"
							>
								{latestActivity.name}
							</p>
							{#if latestActivity.details}
								<p
									class="truncate text-sm {textContrastColor === 'black'
										? 'text-stone-900/70'
										: 'text-white/70'}"
								>
									{latestActivity.details}
								</p>
							{/if}
							{#if latestActivity.state}
								<p
									class="truncate text-sm {textContrastColor === 'black'
										? 'text-stone-900/70'
										: 'text-white/70'}"
								>
									{latestActivity.state}
								</p>
							{/if}
						</div>
					</div>
				{:else}
					<div class="space-y-1">
						<p
							class="text-base font-semibold {textContrastColor === 'black'
								? 'text-black'
								: 'text-white'}"
						>
							No activity
						</p>
						<p class="text-sm {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}">
							Just vibing at the moment
						</p>
					</div>
				{/if}
			</div>

			<div class="morph-compact-content absolute inset-0 z-30">
				<div class="flex h-full items-center gap-2.5 px-3 {musicActivity ? 'pb-1' : ''}">
					{#if musicActivity && largeImage}
						<div class="relative shrink-0">
							<img
								src={largeImage}
								alt={musicActivity.name}
								class="h-8 w-8 rounded-md object-cover shadow-md"
							/>
						</div>
					{:else}
						<div class="relative flex shrink-0 items-center justify-center">
							<div class="h-2.5 w-2.5 rounded-full {statusColors[status]}"></div>
						</div>
					{/if}

					<div class="flex min-w-0 flex-1 flex-col text-xs leading-tight">
						{#if musicActivity}
							<span class="truncate font-medium text-white"
								>{musicActivity.details || musicActivity.name}</span
							>
							<span class="truncate text-[10px] text-white/50">{musicActivity.state || ''}</span>
						{:else if latestActivity}
							<span class="truncate font-medium text-white">{latestActivity.name}</span>
							<span class="truncate text-[10px] text-white/50">
								{latestActivity.details ||
									latestActivity.state ||
									statusLabelsCompact[status as keyof typeof statusLabelsCompact]}
							</span>
						{:else}
							<span class="font-medium text-white"
								>{statusLabelsCompact[status as keyof typeof statusLabelsCompact]}</span
							>
						{/if}
					</div>

					{#if musicActivity}
						<div class="mr-1 flex h-5 shrink-0 items-center gap-[3px]">
							<div
								class="sound-wave w-[3px] rounded-full"
								style="background: rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}); animation-delay: 0ms;"
							></div>
							<div
								class="sound-wave w-[3px] rounded-full"
								style="background: rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}); animation-delay: 150ms;"
							></div>
							<div
								class="sound-wave w-[3px] rounded-full"
								style="background: rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}); animation-delay: 300ms;"
							></div>
							<div
								class="sound-wave w-[3px] rounded-full"
								style="background: rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}); animation-delay: 450ms;"
							></div>
						</div>
					{/if}
				</div>

				{#if musicActivity}
					<div class="absolute right-0 bottom-0 left-0 h-[3px] overflow-hidden">
						<div class="absolute inset-0 bg-white/10"></div>
						<div
							class="relative h-full"
							style="
								width: {progress}%;
								background: rgb({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b});
								box-shadow: 0 0 12px 3px rgba({m3ContentColorValue.r}, {m3ContentColorValue.g}, {m3ContentColorValue.b}, 0.5);
								transition: width 0.3s ease;
							"
						></div>
					</div>
				{/if}
			</div>
		{:else if error}
			<div class="relative z-20 space-y-2">
				<p class="text-sm font-semibold text-red-400">Connection error</p>
				<p class="text-xs {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}">
					Unable to fetch Discord status
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.morph-container {
		--large-width: 384px;
		--compact-width: 260px;
		--large-height: var(--dynamic-large-height, 180px);
		--compact-height: 48px;
		--large-radius: 17px;
		--compact-radius: 24px;
		--large-padding: 20px;
		--compact-padding: 8px;
	}

	@media (max-width: 1024px) {
		.morph-container {
			--large-width: 340px;
			--compact-width: 220px;
		}
	}

	@media (max-width: 768px) {
		.morph-container {
			--large-width: min(80vw, 320px);
			--compact-width: min(66vw, 200px);
			--large-padding: 16px;
		}
	}

	.morph-border {
		border-radius: calc(
			var(--large-radius) + (var(--compact-radius) - var(--large-radius)) * var(--morph-progress) +
				1px
		);
		transition: background-color 0.3s ease;
	}

	.morph-content {
		width: calc(
			var(--large-width) + (var(--compact-width) - var(--large-width)) * var(--morph-progress)
		);
		height: calc(
			var(--large-height) + (var(--compact-height) - var(--large-height)) * var(--morph-progress)
		);
		border-radius: calc(
			var(--large-radius) + (var(--compact-radius) - var(--large-radius)) * var(--morph-progress)
		);
		padding: calc(
			var(--large-padding) + (var(--compact-padding) - var(--large-padding)) * var(--morph-progress)
		);
		transition: background-color 0.3s ease;
	}

	.morph-bg-image {
		opacity: calc(0.75 * (1 - var(--morph-progress) * 1.5));
	}

	.morph-large-content {
		opacity: calc(1 - min(1, var(--morph-progress) * 2));
	}

	.morph-compact-content {
		opacity: calc(max(0, (var(--morph-progress) - 0.4) * 2.5));
	}

	/* OneUI-style sound wave animation */
	.sound-wave {
		animation: sound-wave 0.8s ease-in-out infinite alternate;
	}

	@keyframes sound-wave {
		0% {
			height: 4px;
			opacity: 0.5;
		}
		100% {
			height: 16px;
			opacity: 1;
		}
	}
</style>
