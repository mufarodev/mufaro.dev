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
		online: 'bg-[#23a55a]',
		idle: 'bg-[#f0b232]',
		dnd: 'bg-[#f23f43]',
		offline: 'bg-[#80848e]'
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
	<!-- Background blur layer that perfectly matches the clipped pill shape to prevent blur bleed -->
	<div class="morph-bg-blur"></div>

	<div
		class="morph-content relative overflow-hidden"
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
						baseFrequency="0.003 0.01"
						numOctaves="2"
						seed="42"
						result="noise"
					/>
					<feDisplacementMap
						in="SourceGraphic"
						in2="noise"
						scale="70"
						xChannelSelector="R"
						yChannelSelector="G"
						result="displaced"
					/>
					<feGaussianBlur in="displaced" stdDeviation="24" result="glow" />
					<feGaussianBlur in="displaced" stdDeviation="6" result="sharp" />
					<feMerge>
						<feMergeNode in="glow" />
						<feMergeNode in="glow" />
						<feMergeNode in="sharp" />
					</feMerge>
				</filter>
			</svg>

			<div
				class="vapor-container pointer-events-none absolute inset-x-0 bottom-0 h-[180px] overflow-hidden rounded-b-md"
			>
				<div class="liquid-filter-wrapper absolute inset-0 h-full w-full">
					<svg
						class="wave-svg line-back pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
						viewBox="0 0 3600 180"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient id="grad-back" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.7)"
								/>
								<stop
									offset="100%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0)"
								/>
							</linearGradient>
						</defs>
						<path
							fill="url(#grad-back)"
							stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 80%, white)"
							stroke-width="2"
							d="M 0,140 C 450,90 450,190 900,140 C 1350,90 1350,190 1800,140 C 2250,90 2250,190 2700,140 C 3150,90 3150,190 3600,140 L 3600,180 L 0,180 Z"
						/>
					</svg>

					<svg
						class="wave-svg line-mid pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
						viewBox="0 0 3600 180"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient id="grad-mid" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.85)"
								/>
								<stop
									offset="100%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0)"
								/>
							</linearGradient>
						</defs>
						<path
							fill="url(#grad-mid)"
							stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 90%, white)"
							stroke-width="2.5"
							d="M 0,145 C 300,105 300,185 600,145 C 900,105 900,185 1200,145 C 1500,105 1500,185 1800,145 C 2100,105 2100,185 2400,145 C 2700,105 2700,185 3000,145 C 3300,105 3300,185 3600,145 L 3600,180 L 0,180 Z"
						/>
					</svg>

					<svg
						class="wave-svg line-front pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
						viewBox="0 0 3600 180"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient id="grad-front" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="0%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.95)"
								/>
								<stop
									offset="100%"
									stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0)"
								/>
							</linearGradient>
						</defs>
						<path
							fill="url(#grad-front)"
							stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 95%, white)"
							stroke-width="3"
							d="M 0,150 C 225,120 225,180 450,150 C 675,120 675,180 900,150 C 1125,120 1125,180 1350,150 C 1575,120 1575,180 1800,150 C 2025,120 2025,180 2250,150 C 2475,120 2475,180 2700,150 C 2925,120 2925,180 3150,150 C 3375,120 3375,180 3600,150 L 3600,180 L 0,180 Z"
						/>
					</svg>
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
								<div
									class="flex justify-between text-[10px] font-semibold text-white/90"
									style="text-shadow: 0 1px 2px rgba(0,0,0,0.65);"
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
				{#if musicActivity}
					<div
						class="compact-vapor absolute bottom-0 left-0 h-full pointer-events-none overflow-hidden"
						style="
							width: {progress}%;
							transition: width 0.3s ease;
						"
					>
						<div class="h-full w-full" style="mask-image: linear-gradient(to left, transparent 0px, black 32px); -webkit-mask-image: linear-gradient(to left, transparent 0px, black 32px);">
							<div class="liquid-filter-wrapper absolute inset-y-0 left-0" style="width: var(--compact-width);">
							<svg
								class="wave-svg line-back pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
								viewBox="0 0 3600 180"
								preserveAspectRatio="none"
							>
								<defs>
									<linearGradient id="grad-back-compact" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.9)" />
										<stop offset="100%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.2)" />
									</linearGradient>
								</defs>
								<path
									fill="url(#grad-back-compact)"
									stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 90%, white)"
									stroke-width="3"
									d="M 0,140 C 450,90 450,190 900,140 C 1350,90 1350,190 1800,140 C 2250,90 2250,190 2700,140 C 3150,90 3150,190 3600,140 L 3600,180 L 0,180 Z"
								/>
							</svg>
							<svg
								class="wave-svg line-mid pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
								viewBox="0 0 3600 180"
								preserveAspectRatio="none"
							>
								<defs>
									<linearGradient id="grad-mid-compact" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1)" />
										<stop offset="100%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.3)" />
									</linearGradient>
								</defs>
								<path
									fill="url(#grad-mid-compact)"
									stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 95%, white)"
									stroke-width="3.5"
									d="M 0,145 C 300,105 300,185 600,145 C 900,105 900,185 1200,145 C 1500,105 1500,185 1800,145 C 2100,105 2100,185 2400,145 C 2700,105 2700,185 3000,145 C 3300,105 3300,185 3600,145 L 3600,180 L 0,180 Z"
								/>
							</svg>
							<svg
								class="wave-svg line-front pointer-events-none absolute inset-y-0 h-full w-[300%] select-none"
								viewBox="0 0 3600 180"
								preserveAspectRatio="none"
							>
								<defs>
									<linearGradient id="grad-front-compact" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 1)" />
										<stop offset="100%" stop-color="rgba(var(--accent-r), var(--accent-g), var(--accent-b), 0.4)" />
									</linearGradient>
								</defs>
								<path
									fill="url(#grad-front-compact)"
									stroke="color-mix(in srgb, rgb(var(--accent-r), var(--accent-g), var(--accent-b)) 100%, white)"
									stroke-width="4"
									d="M 0,150 C 225,120 225,180 450,150 C 675,120 675,180 900,150 C 1125,120 1125,180 1350,150 C 1575,120 1575,180 1800,150 C 2025,120 2025,180 2250,150 C 2475,120 2475,180 2700,150 C 2925,120 2925,180 3150,150 C 3375,120 3375,180 3600,150 L 3600,180 L 0,180 Z"
								/>
							</svg>
							</div>
						</div>
					</div>
				{/if}

				<div class="relative z-20 flex h-full w-full items-center gap-3 px-3">
					<!-- Icon / Image -->
					{#if (musicActivity && largeImage) || (latestActivity && generalActivityLargeImage)}
						<div class="relative shrink-0 flex items-center justify-center">
							{#if musicActivity && largeImage}
								<img
									src={largeImage}
									alt={musicActivity.name}
									class="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10"
								/>
							{:else if latestActivity && generalActivityLargeImage}
								<img
									src={generalActivityLargeImage}
									alt={latestActivity.name}
									class="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/10"
								/>
							{/if}
						</div>
					{/if}

					<!-- Details -->
					<div class="flex min-w-0 flex-1 flex-col justify-center text-sm leading-tight">
						{#if musicActivity}
							<div class="flex items-center gap-1.5 mb-0.5">
								<span class="truncate font-semibold text-white/95"
									>{musicActivity.details}</span
								>
							</div>
							<div class="flex items-center gap-1.5 text-xs text-white/70">
								<span class="truncate">{musicActivity.state}</span>
								{#if musicActivity.timestamps?.start}
									<span class="opacity-50">•</span>
									<span class="font-medium shrink-0">{currentTime}</span>
								{/if}
							</div>
						{:else if latestActivity}
							<span class="truncate font-semibold text-white/95 mb-0.5">{latestActivity.name}</span>
							<span class="truncate text-xs text-white/70">
								{[latestActivity.details, latestActivity.state].filter(Boolean).join(' • ') ||
									statusLabelsCompact[status as keyof typeof statusLabelsCompact]}
							</span>
						{:else}
							<span class="font-semibold text-white/95"
								>{statusLabels[status as keyof typeof statusLabels]}</span
							>
						{/if}
					</div>

					<!-- Right Edge Icons -->
					<div class="flex items-center gap-2.5 shrink-0 pr-1">
						{#if musicActivity}
							<HugeiconsIcon icon={MusicNote01Icon} size={16} className="text-white/80" />
						{/if}
					</div>
				</div>

				{#if musicActivity}
					<div class="compact-progress">
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
		--compact-width: 320px;
		--large-height: var(--dynamic-large-height, 180px);
		--compact-height: 56px;
		--large-radius: 17px;
		--compact-radius: 28px;
		--large-padding: 16px;
		--compact-padding: 8px;
	}

	@media (max-width: 1024px) {
		.morph-container {
			--large-width: 340px;
			--compact-width: 280px;
		}
	}

	@media (max-width: 768px) {
		.morph-container {
			--large-width: min(80vw, 320px);
			--compact-width: min(70vw, 240px);
			--large-padding: 16px;
		}
	}

	.morph-content {
		position: relative;
		z-index: 20;
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
	}

	.morph-bg-blur {
		position: absolute;
		top: calc((var(--large-height) - var(--compact-height)) / 2 * var(--morph-progress, 0));
		right: 0;
		bottom: calc((var(--large-height) - var(--compact-height)) / 2 * var(--morph-progress, 0));
		left: calc((var(--large-width) - var(--compact-width)) * var(--morph-progress, 0));
		border-radius: calc(
			var(--large-radius) + (var(--compact-radius) - var(--large-radius)) *
				var(--morph-progress, 0)
		);
		background-color: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		pointer-events: none;
		transition: background-color 0.3s ease;
		z-index: 10;
	}

	.group:hover .morph-bg-blur {
		background-color: rgba(0, 0, 0, 0.5);
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
		top: calc((var(--large-height) - var(--compact-height)) / 2);
		height: var(--compact-height);
		right: 0;
		width: var(--compact-width);
		display: flex;
		align-items: center;
		z-index: 30;
		opacity: calc(max(0, (var(--morph-progress) - 0.4) * 2.5));
	}

	.compact-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		overflow: hidden;
	}

	.vapor-container {
		mix-blend-mode: plus-lighter;
		opacity: calc((1 - var(--morph-progress)) * 0.98);
		z-index: 5;
		mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.85) 35%,
			transparent 75%
		);
		-webkit-mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.85) 35%,
			transparent 75%
		);
	}

	.compact-vapor {
		mix-blend-mode: screen;
		z-index: 5;
		mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.8) 60%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to top,
			rgba(0, 0, 0, 1) 0%,
			rgba(0, 0, 0, 0.8) 60%,
			transparent 100%
		);
	}

	.liquid-filter-wrapper {
		filter: url(#liquid-waveform);
		transform: translateZ(0);
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
	}

	.wave-svg {
		position: absolute;
		top: 0;
		height: 100%;
		width: 300%;
		will-change: transform;
	}

	.line-back {
		left: -200%;
		animation: flow-wave-back 32s ease-in-out infinite alternate;
		opacity: 0.65;
	}

	.line-mid {
		left: -150%;
		animation: flow-wave-mid 24s ease-in-out infinite alternate;
		opacity: 0.8;
	}

	.line-front {
		left: -100%;
		animation: flow-wave-front 18s ease-in-out infinite alternate;
		opacity: 0.95;
	}

	@keyframes flow-wave-back {
		0% {
			transform: translateX(0) translateY(12px) scaleY(0.95);
		}
		100% {
			transform: translateX(50%) translateY(28px) scaleY(1.15);
		}
	}

	@keyframes flow-wave-mid {
		0% {
			transform: translateX(0) translateY(15px) scaleY(0.9);
		}
		100% {
			transform: translateX(-50%) translateY(32px) scaleY(1.1);
		}
	}

	@keyframes flow-wave-front {
		0% {
			transform: translateX(0) translateY(18px) scaleY(0.85);
		}
		100% {
			transform: translateX(50%) translateY(35px) scaleY(1.05);
		}
	}

</style>
