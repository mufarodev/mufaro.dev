<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
	import AnimatedLiquidBackground from './core/animated-liquid-background.svelte';
	import DiscordStatusMorphable from './discord-status-morphable.svelte';
	import HeroNavbar from './hero-navbar.svelte';
	import {
		accentColor,
		heroScrollLocked,
		isAnimating as heroAnimatingStore,
		morphProgress as morphProgressStore
	} from '$lib/stores/hero-state';

	let currentColor = $state({ r: 136, g: 153, b: 170 });

	let discordMorphProgress = $state(0);

	let headerContainer: HTMLDivElement;
	let sparkleImage: HTMLDivElement;
	let heroName: HTMLHeadingElement;
	let heroTitleGroup: HTMLDivElement;
	let heroDescription: HTMLDivElement;
	let discordContainer: HTMLDivElement;
	let scrollIndicator: HTMLDivElement;
	let navbarContainer: HTMLDivElement;

	let morphTl: gsap.core.Timeline;
	let isAnimating = false;
	let currentSection = 0;
	let wheelUnlockUntil = 0;
	let unlockTimeout: number | null = null;
	const HERO_SCROLL_TARGET = 88;
	const HERO_ENTER_THRESHOLD = 140;
	const HERO_RETURN_THRESHOLD = 220;
	const POST_MORPH_SCROLL_LOCK_MS = 120;
	const RETURN_SCROLL_LOCK_MS = 60;
	const sectionPositions = [0, HERO_SCROLL_TARGET];

	let plasmaColor1 = $derived(
		`rgb(${Math.round(currentColor.r * 0.8)}, ${Math.round(currentColor.g * 0.8)}, ${Math.round(currentColor.b * 0.8)})`
	);
	let plasmaColor2 = $derived(
		`rgb(${Math.round(currentColor.r * 0.5)}, ${Math.round(currentColor.g * 0.5)}, ${Math.round(currentColor.b * 0.5)})`
	);
	let plasmaColor3 = $derived(
		`rgb(${Math.round(currentColor.r * 0.3)}, ${Math.round(currentColor.g * 0.3)}, ${Math.round(currentColor.b * 0.3)})`
	);

	let accentColorCss = $derived(
		`--accent-r: ${currentColor.r}; --accent-g: ${currentColor.g}; --accent-b: ${currentColor.b};`
	);

	function clearUnlockTimeout() {
		if (unlockTimeout !== null) {
			window.clearTimeout(unlockTimeout);
			unlockTimeout = null;
		}
	}

	function setMorphProgress(value: number) {
		discordMorphProgress = value;
		morphProgressStore.set(value);
	}

	function setAnimating(value: boolean) {
		isAnimating = value;
		heroAnimatingStore.set(value);
	}

	function unlockScrollAfter(delay = 0) {
		clearUnlockTimeout();

		if (delay <= 0) {
			heroScrollLocked.set(false);
			return;
		}

		unlockTimeout = window.setTimeout(() => {
			heroScrollLocked.set(false);
			unlockTimeout = null;
		}, delay);
	}

	function notifyExperienceReveal() {
		if (!isHomePage) return;
		window.dispatchEvent(new CustomEvent('hero:experience-reveal'));
	}

	function handleAccentColorChange(color: { r: number; g: number; b: number } | null) {
		if (!color) return;
		gsap.to(currentColor, {
			r: color.r,
			g: color.g,
			b: color.b,
			duration: 1.5,
			ease: 'power2.out',
			onUpdate: () => {
				// Update the store so other components can react
				accentColor.set({
					r: Math.round(currentColor.r),
					g: Math.round(currentColor.g),
					b: Math.round(currentColor.b)
				});
			}
		});
	}

	let isHomePage = $derived($page.url.pathname === '/');

	export function morphToPill(instant = false) {
		if (!morphTl) return;

		if (instant) {
			morphTl.progress(1);
			currentSection = 1;
			setMorphProgress(1);
			setAnimating(false);
			notifyExperienceReveal();
			unlockScrollAfter(0);
		} else {
			setAnimating(true);
			currentSection = 1;
			wheelUnlockUntil = Date.now() + 650;
			if (isHomePage) {
				heroScrollLocked.set(true);
			}
			gsap.killTweensOf(window);
			morphTl.play();
			gsap.to(window, {
				scrollTo: sectionPositions[1],
				duration: 0.6,
				ease: 'power2.inOut',
				onComplete: () => {
					setAnimating(false);
					notifyExperienceReveal();
					unlockScrollAfter(isHomePage ? POST_MORPH_SCROLL_LOCK_MS : 0);
				}
			});
		}
	}

	export function morphToHero(instant = false) {
		if (!morphTl) return;

		if (instant) {
			morphTl.progress(0);
			currentSection = 0;
			setMorphProgress(0);
			setAnimating(false);
			unlockScrollAfter(0);
		} else {
			setAnimating(true);
			currentSection = 0;
			wheelUnlockUntil = Date.now() + 450;
			if (isHomePage) {
				heroScrollLocked.set(true);
			}
			gsap.killTweensOf(window);
			morphTl.reverse();
			gsap.to(window, {
				scrollTo: 0,
				duration: 0.6,
				ease: 'power2.inOut',
				onComplete: () => {
					setAnimating(false);
					unlockScrollAfter(isHomePage ? RETURN_SCROLL_LOCK_MS : 0);
				}
			});
		}
	}

	let previousWasHome = $state(false);

	beforeNavigate(({ from }) => {
		previousWasHome = from?.url.pathname === '/';
	});

	afterNavigate(({ to }) => {
		if (!to || !morphTl) return;

		const atHome = to.url.pathname === '/';

		if (!atHome) {
			if (previousWasHome && currentSection === 0) {
				morphToPill();
			} else if (morphTl.progress() < 1) {
				morphTl.progress(1);
				currentSection = 1;
				setMorphProgress(1);
				unlockScrollAfter(0);
			}
		}
	});

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
		heroScrollLocked.set(false);
		heroAnimatingStore.set(false);

		const initialScrollY = window.scrollY;
		const startMorphed = !isHomePage || initialScrollY > HERO_ENTER_THRESHOLD;

		if (startMorphed) {
			currentSection = 1;
			setMorphProgress(1);
		} else {
			setMorphProgress(0);
		}

		morphTl = gsap.timeline({ paused: true });

		morphTl.fromTo(
			headerContainer,
			{
				width: '100vw',
				height: '100vh',
				borderRadius: '0px',
				top: '0px'
			},
			{
				width: () => (window.innerWidth > 1333 ? '1200px' : '90vw'),
				height: '80px',
				borderRadius: '50px',
				top: '24px',
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			sparkleImage,
			{
				width: '800px',
				left: '-140px',
				bottom: '360px',
				y: '0%'
			},
			{
				width: '100px',
				left: '-5px',
				bottom: '55%',
				y: '50%',
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			heroName,
			{
				fontSize: '96px',
				left: () =>
					window.innerWidth >= 1024 ? '96px' : window.innerWidth >= 768 ? '64px' : '32px',
				bottom: '220px'
			},
			{
				fontSize: '36px',
				left: '100px',
				bottom: '24px',
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			[heroTitleGroup, heroDescription],
			{ opacity: 1, y: 0 },
			{ opacity: 0, y: -20, duration: 0.4, ease: 'power2.out' },
			0
		);

		morphTl.fromTo(
			discordContainer,
			{
				top: '32px',
				right: '32px',
				y: '0%'
			},
			{
				top: '50%',
				right: '16px',
				y: '-50%',
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.to(
			{ progress: 0 },
			{
				progress: 1,
				duration: 0.6,
				ease: 'power2.inOut',
				onUpdate: function () {
					setMorphProgress(this.targets()[0].progress);
				}
			},
			0
		);

		morphTl.fromTo(
			scrollIndicator,
			{ opacity: 0.5 },
			{ opacity: 0, duration: 0.2, ease: 'none' },
			0
		);

		// Navbar: animate from hero top position to pill center
		// Uses y transform to avoid conflicts with CSS transforms
		// In hero: top 56px (near top of screen)
		// In pill: top 40px (center of 80px pill)
		morphTl.fromTo(
			navbarContainer,
			{
				top: '56px'
			},
			{
				top: '40px',
				duration: 0.6,
				ease: 'power2.inOut'
			},
			0
		);

		// If started morphed, jump to end
		if (startMorphed) {
			morphTl.progress(1);
			setMorphProgress(1);
		}

		// Wheel event handler
		function handleWheel(e: WheelEvent) {
			if (Date.now() < wheelUnlockUntil) {
				e.preventDefault();
				return;
			}

			if (isAnimating) {
				e.preventDefault();
				return;
			}

			const scrollY = window.scrollY;
			const direction = e.deltaY > 0 ? 1 : -1;

			// At hero, scrolling down -> morph to pill
			if (currentSection === 0 && direction === 1 && scrollY < HERO_ENTER_THRESHOLD) {
				e.preventDefault();
				morphToPill();
			}
			// At pill, scrolling up near top -> restore hero
			else if (currentSection === 1 && direction === -1 && scrollY <= HERO_RETURN_THRESHOLD) {
				e.preventDefault();
				morphToHero();
			}
		}

		const wheelListenerOptions: AddEventListenerOptions = { passive: false, capture: true };
		window.addEventListener('wheel', handleWheel, wheelListenerOptions);

		return () => {
			window.removeEventListener('wheel', handleWheel, wheelListenerOptions);
			clearUnlockTimeout();
			unlockScrollAfter(0);
			setAnimating(false);
			ScrollTrigger.getAll().forEach((t) => t.kill());
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
		bind:this={headerContainer}
		class="pointer-events-auto absolute z-50 overflow-hidden bg-[#050507] shadow-2xl"
		style="width: 100vw; height: 100vh; top: 0; left: 50%; transform: translateX(-50%); border-radius: 0;"
	>
		<div class="pointer-events-none absolute inset-0 opacity-80">
			<AnimatedLiquidBackground
				color1={plasmaColor1}
				color2={plasmaColor2}
				color3={plasmaColor3}
				speed={15}
			/>
			<div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
		</div>

		<div class="pointer-events-none relative h-full w-full">
			<div
				bind:this={sparkleImage}
				class="pointer-events-none absolute origin-bottom-left"
				style="width: 800px; left: -140px; bottom: 360px;"
			>
				<img
					src="/images/sparkle.webp"
					alt="Sparkle"
					class="w-full drop-shadow-2xl"
					style="mask-image: radial-gradient(circle closest-side, black 40%, transparent 100%); -webkit-mask-image: radial-gradient(circle closest-side, black 40%, transparent 100%);"
				/>
			</div>

			<div
				bind:this={heroTitleGroup}
				class="absolute bottom-78 left-8 z-10 origin-bottom-left md:left-16 lg:left-24"
			>
				<h1
					class="font-serif text-6xl leading-[0.9] font-medium tracking-tight text-white/50 md:text-8xl lg:text-9xl"
				>
					Hello, I'm <br />
				</h1>
			</div>

			<h1
				bind:this={heroName}
				class="absolute left-8 z-10 origin-bottom-left font-serif leading-[0.9] font-medium tracking-tight whitespace-nowrap md:left-16 lg:left-24"
				style="font-size: 96px; bottom: 220px;"
			>
				<span
					class="bg-linear-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent"
				>
					Mufaro
				</span>
			</h1>

			<div bind:this={heroDescription} class="absolute bottom-25 left-8 z-10 md:left-16 lg:left-24">
				<p class="max-w-xl text-lg leading-relaxed text-white/80 md:text-xl lg:max-w-md">
					I'm an 18 year old from Poland who makes software, plays games and is passionate about
					learning new things.
				</p>
			</div>

			<div
				bind:this={navbarContainer}
				class="pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
				style="top: 56px;"
			>
				<HeroNavbar />
			</div>

			<div
				bind:this={discordContainer}
				class="pointer-events-auto absolute z-20 origin-top-right"
				style="top: 32px; right: 32px;"
			>
				<DiscordStatusMorphable
					onAccentColorChange={handleAccentColorChange}
					morphProgress={discordMorphProgress}
				/>
			</div>
		</div>
	</div>

	<div
		bind:this={scrollIndicator}
		class="pointer-events-none absolute bottom-8 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2"
		style="opacity: 0.5;"
	>
		<span class="text-xs tracking-widest text-white/60 uppercase">Scroll</span>
		<div class="h-12 w-px bg-linear-to-b from-transparent via-white/50 to-transparent"></div>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		h1[style*='font-size'] {
			font-size: 64px !important;
		}
	}
</style>
