<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import HeroArtwork from './core/hero-artwork.svelte';
	import DiscordStatusMorphable from './discord-status-morphable.svelte';
	import { getLanyard } from '$lib/stores/lanyard.svelte';
	import {
		accentColor,
		isAnimating as heroAnimatingStore,
		morphProgress as morphProgressStore
	} from '$lib/stores/hero-state';

	const presence = getLanyard();
	let currentColor = $derived($accentColor);

	let discordMorphProgress = $state(0);

	let headerContainer: HTMLDivElement;
	let heroCopy: HTMLDivElement;
	let pillIdentity: HTMLDivElement;
	let discordContainer: HTMLDivElement;
	let scrollIndicator: HTMLDivElement;
	let heroGapCover: HTMLDivElement;

	let morphTl: gsap.core.Timeline;
	let morphPlayback: gsap.core.Tween | undefined;
	let currentSection = 0;
	let isAnimating = false;
	let contentHasScrolled = false;
	const MORPH_DURATION = 1;
	const HERO_ENTER_THRESHOLD = 8;
	let resizeRafId: number | null = null;
	let navigationRafId: number | null = null;

	let accentColorCss = $derived(
		`--accent-r: ${currentColor.r}; --accent-g: ${currentColor.g}; --accent-b: ${currentColor.b};`
	);

	function setMorphProgress(value: number) {
		discordMorphProgress = value;
		morphProgressStore.set(value);
	}

	function setAnimating(value: boolean) {
		isAnimating = value;
		heroAnimatingStore.set(value);
	}

	function notifyExperienceReveal() {
		if (!isHomePage) return;
		window.dispatchEvent(new CustomEvent('hero:experience-reveal'));
	}

	let isHomePage = $derived($page.url.pathname === '/');

	function playMorph(target: 0 | 1) {
		morphPlayback?.kill();
		// Shorten interrupted moves according to the distance still on screen.
		const duration = MORPH_DURATION * Math.sqrt(Math.abs(target - morphTl.progress()));
		morphPlayback = morphTl.tweenTo(target * morphTl.duration(), {
			duration,
			ease: 'power3.inOut',
			onComplete: () => {
				setAnimating(false);
				if (target === 1) notifyExperienceReveal();
			}
		});
		return duration;
	}

	function morphTo(target: 0 | 1, instant = false) {
		if (!morphTl) return;
		instant ||= window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!instant && currentSection === target) return;
		currentSection = target;
		morphPlayback?.kill();

		if (instant) {
			morphTl.pause().progress(target);
			setMorphProgress(target);
			setAnimating(false);
			if (target === 1) notifyExperienceReveal();
		} else {
			setAnimating(true);
			playMorph(target);
		}
	}

	let previousWasHome = $state(false);

	beforeNavigate(({ from }) => {
		previousWasHome = from?.url.pathname === '/';
	});

	afterNavigate(({ to, type }) => {
		if (!to || !morphTl) return;
		if (navigationRafId !== null) cancelAnimationFrame(navigationRafId);
		navigationRafId = requestAnimationFrame(() => {
			navigationRafId = null;
			contentHasScrolled = window.scrollY > 0;
			const target = to.url.pathname !== '/' || window.scrollY > HERO_ENTER_THRESHOLD ? 1 : 0;
			// Let SvelteKit restore history/hash positions before choosing the hero state.
			morphTo(target, type === 'popstate' || !previousWasHome || target === 0);
		});
	});

	onMount(() => {
		heroAnimatingStore.set(false);

		const initialScrollY = window.scrollY;
		contentHasScrolled = initialScrollY > 0;
		const startMorphed = !isHomePage || initialScrollY > HERO_ENTER_THRESHOLD;

		if (startMorphed) {
			currentSection = 1;
			setMorphProgress(1);
		} else {
			setMorphProgress(0);
		}

		const duration = MORPH_DURATION;

		function buildTimeline(snapProgress = 0) {
			morphPlayback?.kill();
			morphTl?.kill();
			const startWidth = window.innerWidth - 24;
			const startHeight = window.innerHeight - 24;
			const endWidth = Math.min(1200, window.innerWidth * 0.9);
			const arcHeight = Math.min(64, window.innerHeight * 0.07);
			const heroStyle = getComputedStyle(heroCopy);
			const bottom = parseFloat(heroStyle.bottom);
			const gutter = parseFloat(heroStyle.left);
			const presenceHeight = discordContainer.offsetHeight;
			const state = { progress: 0 };
			const lerp = (start: number, end: number, p: number) => start + (end - start) * p;

			function render() {
				const p = state.progress;
				// Gather inward, then lift into place: a smaller version of the original arc.
				// This peaks two-thirds through the collapse and has no settling oscillation.
				const arc = 6.75 * p * p * (1 - p) * arcHeight;
				setMorphProgress(p);
				headerContainer.style.top = `${lerp(12, 24, p) + arc}px`;
				headerContainer.style.width = `${lerp(startWidth, endWidth, p)}px`;
				headerContainer.style.height = `${lerp(startHeight, 80, p)}px`;
				headerContainer.style.borderRadius = `${lerp(24, 40, p)}px`;
			}

			// Keep the frame, wallpaper and player on one reversible motion path.
			morphTl = gsap.timeline({ paused: true, defaults: { duration, ease: 'none' } });
			morphTl.to(state, { progress: 1, onUpdate: render }, 0);
			morphTl.fromTo(
				heroCopy,
				{ autoAlpha: 1, y: 0 },
				{ autoAlpha: 0, y: -16, duration: 0.22, ease: 'sine.inOut' },
				0
			);
			morphTl.fromTo(
				discordContainer,
				{ x: 32 - gutter, y: startHeight - bottom - presenceHeight },
				{ x: 0, y: (80 - presenceHeight) / 2 },
				0
			);
			morphTl.fromTo(
				pillIdentity,
				{ autoAlpha: 0, x: -8 },
				{ autoAlpha: 1, x: 0, duration: 0.25, ease: 'sine.inOut' },
				duration - 0.25
			);
			morphTl.fromTo(
				scrollIndicator,
				{ autoAlpha: 0.5 },
				{ autoAlpha: 0, duration: 0.2, ease: 'none' },
				0
			);
			morphTl.fromTo(heroGapCover, { opacity: 1 }, { opacity: 0, duration: 0.2, ease: 'none' }, 0);
			morphTl.progress(snapProgress, true);
			render();
		}

		const initialProgress = startMorphed ? 1 : 0;
		buildTimeline(initialProgress);
		setMorphProgress(initialProgress);

		// Keep the main morph separate from scrolling, but let the content respond
		// while the pill finishes settling along the last 2% of its motion path.
		let touchStartX = 0;
		let touchStartY = 0;
		let touchCaptured = false;

		function canScrollContent() {
			return currentSection === 1 && morphTl.progress() >= 0.98;
		}

		function captureScroll(direction: number) {
			if (!isHomePage || window.scrollY > 0 || (canScrollContent() && direction > 0)) return false;

			morphTo(direction > 0 ? 1 : 0);
			return true;
		}

		function handleWheel(event: WheelEvent) {
			if (!isHomePage || event.ctrlKey || event.deltaY === 0) return;
			if (canScrollContent() && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			if (captureScroll(Math.sign(event.deltaY))) event.preventDefault();
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (!isHomePage || event.ctrlKey || event.metaKey || event.altKey) return;
			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable || target.closest('input, textarea, select, button'))
			)
				return;
			let direction = 0;
			if (['ArrowDown', 'PageDown', ' '].includes(event.key)) direction = 1;
			if (['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey))
				direction = -1;
			if (direction && captureScroll(direction)) event.preventDefault();
		}

		function handleTouchStart(event: TouchEvent) {
			touchCaptured = false;
			if (event.touches.length !== 1) return;
			touchStartX = event.touches[0].clientX;
			touchStartY = event.touches[0].clientY;
		}

		function handleTouchMove(event: TouchEvent) {
			if (!isHomePage || event.touches.length !== 1) return;
			const x = touchStartX - event.touches[0].clientX;
			const y = touchStartY - event.touches[0].clientY;
			if (!touchCaptured && (Math.abs(y) < 8 || Math.abs(y) <= Math.abs(x))) return;
			touchStartX = event.touches[0].clientX;
			touchStartY = event.touches[0].clientY;
			if (!y) return;

			if (captureScroll(Math.sign(y))) {
				event.preventDefault();
				touchCaptured = true;
			} else if (touchCaptured) {
				// Canceling the opening touch disables native panning for this gesture.
				// Forward only its remaining movement; the next gesture is native again.
				event.preventDefault();
				window.scrollBy({ top: y, behavior: 'instant' });
			}
		}

		function releaseTouch() {
			touchCaptured = false;
		}

		let scrollRafId: number | null = null;
		function updateScroll() {
			scrollRafId = null;
			if (!isHomePage || navigationRafId !== null) return;

			if (window.scrollY > 0) {
				contentHasScrolled = true;
				if (window.scrollY > HERO_ENTER_THRESHOLD && !canScrollContent()) {
					// Scrollbar, End, anchors and history can explicitly bypass the introduction.
					morphTo(1, true);
				}
			} else if (contentHasScrolled) {
				// Respond at the native top while the visual smoothing settles underneath.
				contentHasScrolled = false;
				morphTo(0);
			}
		}

		function handleScroll() {
			if (scrollRafId === null) scrollRafId = requestAnimationFrame(updateScroll);
		}

		const inputOptions = { passive: false, capture: true };
		window.addEventListener('wheel', handleWheel, inputOptions);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, inputOptions);
		window.addEventListener('touchend', releaseTouch);
		window.addEventListener('touchcancel', releaseTouch);
		window.addEventListener('blur', releaseTouch);
		window.addEventListener('scroll', handleScroll, { passive: true });

		function handleResize() {
			if (resizeRafId !== null) return;
			resizeRafId = requestAnimationFrame(() => {
				resizeRafId = null;
				if (!morphTl) return;

				const p = morphTl.progress();
				const playing = isAnimating;
				buildTimeline(p);
				if (playing) {
					playMorph(currentSection === 1 ? 1 : 0);
				}
			});
		}

		const resizeObserver = new ResizeObserver(handleResize);
		window.addEventListener('resize', handleResize);
		resizeObserver.observe(discordContainer);

		return () => {
			morphPlayback?.kill();
			morphTl?.kill();
			if (scrollRafId !== null) {
				cancelAnimationFrame(scrollRafId);
				scrollRafId = null;
			}
			if (resizeRafId !== null) {
				cancelAnimationFrame(resizeRafId);
				resizeRafId = null;
			}
			if (navigationRafId !== null) cancelAnimationFrame(navigationRafId);
			window.removeEventListener('wheel', handleWheel, inputOptions);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove, inputOptions);
			window.removeEventListener('touchend', releaseTouch);
			window.removeEventListener('touchcancel', releaseTouch);
			window.removeEventListener('blur', releaseTouch);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
			resizeObserver.disconnect();
			setAnimating(false);
		};
	});
</script>

<div
	class="pointer-events-none fixed inset-0 z-50 h-full w-full overflow-hidden"
	style={accentColorCss}
>
	<div
		class="absolute inset-0 -z-10 transition-colors duration-1000"
		style="background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba({currentColor.r},{currentColor.g},{currentColor.b},0.06) 0%, transparent 50%);"
	></div>

	<div
		bind:this={heroGapCover}
		class="absolute right-0 bottom-0 left-0 z-30 h-8 bg-[#050507]"
	></div>

	<div
		bind:this={headerContainer}
		class="hero-shell pointer-events-auto absolute z-50 overflow-hidden bg-[#050507] shadow-2xl"
		style="width: calc(100vw - 16px); height: calc(100vh - 16px); top: 8px; left: 50%; transform: translateX(-50%); border-radius: 16px;"
	>
		<HeroArtwork morphProgress={discordMorphProgress} />

		<div class="pointer-events-none relative h-full w-full">
			<div bind:this={pillIdentity} class="pill-identity" aria-hidden={discordMorphProgress < 0.5}>
				<img src="/images/avatar.webp" alt="" width="64" height="64" />
				<div class="pill-identity-copy">
					<span class="pill-name">Mufaro</span>
					{#if !presence.activity}
						<DiscordStatusMorphable
							activity={null}
							morphProgress={1}
							active={discordMorphProgress > 0.5}
						/>
					{/if}
				</div>
			</div>

			<div bind:this={heroCopy} class="hero-copy" aria-hidden={discordMorphProgress > 0.5}>
				<h1 class="hero-heading">
					<span class="hero-greeting">Hello, I'm</span>
					<span class="hero-name">Mufaro</span>
				</h1>
				<p class="hero-description">
					I'm an 18 year old from Poland who makes software, reverse engineers, plays games and is
					passionate about learning new things.
				</p>
				{#if !presence.activity}
					<div class="hero-status">
						<DiscordStatusMorphable activity={null} active={discordMorphProgress < 0.5} />
					</div>
				{/if}
			</div>

			<div bind:this={discordContainer} class="discord-container pointer-events-auto absolute z-20">
				{#each presence.activity ? [presence.activity] : [] as activity (!!activity)}
					<DiscordStatusMorphable {activity} morphProgress={discordMorphProgress} />
				{/each}
			</div>
		</div>
	</div>

	<div
		bind:this={scrollIndicator}
		class="pointer-events-none absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-8"
		style="opacity: 0.5;"
	>
		<span class="text-xs tracking-widest text-white/60 uppercase">Scroll</span>
		<div class="h-12 w-px bg-linear-to-b from-transparent via-white/50 to-transparent"></div>
	</div>
</div>

<style>
	.hero-shell {
		--hero-inset-inline: clamp(32px, 5vw, 96px);
		--hero-inset-block: clamp(48px, 8vh, 96px);
	}
	.hero-copy {
		position: absolute;
		left: var(--hero-inset-inline);
		bottom: var(--hero-inset-block);
		width: min(448px, calc(100vw - 24px - 2 * var(--hero-inset-inline) - 304px - 32px));
		color: #f2eeea;
	}
	.hero-status {
		position: absolute;
		top: 100%;
		margin-top: 16px;
	}
	.hero-heading {
		font-family: var(--font-serif);
		font-weight: 400;
		letter-spacing: -0.035em;
		line-height: 0.95;
	}
	.hero-greeting {
		display: block;
		font-size: clamp(80px, 8vw, 128px);
		color: rgb(242 238 234 / 0.5);
	}
	.hero-name {
		display: block;
		font-size: 96px;
	}
	.hero-description {
		margin-top: 28px;
		font-size: 20px;
		line-height: 1.65;
		color: rgb(242 238 234 / 0.8);
		text-wrap: pretty;
	}
	.discord-container {
		top: 0;
		right: 32px;
	}
	.pill-identity {
		position: absolute;
		inset-block: 0;
		left: 8px;
		display: flex;
		align-items: center;
		gap: 12px;
		visibility: hidden;
	}
	.pill-identity img {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		object-fit: cover;
	}
	.pill-identity-copy {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.pill-name {
		font-family: var(--font-serif);
		font-size: 36px;
		line-height: 1;
		color: #f2eeea;
	}
	@media (max-height: 699px) {
		.hero-greeting {
			font-size: 72px;
		}
		.hero-name {
			font-size: 80px;
		}
		.hero-description {
			margin-top: 20px;
			font-size: 18px;
		}
	}
</style>
