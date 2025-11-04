<script lang="ts">
	import MatteCard from '$lib/components/shared/matte-card.svelte';
	import DiscordStatus from './discord-status.svelte';
</script>

<div class="grid gap-6 sm:grid-cols-2">
	<MatteCard class="p-6">
		<div class="mb-4">
			<h3 class="mb-2 text-lg font-semibold">Now Playing</h3>
			<p class="text-sm text-muted-foreground">Live from Discord</p>
		</div>
		<DiscordStatus />
	</MatteCard>

	<MatteCard class="p-6">
		<div class="mb-4">
			<h3 class="mb-2 text-lg font-semibold">Currently Working On</h3>
			<p class="text-sm text-muted-foreground">Active projects</p>
		</div>
		<div class="space-y-3">
			<div class="flex items-start gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
				>
					💼
				</div>
				<div>
					<p class="text-sm font-medium">Job Search</p>
					<p class="text-xs text-muted-foreground">Looking for full-time opportunities</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent"
				>
					🚀
				</div>
				<div>
					<p class="text-sm font-medium">Portfolio Redesign</p>
					<p class="text-xs text-muted-foreground">Elevating the premium feel</p>
				</div>
			</div>
		</div>
	</MatteCard>
</div>
