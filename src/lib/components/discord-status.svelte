<script lang="ts">
	import { useLanyard } from 'sveltekit-lanyard';
	import DiscordActivity from './discord-activity.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Loading03Icon } from '@hugeicons/core-free-icons';
	import DiscordGeneralActivity from './discord-general-activity.svelte';
	import DiscordMusicActivity from './discord-music-activity.svelte';

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

	let latestActivity = $derived(
		data?.activities && data.activities.length > 0
			? data.activities[data.activities.length - 1]
			: null
	);
</script>

<div
	class="group flex flex-col space-y-3 overflow-hidden rounded-xl bg-muted/30 p-4 transition-all duration-300"
>
	{#if !connected}
		<div class="flex items-center gap-2">
			<span class="animate-spin text-muted-foreground">
				<HugeiconsIcon icon={Loading03Icon} size={18} />
			</span>
			<p class="text-sm text-muted-foreground">Connecting to Discord...</p>
		</div>
	{:else if data}
		<div class="space-y-3">
			<div class="relative z-20 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="relative">
						<div class="h-2 w-2 rounded-full {statusColors[data.discord_status]}"></div>
						<div
							class="absolute inset-0 h-2 w-2 animate-ping rounded-full duration-300 {statusColors[
								data.discord_status
							]} opacity-75"
						></div>
					</div>
					<span class="text-xs font-medium text-muted-foreground">
						{statusLabels[data.discord_status]}
					</span>
				</div>
			</div>

			{#if latestActivity}
				{#if latestActivity.type == 2}
					<DiscordMusicActivity activity={latestActivity} />
				{:else}
					<DiscordGeneralActivity activity={latestActivity} />
				{/if}
			{:else}
				<div class="space-y-2 py-2">
					<p class="text-sm font-semibold text-foreground">No activity</p>
					<p class="text-xs text-muted-foreground">Just vibing at the moment</p>
				</div>
			{/if}
		</div>
	{:else if error}
		<div class="space-y-2">
			<p class="text-sm font-semibold text-destructive">Connection error</p>
			<p class="text-xs text-muted-foreground">Unable to fetch Discord status</p>
		</div>
	{/if}
</div>
