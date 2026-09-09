<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import HeroArtwork from './core/hero-artwork.svelte';
	import DiscordStatusMorphable from './discord-status-morphable.svelte';
	import { getLanyard } from '$lib/stores/lanyard.svelte';
	import {
		accentColor,
		morphProgress as morphProgressStore,
		heroScrollLocked
	} from '$lib/stores/hero-state';

	const presence = getLanyard();
	let currentColor = $derived($accentColor);

	let accentColorCss = $derived(
		`--accent-r: ${currentColor.r}; --accent-g: ${currentColor.g}; --accent-b: ${currentColor.b};`
	);
	let isHomePage = $derived($page.url.pathname === '/');
	let isAnchored = $state($page.url.pathname !== '/');

	function mountPill(node: HTMLDivElement) {
		// ScrollSmoother transforms its content, so fixed UI must live outside it.
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	function setAnchored(anchored: boolean) {
		isAnchored = anchored;
		morphProgressStore.set(anchored ? 1 : 0);
	}

	let heroSection = $state<HTMLElement>();
	let rafId: number | null = null;

	function updateAnchor() {
		rafId = null;
		const threshold = (heroSection?.offsetHeight ?? window.innerHeight) - 84;
		setAnchored(!isHomePage || window.scrollY >= threshold);
	}

	afterNavigate(updateAnchor);

	onMount(() => {
		function onScroll() {
			if (rafId !== null) return;
			rafId = requestAnimationFrame(updateAnchor);
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		updateAnchor();

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (rafId !== null) cancelAnimationFrame(rafId);
			morphProgressStore.set(0);
			heroScrollLocked.set(false);
		};
	});
</script>

<div
	class="pointer-events-none fixed inset-0 z-40 h-full w-full overflow-hidden"
	style={accentColorCss}
	aria-hidden="true"
>
	<div
		class="absolute inset-0 -z-10 transition-colors duration-1000"
		style="background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba({currentColor.r},{currentColor.g},{currentColor.b},0.06) 0%, transparent 50%);"
	></div>
</div>

<div
	use:mountPill
	class="mobile-pill-anchor pointer-events-auto"
	class:is-anchored={isAnchored}
	class:has-activity={!!presence.activity}
	style={accentColorCss}
	aria-hidden={!isAnchored}
	inert={!isAnchored}
>
	<div class="mobile-pill-inner overflow-hidden bg-[#050507] shadow-2xl">
		<HeroArtwork morphProgress={1} />

		<div class="pointer-events-none absolute inset-0 flex items-center">
			<img
				class="pill-avatar absolute left-3 h-12 w-12 rounded-full object-cover"
				src="/images/avatar.webp"
				alt="Mufaro's avatar"
			/>
			<div class="pill-identity-copy absolute left-[72px]">
				<span
					class="pill-name font-serif leading-none font-medium tracking-tight"
					style="color: #f2eeea;">Mufaro</span
				>
				{#if !presence.activity}
					<DiscordStatusMorphable activity={null} morphProgress={1} active={isAnchored} />
				{/if}
			</div>

			{#each presence.activity ? [presence.activity] : [] as activity (!!activity)}
				<div class="pill-discord-container pointer-events-auto absolute">
					<DiscordStatusMorphable {activity} morphProgress={1} active={isAnchored} />
				</div>
			{/each}
		</div>
	</div>
</div>

{#if isHomePage}
	<section
		bind:this={heroSection}
		class="mobile-hero-section pointer-events-none relative w-full overflow-hidden"
		inert={isAnchored}
		style={accentColorCss}
		aria-label="Hero section"
	>
		<div
			class="mobile-hero-card pointer-events-auto absolute inset-x-2 top-2 bottom-2 overflow-hidden rounded-2xl bg-[#050507] shadow-2xl"
		>
			<HeroArtwork />

			<div class="pointer-events-none relative h-full w-full">
				<div
					class="absolute right-5 left-5 z-10"
					style="bottom: max(calc(env(safe-area-inset-bottom) + 1.5rem), 2rem);"
				>
					<h2 class="font-serif text-5xl leading-[0.9] font-medium tracking-tight text-white/50">
						Hello, I'm <br />
					</h2>
					<h1
						class="mt-1 font-serif leading-[0.9] font-medium tracking-tight"
						style="font-size: clamp(68px, 17vw, 80px); color: #f2eeea;"
					>
						Mufaro
					</h1>

					<p
						class="mt-6 text-[0.95rem] leading-relaxed text-white/80"
						style="max-width: min(92vw, 30rem); text-wrap: pretty;"
					>
						I'm an 18 year old from Poland who makes software, reverse engineers, plays games and is
						passionate about learning new things.
					</p>
					<div
						class="hero-presence t-resize pointer-events-auto"
						class:has-activity={!!presence.activity}
					>
						{#each [presence.activity] as activity (!!activity)}
							<div class="hero-presence-slot">
								<DiscordStatusMorphable {activity} active={!isAnchored} />
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.mobile-hero-section {
		height: 100svh;
		min-height: 100svh;
	}

	.mobile-pill-anchor {
		position: fixed;
		top: 12px;
		left: 50%;
		transform: translateX(-50%) translateY(-120%);
		z-index: 50;
		width: calc(100vw - 20px);
		opacity: 0;
		transition:
			transform 0.25s cubic-bezier(0.23, 1, 0.32, 1),
			opacity 0.25s ease;
		pointer-events: none;
	}

	.mobile-pill-anchor.is-anchored {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
		pointer-events: auto;
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-pill-anchor {
			transition: none;
		}
	}

	.mobile-pill-inner {
		position: relative;
		width: 100%;
		height: 72px;
		border-radius: 36px;
		overflow: hidden;
	}

	.pill-name {
		font-size: 24px;
		z-index: 20;
	}
	.pill-identity-copy {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.hero-presence {
		position: relative;
		height: 20px;
		margin-top: 16px;
	}
	.hero-presence.has-activity {
		height: 88px;
		margin-top: 24px;
	}
	.hero-presence-slot {
		position: absolute;
		inset: 0;
	}

	@media (max-width: 399px) {
		.has-activity .pill-name {
			/* The portrait carries the identity beside the music controls on narrow phones. */
			clip-path: inset(50%);
			width: 1px;
			height: 1px;
			overflow: hidden;
		}
	}

	.pill-discord-container {
		z-index: 20;
		top: 50%;
		right: 20px;
		transform: translateY(-50%);
		width: min(260px, calc(100% - 168px));
		--presence-width: 100%;
	}
	@media (max-width: 399px) {
		.pill-discord-container {
			width: calc(100% - 92px);
		}
	}
	@media (max-height: 699px) {
		.mobile-hero-section {
			min-height: 620px;
		}
	}
</style>
