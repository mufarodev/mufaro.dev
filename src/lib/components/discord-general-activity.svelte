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

	function getActivityIcon(type: number) {
		if (type === 3) return EyeIcon;
		if (type === 0 || type === 1) return GameController01Icon;
		return ActivityIcon;
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

	function toImageUrl(imageKey: string, applicationId: string): string {
		if (imageKey.startsWith('mp:external/')) {
			return imageKey.replace('mp:external/', 'https://media.discordapp.net/external/');
		} else if (imageKey.startsWith('spotify:')) {
			return `https://i.scdn.co/image/${imageKey.replace('spotify:', '')}`;
		} else {
			return `https://cdn.discordapp.com/app-assets/${applicationId}/${imageKey}.png`;
		}
	}

	const largeImage = $derived(
		activity.assets?.large_image
			? toImageUrl(activity.assets.large_image, activity.application_id)
			: null
	);
</script>

<div class="relative mt-4 space-y-4">
	<div
		class="absolute -top-1 -right-1 z-20 inline-flex items-center justify-center rounded-lg bg-white/10 p-2 backdrop-blur-sm transition-all duration-300 group-hover:scale-110"
	>
		<HugeiconsIcon icon={getActivityIcon(activity.type)} size={16} className="text-white/70" />
	</div>

	<div class="relative z-20 flex items-center gap-3">
		{#if largeImage}
			<img
				src={largeImage}
				alt={activity.name}
				class="h-18 w-18 shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-white/10"
			/>
		{/if}
		<div class="min-w-0 flex-1 space-y-0.5">
			<h3 class="truncate text-base font-semibold tracking-tight text-white/95">
				{activity.name}
			</h3>
			{#if activity.details}
				<p class="truncate text-sm text-white/70">
					{activity.details}
				</p>
			{/if}
			{#if activity.state}
				<p class="truncate text-sm text-white/50">
					{activity.state}
				</p>
			{/if}
		</div>
	</div>

	{#if activity.timestamps?.start}
		<p class="relative z-20 text-[10px] font-medium text-white/40">
			Started {formatDuration(Date.now() - activity.timestamps.start)} ago
		</p>
	{/if}
</div>
