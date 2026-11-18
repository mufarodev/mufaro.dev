<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { getLanyard } from '$lib/stores/lanyard.svelte';
	import { formatDuration, getPlayback, statusLabels } from '$lib/presence';
	import ActivityArtwork from './activity-artwork.svelte';
	import SwapText from './swap-text.svelte';

	const presence = getLanyard();
	const moods = {
		online: '(˶ᵔ ᵕ ᵔ˶)',
		idle: '( ˘ω˘ ) zZ',
		dnd: '(ง •̀_•́)ง',
		offline: '( -_-) zzZ'
	};
	const TICKS = 48;
	// Same 4x4 Bayer matrix as the hero art, at 2 CSS pixels per dither pixel.
	const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
	const PIXEL = 2;
	// How quickly the shown progress chases the real one, in ms. Short enough to be invisible
	// during playback, long enough that a track change reads as a sweep.
	const SMOOTH = 150;

	let activity = $derived(presence.activity);
	let playback = $derived(activity?.music ? getPlayback(activity.timestamps, presence.now) : null);
	let title = $derived(activity?.title ?? presence.label);
	let subtitle = $derived(activity ? activity.subtitle : moods[presence.status]);
	let song = $derived(activity ? (activity.href ?? `${activity.title}:${activity.subtitle}`) : '');
	let bars = $derived(waveform(song));
	let start = $derived(activity?.timestamps?.start);
	let end = $derived(activity?.timestamps?.end);
	let ticks = $state<HTMLElement>();
	// Survives effect reruns, so a new track sweeps from wherever the last one had got to.
	let shown: number | undefined;

	// One loop drives the whole meter through three CSS variables (--p playhead, --x its position,
	// --t time), so ticks light, grow and breathe continuously instead of switching on once a second.
	$effect(() => {
		const el = ticks;
		if (!el || start === undefined || end === undefined || end <= start) return;
		const [from, to, bar] = [start, end, el];
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const goal = () => Math.min(1, Math.max(0, (Date.now() - from) / (to - from))) * TICKS;
		let frame = 0;
		let timer = 0;
		let last = performance.now();
		shown = untrack(() => shown) ?? (still ? goal() : 0);

		function paint(time: number) {
			const dt = Math.min(time - last, 64);
			last = time;
			shown = still ? goal() : shown! + (goal() - shown!) * (1 - Math.exp(-dt / SMOOTH));
			const lead = Math.min(TICKS - 1, Math.max(0, shown - 0.5));
			bar.style.setProperty('--p', shown.toFixed(3));
			bar.style.setProperty('--x', `${(lead / (TICKS - 1)) * 100}%`);
			bar.style.setProperty('--t', still ? '0' : (time / 1000).toFixed(2));
		}
		const tick = (time: number) => {
			paint(time);
			frame = requestAnimationFrame(tick);
		};
		if (still) {
			paint(performance.now());
			timer = window.setInterval(() => paint(performance.now()), 1000);
		} else {
			frame = requestAnimationFrame(tick);
		}
		return () => {
			cancelAnimationFrame(frame);
			clearInterval(timer);
		};
	});

	// A made-up but stable waveform per song: seeded from the track, smoothed so it reads as audio.
	function waveform(seed: string) {
		let hash = 2166136261;
		for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
		const noise = Array.from({ length: TICKS }, () => {
			hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
			hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
			return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
		});
		return noise.map((value, i) => 0.3 + 0.7 * (value + (noise[i - 1] ?? value)) * 0.5);
	}

	// A glow from the artwork corner, drawn as ordered-dither dot density in the album colour.
	const dither: Attachment<HTMLCanvasElement> = (canvas) => {
		const { r, g, b } = presence.color;
		const observer = new ResizeObserver(() => {
			const width = Math.ceil(canvas.clientWidth / PIXEL);
			const height = Math.ceil(canvas.clientHeight / PIXEL);
			if (!width || !height) return;
			canvas.width = width;
			canvas.height = height;
			const context = canvas.getContext('2d')!;
			const image = context.createImageData(width, height);
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const glow = Math.max(0, 1 - Math.hypot((x / width) * 1.15, y / height));
					if (glow * glow * 0.75 <= (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16) continue;
					image.data.set([r, g, b, 255], (y * width + x) * 4);
				}
			}
			context.putImageData(image, 0, 0);
		});
		observer.observe(canvas);
		return () => observer.disconnect();
	};
</script>

{#snippet star(className: string)}
	<svg class={className} viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true">
		<path d="M3 0h1v2h1v1h2v1h-2v1h-1v2h-1v-2h-1v-1h-2v-1h2v-1h1z" />
		<rect x="3" y="3" width="1" height="1" fill="#fff" />
	</svg>
{/snippet}

<!-- Only mounted once Lanyard answers, so it animates in with real data instead of hydrating a placeholder. -->
{#if presence.avatar}
	<svelte:element
		this={activity?.href ? 'a' : 'div'}
		class="presence"
		class:is-avatar={!activity}
		href={activity?.href ?? undefined}
		target={activity?.href ? '_blank' : undefined}
		rel={activity?.href ? 'noopener noreferrer' : undefined}
		aria-label={activity?.href
			? `Listen to ${activity.title} by ${activity.subtitle} on Spotify (opens in a new tab)`
			: undefined}
		role={activity?.href ? undefined : 'status'}
		style:--presence-accent={`rgb(${presence.color.r} ${presence.color.g} ${presence.color.b})`}
	>
		<canvas class="dither" {@attach dither} aria-hidden="true"></canvas>
		<span class="screen">
			<span class="cover">
				<span class="artwork">
					<ActivityArtwork
						image={activity ? activity.image : presence.avatar}
						music={activity?.music ?? false}
					/>
				</span>
				<span class="status-dot" data-status={presence.status}></span>
			</span>

			<span class="copy">
				<span class="title" title={title}><SwapText class="clip" text={title} /></span>
				{#if subtitle}
					<span class="subtitle" title={subtitle}><SwapText class="clip" text={subtitle} /></span>
				{/if}
			</span>

			{#if playback && activity}
				<!-- Ring caps, a waveform that lights up as the song plays, and a star above and below
				     the playhead. -->
				<span
					class="meter"
					role="progressbar"
					aria-label="Track progress"
					aria-valuemin={0}
					aria-valuemax={Math.floor(playback.duration / 1000)}
					aria-valuenow={Math.floor(playback.elapsed / 1000)}
					aria-valuetext={`${formatDuration(playback.elapsed)} of ${formatDuration(playback.duration)}`}
				>
					<span class="cap"></span>
					<span class="ticks" bind:this={ticks}>
						{#each bars as height, i (i)}
							<span class="tick" style:--h={height} style:--i={i}></span>
						{/each}
						<span class="playhead">
							{@render star('mark')}
							{@render star('mark')}
						</span>
					</span>
					<span class="cap"></span>
				</span>
			{/if}
		</span>

		<span class="caption" aria-hidden="true">
			<span class="service">{activity?.service ?? 'discord'}</span>
			<span>
				{#if playback}
					<span class="time"
						>{formatDuration(playback.elapsed)}<i>/</i>{formatDuration(playback.duration)}</span
					>
				{:else}
					{statusLabels[presence.status].toLowerCase()}
				{/if}
				{#if activity?.href}↗{/if}
			</span>
		</span>
		{@render star('sticker')}
	</svelte:element>
{/if}

<style>
	.presence {
		position: relative;
		display: block;
		color: #f5f5f7;
		text-decoration: none;
		/* Smooth corners to sit inside the hero frame's 16px radius, inset by the 24px slot. */
		isolation: isolate;
		border-radius: 12px;
		background: #0b0b10;
		box-shadow:
			inset 0 0 0 1px rgb(242 238 234 / 0.08),
			0 12px 32px rgb(0 0 0 / 0.45);
	}
	.dither {
		position: absolute;
		inset: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		border-radius: inherit;
		opacity: 0.3;
		image-rendering: pixelated;
		pointer-events: none;
	}
	.screen {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 10px 14px;
		padding: 14px 14px 4px;
	}

	/* Entrance: the artwork pops in, then each line of copy follows. */
	.cover,
	.copy > :global(*) {
		animation: presence-in 450ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}
	.cover {
		animation-name: presence-pop;
		animation-delay: 60ms;
	}
	.copy > :global(:nth-child(1)) {
		animation-delay: 110ms;
	}
	.copy > :global(:nth-child(2)) {
		animation-delay: 160ms;
	}
	@keyframes presence-in {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translateY(6px);
		}
	}
	@keyframes presence-pop {
		from {
			opacity: 0;
			transform: scale(0.85);
		}
	}

	.cover {
		position: relative;
		flex: none;
	}
	.artwork {
		display: grid;
		width: 56px;
		height: 56px;
		overflow: hidden;
		border-radius: 4px;
		background: rgb(255 255 255 / 0.06);
		color: rgb(245 245 247 / 0.6);
		transition: border-radius 300ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.is-avatar .artwork {
		border-radius: 50%;
	}
	.status-dot {
		position: absolute;
		right: -4px;
		bottom: -4px;
		width: 18px;
		height: 18px;
		border: 4px solid #0d0d12;
		border-radius: 50%;
		background: #92949b;
		transition: background-color 250ms ease;
	}
	.is-avatar .status-dot {
		right: -1px;
		bottom: -1px;
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
	/* A soft ping while online, like a live light. */
	.status-dot[data-status='online']::after {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: 50%;
		box-shadow: 0 0 0 2px #55c58a;
		animation: ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	@keyframes ping {
		from {
			opacity: 0.7;
			transform: scale(0.7);
		}
		60%,
		to {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	.copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
		gap: 2px;
	}
	.title {
		display: flex;
		min-width: 0;
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	.subtitle {
		display: flex;
		min-width: 0;
		font-size: 13px;
		color: rgb(245 245 247 / 0.62);
	}
	.copy :global(.clip) {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meter {
		--glow: color-mix(in srgb, var(--presence-accent) 55%, #fff);
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 30px;
	}
	.cap {
		flex: none;
		width: 9px;
		height: 9px;
		border: 1px solid rgb(245 245 247 / 0.45);
		border-radius: 50%;
		background: radial-gradient(circle, rgb(245 245 247 / 0.7) 1.5px, transparent 2px);
	}
	.ticks {
		--p: 0;
		--x: 0%;
		--t: 0;
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
	}
	/* --h is registered so a new track's waveform grows in (staggered along the bar) instead of
	   snapping. Everything else comes from the playhead variables set by the loop above. */
	@property --h {
		syntax: '<number>';
		inherits: false;
		initial-value: 0.5;
	}
	/* --on: 0 to 1 as the playhead crosses this tick. --near: a bump around the playhead that
	   breathes with --t, so the leading edge of the bar ripples. */
	.tick {
		--on: clamp(0, var(--p) - var(--i), 1);
		--near: max(0, 1 - abs(var(--i) - var(--p) + 0.5) / 5);
		width: 2px;
		height: calc(
			2px + var(--on) * var(--h) * 16px + var(--near) * (0.5 + 0.5 * sin(var(--t) * 3 + var(--i) * 0.9)) *
				6px
		);
		background: color-mix(in srgb, var(--glow) calc(var(--on) * 100%), rgb(245 245 247 / 0.3));
		box-shadow: 0 0 calc(var(--on) * 6px)
			color-mix(in srgb, var(--presence-accent) calc(var(--on) * 100%), transparent);
		transition: --h 600ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--i) * 12ms);
	}
	.playhead {
		position: absolute;
		top: 0;
		bottom: 0;
		left: var(--x);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		translate: -50% 0;
	}
	.playhead :global(.mark) {
		width: 9px;
		height: 9px;
		margin-block: -2px;
		/* The album colour itself, not the washed-out glow the ticks use; the white centre pixel stays. */
		fill: color-mix(in srgb, var(--presence-accent) 88%, #fff);
		filter: drop-shadow(0 0 4px var(--presence-accent));
	}

	.caption {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		align-items: baseline;
		padding: 4px 14px 12px;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.2;
		color: rgb(245 245 247 / 0.5);
	}
	.service {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-transform: lowercase;
	}
	/* Dot-matrix readout in the same face as the clock on the right. */
	.time {
		font-family: 'Doto Variable', monospace;
		font-size: 14px;
		font-weight: 800;
		letter-spacing: 0.04em;
		color: #f2eeea;
		font-variant-numeric: tabular-nums;
	}
	.time i {
		margin-inline: 3px;
		font-style: normal;
		opacity: 0.45;
	}

	.presence :global(.sticker) {
		position: absolute;
		top: -12px;
		right: -12px;
		width: 28px;
		height: 28px;
		fill: color-mix(in srgb, var(--presence-accent) 70%, #fff);
		filter: drop-shadow(0 0 4px var(--presence-accent));
		transition:
			fill 400ms ease,
			filter 400ms ease;
	}

	a.presence:focus-visible {
		outline: 2px solid #f5f5f7;
		outline-offset: 6px;
	}
	@media (prefers-reduced-motion: reduce) {
		.cover,
		.copy > :global(*),
		.status-dot::after {
			animation: none;
		}
		.tick,
		.status-dot,
		.artwork {
			transition: none;
		}
	}
</style>
