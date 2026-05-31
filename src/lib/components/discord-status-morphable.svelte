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

	const startTimestamp = $derived(musicActivity?.timestamps?.start);
	const endTimestamp = $derived(musicActivity?.timestamps?.end);

	$effect(() => {
		if (startTimestamp && endTimestamp) {
			const current = Date.now();
			const elapsed = current - startTimestamp;
			currentTime = formatDuration(elapsed);
			progress = calculateProgress({ start: startTimestamp, end: endTimestamp });

			const timer = setInterval(() => {
				const current = Date.now();
				const elapsed = current - startTimestamp;
				currentTime = formatDuration(elapsed);
				progress = calculateProgress({ start: startTimestamp, end: endTimestamp });
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

	const largeImage = $derived(
		musicActivity?.assets?.large_image
			? toImageUrl(musicActivity.assets.large_image, musicActivity.application_id)
			: null
	);

	$effect(() => {
		if (largeImage) {
			fetch(largeImage)
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

	let contrastColor = $derived(
		getContrastColor(m3ContentColorValue.r, m3ContentColorValue.g, m3ContentColorValue.b)
	);

	let dynamicLargeHeight = $derived(musicActivity ? '220px' : '140px');
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
		class="morph-content relative overflow-hidden bg-black/40 backdrop-blur-md group-hover:bg-black/50"
	>
		{#if largeImage && musicActivity}
			<div
				class="morph-bg-image pointer-events-none absolute inset-x-0 top-[42px] bottom-0 overflow-hidden rounded-md"
			>
				<img
					src={largeImage}
					alt={musicActivity.name}
					class="center pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px] brightness-50"
				/>
			</div>

			<svg class="pointer-events-none absolute h-0 w-0" aria-hidden="true">
				<filter
					id="liquid-waveform"
					x="-50%"
					y="-100%"
					width="200%"
					height="300%"
					color-interpolation-filters="sRGB"
				>
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.008 0.025"
						numOctaves="2"
						seed="42"
						result="noise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="noise"
						scale="160"
						xChannelSelector="R"
						yChannelSelector="G"
						result="displaced"
					/>
					<feGaussianBlur in="displaced" stdDeviation="15" result="mist" />
				</filter>
			</svg>

			<div
				class="vapor-container pointer-events-none absolute inset-x-0 bottom-0 h-[180px] overflow-hidden rounded-b-md"
			>
				<div class="liquid-filter-wrapper absolute inset-0 h-full w-full">
					<div class="liquid-line line-back"></div>
					<div class="liquid-line line-front"></div>
				</div>
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
		{:else if data && data.discord_status}
			<div
				class="morph-large-content relative z-20 flex h-full flex-col {musicActivity
					? ''
					: 'gap-4'}"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="relative h-2 w-2">
							<div class="h-full w-full rounded-full {statusColors[data.discord_status]}"></div>
							<div
								class="absolute inset-0 rounded-full {statusColors[data.discord_status]} opacity-75"
							></div>
						</div>
						<span class="text-xs font-medium text-white/80">
							{statusLabels[data.discord_status]}
						</span>
					</div>

					{#if musicActivity}
						<div class="flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5">
							<span class="text-center text-xs font-medium text-white/80">
								{musicActivity.name}
							</span>
							<HugeiconsIcon
								icon={MusicNote01Icon}
								size={14}
								className="text-white/80 fill-current/50"
							/>
						</div>
					{/if}
				</div>

				{#if musicActivity}
					<div class="flex flex-1 flex-col justify-between pt-10">
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
								<p class="truncate text-base font-semibold tracking-tight text-white/95">
									{musicActivity.details}
								</p>
								<p class="truncate text-sm text-white/70">
									{musicActivity.state}
								</p>
							</div>
						</div>

						{#if musicActivity.timestamps?.start && musicActivity.timestamps?.end}
							<div class="space-y-1">
								<div class="h-1 w-full overflow-hidden rounded-full bg-white/20">
									<div
										class="h-full rounded-full bg-white"
										style="width: {progress}%; transition: width 0.3s ease;"
									></div>
								</div>
								<div class="flex justify-between text-[10px] font-medium text-white/60">
									<span>{currentTime}</span>
									<span
										>{formatDuration(
											musicActivity.timestamps.end - musicActivity.timestamps.start
										)}</span
									>
								</div>
							</div>
						{/if}
					</div>
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

			<div class="morph-compact-content">
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
					<div class="compact-progress absolute right-0 bottom-0 left-0 h-[3px] overflow-hidden">
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
		--large-padding: 16px;
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

	.morph-content {
		width: var(--large-width);
		height: var(--large-height);
		padding: var(--large-padding);
		padding-top: calc(
			(var(--large-padding) + var(--compact-padding)) / 2 - var(--compact-padding) / 2
		);

		clip-path: inset(
			calc((var(--large-height) - var(--compact-height)) / 2 * var(--morph-progress, 0)) 0
				calc((var(--large-height) - var(--compact-height)) / 2 * var(--morph-progress, 0))
				calc((var(--large-width) - var(--compact-width)) * var(--morph-progress, 0)) round
				calc(
					var(--large-radius) + (var(--compact-radius) - var(--large-radius)) *
						var(--morph-progress, 0)
				)
		);
		will-change: clip-path;
		transition: background-color 0.3s ease;
	}

	.morph-bg-image {
		opacity: calc(0.75 * (1 - var(--morph-progress) * 1.5));
		mask-image: radial-gradient(circle at bottom left, black 0%, transparent 80%);
		-webkit-mask-image: radial-gradient(circle at bottom left, black 0%, transparent 80%);
	}

	.morph-large-content {
		opacity: calc(1 - min(1, var(--morph-progress) * 2));
	}

	.morph-compact-content {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		width: var(--compact-width);
		display: flex;
		align-items: center;
		z-index: 30;
		opacity: calc(max(0, (var(--morph-progress) - 0.4) * 2.5));
	}

	.compact-progress {
		bottom: calc((var(--large-height) - var(--compact-height)) / 2);
	}

	.vapor-container {
		mix-blend-mode: plus-lighter;
		opacity: calc((1 - var(--morph-progress)) * 0.95);
		z-index: 5;
		mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.5) 40%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.5) 40%,
			transparent 100%
		);
	}

	.liquid-filter-wrapper {
		filter: url(#liquid-waveform);
		transform: translateZ(0);
	}

	.liquid-line {
		position: absolute;
		width: 300%;
		height: 120px;
		bottom: -60px;
		border-radius: 50%;
		will-change: transform;
	}

	.line-back {
		left: -100%;
		background: linear-gradient(
			90deg,
			rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 0%,
			color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 60%, white) 30%,
			rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 70%,
			color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 90%, black) 100%
		);
		animation: flow-liquid-back 4s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
		opacity: 0.7;
	}

	.line-front {
		left: -50%;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 80%, black) 0%,
			rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 40%,
			color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 40%, white) 70%,
			rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 100%
		);
		animation: flow-liquid-front 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
		opacity: 0.85;
	}

	@keyframes flow-liquid-back {
		0% {
			transform: translateX(0) translateY(-10px) scaleY(1);
		}
		100% {
			transform: translateX(35%) translateY(25px) scaleY(1.6);
		}
	}

	@keyframes flow-liquid-front {
		0% {
			transform: translateX(0) scaleY(1.3) translateY(20px);
		}
		100% {
			transform: translateX(-35%) scaleY(0.7) translateY(-25px);
		}
	}

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
