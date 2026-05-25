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
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	function getActivityIcon(type: number) {
		if (type === 3) return EyeIcon;
		if (type === 0 || type === 1) return GameController01Icon;
		return ActivityIcon;
	}

	function getActivityText(type: number) {
		if (type === 0) return 'Playing';
		if (type === 1) return 'Streaming';
		if (type === 2) return 'Listening to';
		if (type === 3) return 'Watching';
		return 'Playing';
	}

	function getActivityColor(type: number) {
		if (type === 3) return 'from-purple-500/10 to-purple-600/5';
		if (type === 0 || type === 1) return 'from-purple-500/10 to-purple-600/5';
		return 'from-blue-500/10 to-blue-600/5';
	}

	function getIconBg(type: number) {
		if (type === 3) return 'bg-purple-500/10 group-hover:bg-purple-500/15';
		if (type === 0 || type === 1) return 'bg-purple-500/10 group-hover:bg-purple-500/15';
		return 'bg-blue-500/10 group-hover:bg-blue-500/15';
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
		activity.assets?.large_image
			? toImageUrl(activity.assets.large_image, activity.application_id)
			: null
	);

	const smallImage = $derived(
		activity.assets?.small_image
			? toImageUrl(activity.assets.small_image, activity.application_id)
			: null
	);

	let elapsedTime = $state('0:00');

	const startTimestamp = $derived(activity.timestamps?.start);

	$effect(() => {
		if (startTimestamp) {
			const timer = setInterval(() => {
				const current = Date.now();
				const elapsed = current - startTimestamp;
				elapsedTime = formatDuration(elapsed);
			}, 1000);

			return () => clearInterval(timer);
		}
	});
</script>

<div class="relative mt-4 space-y-4">
	<div class="flex items-center justify-between">
		<span class="text-xs font-bold tracking-wider text-white/70 uppercase">
			{getActivityText(activity.type)}
		</span>
		<HugeiconsIcon icon={getActivityIcon(activity.type)} size={16} className="text-white/70" />
	</div>

	<div class="relative z-20 flex items-start gap-4">
		{#if largeImage}
			<div class="relative shrink-0">
				<img
					src={largeImage}
					alt={activity.name}
					class="h-16 w-16 rounded-xl object-cover shadow-lg ring-1 ring-white/10"
				/>
				{#if smallImage}
					<div class="absolute -right-1.5 -bottom-1.5 rounded-full bg-zinc-900 p-0.5">
						<img
							src={smallImage}
							alt="Small activity icon"
							class="h-6 w-6 rounded-full object-cover"
						/>
					</div>
				{/if}
			</div>
		{/if}
		<div class="min-w-0 flex-1 space-y-0.5">
			<h3 class="truncate text-base font-bold tracking-tight text-white/95">
				{activity.name}
			</h3>
			{#if activity.details}
				<p class="truncate text-sm text-white/80">
					{activity.details}
				</p>
			{/if}
			{#if activity.state}
				<p class="truncate text-sm text-white/80">
					{activity.state}
				</p>
			{/if}
			{#if activity.timestamps?.start}
				<div class="flex items-center gap-1.5 pt-0.5">
					<HugeiconsIcon icon={GameController01Icon} size={14} className="text-green-400" />
					<p class="text-xs font-medium text-green-400">
						{elapsedTime}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
