<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';
	import { getLanyard } from '$lib/stores/lanyard.svelte';
	import { formatDuration, getPlayback, type getActivity } from '$lib/presence';
	import { presenceTransition, swapText } from '$lib/presence-motion';
	import '$lib/styles/presence-motion.css';
	import ActivityArtwork from './core/activity-artwork.svelte';
	import ProcessingWave from './core/processing-wave.svelte';

	const presence = getLanyard();
	let {
		morphProgress = 0,
		active = true,
		activity
	}: {
		morphProgress?: number;
		active?: boolean;
		activity: ReturnType<typeof getActivity>;
	} = $props();
	let playback = $derived(activity?.music ? getPlayback(activity.timestamps, presence.now) : null);
	let compact = $derived(morphProgress > 0.5);
	let detailOpacity = $derived(Math.max(0, 1 - morphProgress * 3));
	let contentLeft = $derived(92 - 36 * morphProgress);
</script>

<div
	class="presence"
	class:has-activity={!!activity}
	class:compact
	in:presenceTransition|global={{ collapse: !activity && compact, active }}
	out:presenceTransition|global={{ collapse: !activity && compact, active }}
	onoutrostart={(event) => (event.currentTarget.inert = true)}
	onintrostart={(event) => (event.currentTarget.inert = false)}
	style:--presence-accent={`rgb(${presence.color.r} ${presence.color.g} ${presence.color.b})`}
	role="group"
	aria-label="Discord presence"
>
	{#if activity}
		<div
			class="activity-meta"
			style:left="{contentLeft}px"
			style:opacity={detailOpacity}
			aria-hidden={compact}
		>
			<span class="status-dot" data-status={presence.status}></span>
			<span
				class="t-text-swap"
				use:swapText={activity.music ? `Listening on ${activity.service}` : presence.label}
			></span>
		</div>

		<svelte:element
			this={activity.href ? 'a' : 'div'}
			class="activity-row"
			href={activity.href ?? undefined}
			target={activity.href ? '_blank' : undefined}
			rel={activity.href ? 'noopener noreferrer' : undefined}
			aria-label={activity.href
				? `Listen to ${activity.title} by ${activity.subtitle} on Spotify (opens in a new tab)`
				: undefined}
		>
			<div class="artwork" style:transform={`scale(${1 - morphProgress * 0.45})`}>
				<ActivityArtwork image={activity.image} music={activity.music} />
			</div>
			<div
				class="activity-copy"
				style:left="{contentLeft}px"
				style:transform={`translateY(${8 * morphProgress}px)`}
			>
				<p
					class="activity-title"
					style:font-size="{17 - 3 * morphProgress}px"
					title={activity.title}
				>
					<span class="title-text t-text-swap" use:swapText={activity.title}></span>
					{#if activity.href}
						<span class="link-hint" aria-hidden="true"
							><HugeiconsIcon icon={ArrowUpRight01Icon} size={12} /></span
						>
					{/if}
				</p>
				{#if activity.subtitle}
					<p
						class="activity-subtitle"
						style:font-size="{13 - morphProgress}px"
						title={activity.subtitle}
					>
						<span class="subtitle-text t-text-swap" use:swapText={activity.subtitle}></span>
					</p>
				{/if}
			</div>
		</svelte:element>

		{#if activity.music && playback}
			{#key activity.href ?? `${activity.title}:${activity.subtitle}`}
				<div
					class="playback"
					style:left="{contentLeft}px"
					style:transform={`translateY(${-3 * morphProgress}px)`}
				>
					<div
						class="progress-track"
						role="progressbar"
						aria-label="Track progress"
						aria-valuemin={0}
						aria-valuemax={Math.floor(playback.duration / 1000)}
						aria-valuenow={Math.floor(playback.elapsed / 1000)}
						aria-valuetext={`${formatDuration(playback.elapsed)} of ${formatDuration(playback.duration)}`}
					>
						<!-- The fill and light share one transform, so neither can extend past playback. -->
						<div class="progress-fill" style:transform={`scaleX(${playback.progress})`}>
							<div class="processing-light" style:transform={`scaleY(${1 - morphProgress * 0.5})`}>
								<ProcessingWave
									color={presence.color}
									active={active && playback.progress > 0 && playback.progress < 1}
								/>
							</div>
						</div>
					</div>
					<div class="timestamps" style:opacity={detailOpacity} aria-hidden="true">
						<span>{formatDuration(playback.elapsed)}</span>
						<span>{formatDuration(playback.duration)}</span>
					</div>
				</div>
			{/key}
		{/if}
	{:else}
		<div class="idle-status" role="status">
			<span class="status-dot" data-status={presence.status}></span>
			<span
				class="t-text-swap"
				use:swapText={presence.label + (presence.connected ? ' on Discord' : '')}
			></span>
		</div>
	{/if}
</div>

<style>
	.presence {
		--presence-open-dur: 250ms;
		--presence-close-dur: 150ms;
		color: #f5f5f7;
		font-family: -apple-system, BlinkMacSystemFont, 'Inter Variable', sans-serif;
		font-size: 12px;
		line-height: 1.4;
		font-optical-sizing: auto;
		text-shadow: 0 1px 6px rgb(0 0 0 / 0.35);
	}
	.has-activity {
		position: relative;
		width: var(--presence-width, 304px);
		max-width: 100%;
		height: 88px;
	}
	.activity-meta,
	.idle-status {
		display: flex;
		align-items: center;
		gap: 6px;
		color: rgb(245 245 247 / 0.65);
		white-space: nowrap;
	}
	.idle-status {
		min-height: 20px;
	}
	.compact .idle-status {
		min-height: 16px;
		font-size: 11px;
		gap: 5px;
	}
	.activity-meta {
		position: absolute;
		top: 0;
		right: 0;
		height: 14px;
		font-size: 10px;
	}
	.activity-meta > span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.status-dot {
		flex: 0 0 5px;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #92949b;
		transition: background-color 250ms ease;
	}
	.status-dot[data-status='online'] {
		background: #55c58a;
	}
	.status-dot[data-status='idle'] {
		background: #e9b85c;
	}
	.status-dot[data-status='dnd'] {
		background: #f07178;
	}
	.activity-row {
		position: absolute;
		inset: 0;
		color: inherit;
		text-decoration: none;
		border-radius: 12px;
	}
	.artwork {
		position: absolute;
		top: 4px;
		left: 0;
		display: grid;
		place-items: center;
		width: 80px;
		height: 80px;
		overflow: hidden;
		border-radius: 10px;
		transform-origin: left center;
		background: rgb(255 255 255 / 0.06);
		box-shadow:
			0 0 0 1px rgb(255 255 255 / 0.1),
			0 4px 12px rgb(0 0 0 / 0.2);
		color: rgb(245 245 247 / 0.6);
	}
	.activity-copy {
		position: absolute;
		top: 18px;
		right: 0;
		min-width: 0;
	}
	.activity-title {
		display: flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		letter-spacing: -0.025em;
		line-height: 1.25;
	}
	.title-text,
	.subtitle-text {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.link-hint {
		flex: 0 0 auto;
		opacity: 0;
		color: rgb(245 245 247 / 0.6);
		transition: opacity 160ms ease;
	}
	.activity-subtitle {
		margin-top: 2px;
		line-height: 1.35;
		color: rgb(245 245 247 / 0.65);
		display: flex;
	}
	a.activity-row:focus-visible {
		outline: 2px solid #f5f5f7;
		outline-offset: 5px;
	}
	a.activity-row:focus-visible .link-hint {
		opacity: 1;
	}
	.compact a.activity-row:focus-visible {
		outline-offset: -6px;
	}
	.playback {
		position: absolute;
		top: 68px;
		right: 0;
	}
	.progress-track {
		position: relative;
		height: 3px;
		border-radius: 3px;
		background: rgb(245 245 247 / 0.16);
	}
	.progress-fill {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		transform-origin: left;
		background: color-mix(in srgb, var(--presence-accent) 30%, #f5f5f7);
		transition: transform 1s linear;
	}
	.processing-light {
		position: absolute;
		inset-inline: 0;
		bottom: 100%;
		height: 24px;
		overflow: hidden;
		transform-origin: bottom;
		opacity: 0.7;
		pointer-events: none;
	}
	.timestamps {
		display: flex;
		justify-content: space-between;
		margin-top: 4px;
		font-size: 10px;
		line-height: 1.2;
		font-variant-numeric: tabular-nums;
		color: rgb(245 245 247 / 0.5);
	}
	.compact .activity-meta {
		visibility: hidden;
	}
	@media (hover: hover) and (pointer: fine) {
		a.activity-row:hover .link-hint {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.progress-fill,
		.status-dot {
			transition: none;
		}
	}
</style>
