<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getLanyard } from '$lib/stores/lanyard';

	const lanyard = getLanyard();

	const statusColors = {
		online: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
		idle: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]',
		dnd: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
		offline: 'bg-gray-500'
	};

	const statusLabels = {
		online: 'Online',
		idle: 'Away',
		dnd: 'DND',
		offline: 'Offline'
	};

	let data = $derived(lanyard.data);
	let status = $derived(data?.discord_status || 'offline');
	let activity = $derived(data?.activities?.find((a) => a.type !== 4)); // Get non-custom status if any
	let customStatus = $derived(data?.activities?.find((a) => a.type === 4));
</script>

<div
	class="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md transition-colors hover:bg-white/10"
>
	<!-- Status Dot -->
	<div class="relative flex items-center justify-center">
		<div class="h-2.5 w-2.5 rounded-full {statusColors[status as keyof typeof statusColors]}"></div>
	</div>

	<!-- Text Info -->
	<div class="flex flex-col text-xs leading-none">
		{#if activity}
			<span class="max-w-[120px] truncate font-medium text-white">{activity.name}</span>
			<span class="max-w-[120px] truncate text-[10px] text-white/50"
				>{activity.details ||
					activity.state ||
					statusLabels[status as keyof typeof statusLabels]}</span
			>
		{:else if customStatus}
			<span class="max-w-[120px] truncate font-medium text-white">{customStatus.state}</span>
		{:else}
			<span class="font-medium text-white">{statusLabels[status as keyof typeof statusLabels]}</span
			>
		{/if}
	</div>
</div>
