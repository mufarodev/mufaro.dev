<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { ScrollToPlugin } from 'gsap/dist/ScrollToPlugin';
	import AnimatedLiquidBackground from './core/animated-liquid-background.svelte';
	import DiscordStatusMorphable from './discord-status-morphable.svelte';
	// import HeroNavbar from './hero-navbar.svelte';
	import {
		accentColor,
		heroScrollLocked,
		isAnimating as heroAnimatingStore,
		morphProgress as morphProgressStore
	} from '$lib/stores/hero-state';

	gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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
	const MOBILE_HERO_SCROLL_TARGET = 68;
	const MOBILE_HERO_ENTER_THRESHOLD = 72;
	const MOBILE_HERO_RETURN_THRESHOLD = 96;
	const MOBILE_BREAKPOINT = 768;
	const SMALL_BREAKPOINT = 640;
	const POST_MORPH_SCROLL_LOCK_MS = 120;
	const RETURN_SCROLL_LOCK_MS = 60;

	function isNarrowViewport() {
		return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
	}

	function isSmallViewport() {
		return typeof window !== 'undefined' && window.innerWidth < SMALL_BREAKPOINT;
	}

	function getHeroScrollTarget() {
		return isNarrowViewport() ? MOBILE_HERO_SCROLL_TARGET : HERO_SCROLL_TARGET;
	}

	function getHeroEnterThreshold() {
		return isNarrowViewport() ? MOBILE_HERO_ENTER_THRESHOLD : HERO_ENTER_THRESHOLD;
	}

	function getHeroReturnThreshold() {
		return isNarrowViewport() ? MOBILE_HERO_RETURN_THRESHOLD : HERO_RETURN_THRESHOLD;
	}

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
				scrollTo: getHeroScrollTarget(),
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
		heroScrollLocked.set(false);
		heroAnimatingStore.set(false);

		const initialScrollY = window.scrollY;
		const startMorphed = !isHomePage || initialScrollY > getHeroEnterThreshold();

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
				width: () =>
					window.innerWidth > 1333 ? '1200px' : isNarrowViewport() ? 'calc(100vw - 20px)' : '90vw',
				height: () => (isNarrowViewport() ? '72px' : '80px'),
				borderRadius: () => (isNarrowViewport() ? '36px' : '50px'),
				top: () => (isNarrowViewport() ? '12px' : '24px'),
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			sparkleImage,
			{
				width: () => (isSmallViewport() ? '540px' : isNarrowViewport() ? '660px' : '800px'),
				left: () => (isNarrowViewport() ? '-130px' : '-140px'),
				bottom: () => (isNarrowViewport() ? '290px' : '360px'),
				yPercent: 0
			},
			{
				width: () => (isNarrowViewport() ? '72px' : '100px'),
				left: () => (isNarrowViewport() ? '-10px' : '-5px'),
				bottom: () => (isNarrowViewport() ? '50%' : '55%'),
				yPercent: 50,
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			heroName,
			{
				fontSize: () => (isSmallViewport() ? '68px' : isNarrowViewport() ? '80px' : '96px'),
				left: () =>
					window.innerWidth >= 1024 ? '96px' : window.innerWidth >= 768 ? '64px' : '20px',
				bottom: () => (isNarrowViewport() ? '188px' : '220px')
			},
			{
				fontSize: () => (isSmallViewport() ? '24px' : isNarrowViewport() ? '30px' : '36px'),
				left: () => (isNarrowViewport() ? '20px' : '100px'),
				bottom: () => (isNarrowViewport() ? '20px' : '24px'),
				ease: 'power2.inOut',
				duration: 0.6
			},
			0
		);

		morphTl.fromTo(
			heroName,
			{ opacity: 1 },
			{
				opacity: () => (isSmallViewport() ? 0 : 1),
				duration: 0.35,
				ease: 'power2.out'
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
				top: () => (isNarrowViewport() ? '20px' : '32px'),
				right: () => (isNarrowViewport() ? '16px' : '32px'),
				scale: () => (isNarrowViewport() ? 0.85 : 1),
				yPercent: 0
			},
			{
				top: '50%',
				right: () => (isNarrowViewport() ? '10px' : '16px'),
				scale: () => (isNarrowViewport() ? 0.8 : 1),
				yPercent: -50,
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
				top: () => (isNarrowViewport() ? '48px' : '56px')
			},
			{
				top: () => (isNarrowViewport() ? '36px' : '40px'),
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
			const heroEnterThreshold = getHeroEnterThreshold();
			const heroReturnThreshold = getHeroReturnThreshold();

			// At hero, scrolling down -> morph to pill
			if (currentSection === 0 && direction === 1 && scrollY < heroEnterThreshold) {
				e.preventDefault();
				morphToPill();
			}
			// At pill, scrolling up near top -> restore hero
			else if (currentSection === 1 && direction === -1 && scrollY <= heroReturnThreshold) {
				e.preventDefault();
				morphToHero();
			}
		}

		function handleScroll() {
			if (!isHomePage || isAnimating || Date.now() < wheelUnlockUntil) {
				return;
			}

			const scrollY = window.scrollY;

			if (currentSection === 0 && scrollY > getHeroEnterThreshold()) {
				morphToPill();
			} else if (currentSection === 1 && scrollY <= 8) {
				morphToHero();
			}
		}

		const wheelListenerOptions: AddEventListenerOptions = { passive: false, capture: true };
		window.addEventListener('wheel', handleWheel, wheelListenerOptions);
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('wheel', handleWheel, wheelListenerOptions);
			window.removeEventListener('scroll', handleScroll);
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
			<div class="absolute inset-0 bg-black/40"></div>
		</div>

		<div class="pointer-events-none relative h-full w-full">
			<div
				bind:this={sparkleImage}
				class="pointer-events-none absolute origin-bottom-left"
				style="width: clamp(540px, 70vw, 800px); left: -140px; bottom: clamp(290px, 40vh, 360px);"
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
				class="absolute right-5 bottom-64 left-5 z-10 origin-bottom-left sm:right-auto sm:bottom-78 sm:left-8 md:left-16 lg:left-24"
			>
				<h1
					class="font-serif text-5xl leading-[0.9] font-medium tracking-tight text-white/50 sm:text-6xl md:text-8xl lg:text-9xl"
				>
					Hello, I'm <br />
				</h1>
			</div>

			<h1
				bind:this={heroName}
				class="absolute right-5 left-5 z-10 origin-bottom-left font-serif leading-[0.9] font-medium tracking-tight sm:right-auto sm:left-8 sm:whitespace-nowrap md:left-16 lg:left-24"
				style="font-size: clamp(68px, 17vw, 96px); bottom: clamp(188px, 27vh, 220px);"
			>
				<span
					class="bg-linear-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent"
				>
					Mufaro
				</span>
			</h1>

			<div
				bind:this={heroDescription}
				class="absolute right-5 bottom-10 left-5 z-10 sm:right-auto sm:bottom-25 sm:left-8 md:left-16 lg:left-24"
			>
				<p
					class="max-w-[92vw] text-base leading-relaxed text-white/80 sm:max-w-xl sm:text-lg md:text-xl lg:max-w-md"
				>
					I'm an 18 year old from Poland who makes software, reverse engineers, plays games and is
					passionate about learning new things.
				</p>
			</div>

			<div
				bind:this={navbarContainer}
				class="pointer-events-auto absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
				style="top: 56px;"
			>
				<!-- <HeroNavbar /> -->
			</div>

			<div
				bind:this={discordContainer}
				class="pointer-events-auto absolute z-20 hidden origin-top-right sm:block"
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
		class="pointer-events-none absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-8"
		style="opacity: 0.5;"
	>
		<span class="text-xs tracking-widest text-white/60 uppercase">Scroll</span>
		<div class="h-12 w-px bg-linear-to-b from-transparent via-white/50 to-transparent"></div>
	</div>
</div>
