<script lang="ts">
	import { useLanyard } from 'sveltekit-lanyard';
	import DiscordActivity from './discord-activity.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Loading03Icon } from '@hugeicons/core-free-icons';
	import DiscordGeneralActivity from './discord-general-activity.svelte';
	import DiscordMusicActivity from './discord-music-activity.svelte';
	import { getContrastColor } from '$lib/utils';

	interface Props {
		onAccentColorChange?: (color: { r: number; g: number; b: number } | null) => void;
	}

	let { onAccentColorChange }: Props = $props();

	const userId = '769702535124090904';

	const lanyard = useLanyard({
		connectionType: 'ws',
		subscriptionScope: { subscribe_to_id: userId }
	});

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

	let connected = $derived(lanyard.connected);
	let data = $derived(lanyard.data);
	let error = $derived(lanyard.error);

	let textContrastColor = $state<'black' | 'white'>('white');

	function handleAccentColorChange(color: { r: number; g: number; b: number } | null) {
		if (color) {
			textContrastColor = getContrastColor(color.r, color.g, color.b);
		} else {
			textContrastColor = 'white';
		}
		onAccentColorChange?.(color);
	}

	let latestActivity = $derived(
		data?.activities && data.activities.length > 0
			? data.activities[data.activities.length - 1]
			: null
	);

	$effect(() => {
		if (!latestActivity || latestActivity.type !== 2) {
			textContrastColor = 'white';
			onAccentColorChange?.(null);
		}
	});
</script>

<div class="group relative">
	<div
		class="absolute -inset-[1.5px] rounded-[17px] bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15"
	></div>

	<div
		class="relative flex h-full flex-col overflow-hidden rounded-2xl bg-black/40 p-5 backdrop-blur-md transition-all duration-300 group-hover:bg-black/50 {textContrastColor ===
		'black'
			? ''
			: ''}"
	>
		{#if !connected}
			<div class="flex items-center gap-2">
				<span
					class="animate-spin {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}"
				>
					<HugeiconsIcon icon={Loading03Icon} size={18} />
				</span>
				<p class="text-sm {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}">
					Connecting to Discord...
				</p>
			</div>
		{:else if data}
			<div class="flex flex-1 flex-col justify-between gap-4">
				<div class="relative z-50 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="relative">
							<div class="h-2 w-2 rounded-full {statusColors[data.discord_status]}"></div>
							<div
								class="absolute inset-0 h-2 w-2 animate-ping rounded-full duration-300 {statusColors[
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
				</div>

				{#if latestActivity}
					{#if latestActivity.type == 2}
						<DiscordMusicActivity
							activity={latestActivity}
							onAccentColorChange={handleAccentColorChange}
						/>
					{:else}
						<DiscordGeneralActivity activity={latestActivity} />
					{/if}
				{:else}
					<div class="space-y-3 py-3">
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
		{:else if error}
			<div class="space-y-2">
				<p class="text-sm font-semibold text-red-400">Connection error</p>
				<p class="text-xs {textContrastColor === 'black' ? 'text-black/60' : 'text-white/60'}">
					Unable to fetch Discord status
				</p>
			</div>
		{/if}
	</div>
</div>
