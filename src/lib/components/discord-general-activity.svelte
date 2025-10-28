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

<div class="space-y-3">
	<div
		class="absolute top-4 right-4 inline-flex items-center justify-center rounded-lg p-2 transition-all duration-300 group-hover:scale-110 {getIconBg(
			activity.type
		)}"
	>
		<HugeiconsIcon icon={getActivityIcon(activity.type)} size={18} />
	</div>

	<div class="flex items-start gap-3">
		{#if largeImage}
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

	{#if activity.timestamps?.start}
		<p class="text-[10px] font-medium text-muted-foreground">
			Started {formatDuration(Date.now() - activity.timestamps.start)} ago
		</p>
	{/if}
</div>
