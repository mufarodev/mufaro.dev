<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import ScrambleText from '$lib/components/core/scramble-text.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { GithubIcon, ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

	gsap.registerPlugin(ScrollTrigger);

	type ExperienceItem = {
		title: string;
		period: string;
		role: string;
		summary: string;
		impact: string;
		tags: string[];
		image?: string;
		url?: string;
		githubUrl?: string;
	};

	const experienceItems: ExperienceItem[] = [
		{
			title: 'Project Nova',
			period: '2024-2025',
			role: 'Software Developer',
			summary:
				'Built a desktop game launcher using WebView2. Contributed to the development of the webpage. All done with a huge focus on the experience and product usability.',
			impact:
				'Contributed to a project that reached over 2M+ unique users and was used by major gaming content creators',
			tags: ['Fortnite', 'Desktop', 'Game Hosting Platform'],
			image: '/images/nova-website.png',
			url: 'https://novafn.dev'
		},
		{
			title: 'Cartesian',
			period: '2025',
			role: 'Developer (Hackathon Team)',
			summary:
				'Built a social meetup app prototype that helps people discover and organize in-person events around shared interests',
			impact:
				'A complete hackathon project with AI-assisted discovery and map-based meetup planning. Did not win a prize.',
			tags: ['Social App', 'AI Search', 'Maps', 'Hackathon'],
			image: '/images/cartesian.png',
			githubUrl: 'https://github.com/lythar/Cartesian'
		},
		{
			title: 'Lythar',
			period: '2023',
			role: 'Developer (Hackathon Team)',
			summary:
				'An internal communication tool for teams with private messaging, channels, Markdown/LaTeX rendering, and file attachments',
			impact: 'Placed 3rd out of 200+ teams, validating both the product direction and implementation quality!',
			tags: ['Internal Tools', 'Social', 'Productivity', 'Work'],
			image: '/images/lythar.png',
			githubUrl: 'https://github.com/lythar/lythar-frontend'
		}
	];

	let sectionRef: HTMLElement;
	let railRef: HTMLDivElement;
	let trackRef: HTMLDivElement;
	let cards: HTMLElement[] = $state([]);
	let activeIndex = $state(0);

	let timeline: gsap.core.Timeline | null = null;
	let introRevealTl: gsap.core.Timeline | null = null;
	let introFallbackTrigger: ScrollTrigger | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let removeHeroRevealListener: (() => void) | null = null;
	let waitsForHeroReveal = false;

	function getEntryOffset() {
		if (!railRef || !trackRef || cards.length === 0) return 0;

		const firstCard = cards[0];
		if (!firstCard) return 0;

		const styles = window.getComputedStyle(trackRef);
		const leftPadding = Number.parseFloat(styles.paddingLeft);
		const rightPadding = Number.parseFloat(styles.paddingRight);
		const safeLeftPadding = Number.isFinite(leftPadding) ? leftPadding : 0;
		const safeRightPadding = Number.isFinite(rightPadding) ? rightPadding : 0;
		const railWidth = railRef.clientWidth;
		const cardWidth = firstCard.getBoundingClientRect().width;
		const preferredOffset = Math.round(railWidth * 0.18);
		const maxOffset = railWidth - cardWidth - safeLeftPadding - safeRightPadding;

		return Math.max(0, Math.min(preferredOffset, maxOffset));
	}

	function killTimeline() {
		timeline?.scrollTrigger?.kill();
		timeline?.kill();
		timeline = null;
	}

	function playIntroReveal() {
		if (!sectionRef) return;

		introRevealTl?.kill();
		introRevealTl = gsap.timeline();

		introRevealTl.fromTo(
			sectionRef,
			{ autoAlpha: 0, y: 34 },
			{
				autoAlpha: 1,
				y: 0,
				duration: 0.55,
				ease: 'power3.out',
				clearProps: 'opacity,visibility,transform'
			},
			0
		);

		if (cards.length) {
			introRevealTl.fromTo(
				cards,
				{ autoAlpha: 0, y: 22, scale: 0.992 },
				{
					autoAlpha: 1,
					y: 0,
					scale: 1,
					duration: 0.42,
					ease: 'power2.out',
					stagger: 0.05,
					clearProps: 'opacity,visibility,transform'
				},
				0.08
			);
		}
	}

	function setupIntroReveal() {
		if (!sectionRef) return;

		waitsForHeroReveal = window.scrollY < 24;

		if (!waitsForHeroReveal) {
			gsap.set(sectionRef, { clearProps: 'opacity,visibility,transform' });
			return;
		}

		gsap.set(sectionRef, { autoAlpha: 0, y: 34 });
		if (cards.length) {
			gsap.set(cards, { autoAlpha: 0, y: 22, scale: 0.992 });
		}

		const onHeroReveal = () => {
			if (!waitsForHeroReveal) return;

			waitsForHeroReveal = false;
			playIntroReveal();
		};

		window.addEventListener('hero:experience-reveal', onHeroReveal);
		removeHeroRevealListener = () =>
			window.removeEventListener('hero:experience-reveal', onHeroReveal);

		introFallbackTrigger?.kill();
		introFallbackTrigger = ScrollTrigger.create({
			trigger: sectionRef,
			start: 'top 82%',
			onEnter: onHeroReveal,
			onEnterBack: onHeroReveal,
			onRefresh: () => {
				if (window.scrollY > 24) {
					onHeroReveal();
				}
			}
		});
	}

	function setActiveFromProgress(progress: number) {
		if (!cards.length) return;

		const maxIndex = cards.length - 1;
		const nextIndex = Math.max(0, Math.min(maxIndex, Math.round(progress * maxIndex)));

		if (nextIndex !== activeIndex) {
			activeIndex = nextIndex;
		}
	}

	function setupDesktopTimeline() {
		if (!sectionRef || !railRef || !trackRef || cards.length === 0) return;

		const getGap = () => {
			const styles = window.getComputedStyle(trackRef);
			const value = styles.columnGap || styles.gap || '0';
			const gap = Number.parseFloat(value);
			return Number.isFinite(gap) ? gap : 0;
		};

		const getStepDistance = () => {
			const firstCard = cards[0];
			if (!firstCard) return 0;

			return firstCard.getBoundingClientRect().width + getGap();
		};

		let travelDistance = 0;
		let totalDistance = 1;

		const recalculateDistances = () => {
			travelDistance = Math.max(0, getStepDistance() * (cards.length - 1));
			totalDistance = Math.max(1, getEntryOffset() + travelDistance);
		};

		recalculateDistances();
		const getPinStartOffset = () => Math.round(Math.max(104, window.innerHeight * 0.12));

		gsap.set(trackRef, { x: getEntryOffset() });
		activeIndex = 0;

		timeline = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef,
				pin: sectionRef,
				start: () => `top top+=${getPinStartOffset()}`,
				end: () => `+=${totalDistance}`,
				scrub: 0.75,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onRefreshInit: () => {
					recalculateDistances();
					gsap.set(trackRef, { x: getEntryOffset() });
				},
				onUpdate: (self) => setActiveFromProgress(self.progress),
				onRefresh: (self) => setActiveFromProgress(self.progress)
			}
		});

		timeline.fromTo(
			trackRef,
			{ x: () => getEntryOffset() },
			{ x: () => -travelDistance, ease: 'none' },
			0
		);

		setActiveFromProgress(0);
	}

	function setupMobileLayout() {
		if (!trackRef || cards.length === 0) return;

		activeIndex = 0;
		gsap.set(trackRef, { clearProps: 'transform' });
		gsap.set(cards, { clearProps: 'opacity,transform' });
	}

	onMount(() => {
		setupIntroReveal();

		const applyLayoutMode = () => {
			killTimeline();

			if (mediaQuery?.matches) {
				setupDesktopTimeline();
			} else {
				setupMobileLayout();
			}

			ScrollTrigger.refresh();
		};

		mediaQuery = window.matchMedia('(min-width: 1024px)');
		applyLayoutMode();

		mediaQuery.addEventListener('change', applyLayoutMode);

		return () => {
			mediaQuery?.removeEventListener('change', applyLayoutMode);
			removeHeroRevealListener?.();
			removeHeroRevealListener = null;
			introFallbackTrigger?.kill();
			introFallbackTrigger = null;
			introRevealTl?.kill();
			introRevealTl = null;
			killTimeline();
		};
	});
</script>

<section bind:this={sectionRef} class="relative w-full overflow-hidden bg-[#050505]">
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-20"
	></div>

	<div
		class="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 pb-8 md:px-12 md:pt-28 lg:pt-12 lg:pb-10"
	>
		<div class="max-w-3xl">
			<h2 class="font-serif text-3xl font-medium text-white md:text-5xl lg:text-6xl">
				Things I've worked on
			</h2>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
				A few projects I've spent real time on, what I built, and what came out of it.
			</p>
		</div>
	</div>

	<div
		bind:this={railRef}
		class="relative left-1/2 h-auto w-screen -translate-x-1/2 pb-20 lg:h-[72svh] lg:max-h-[760px] lg:min-h-[520px] lg:pb-0 lg:[--timeline-accent:rgba(255,255,255,0.22)]"
	>
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[10vw] bg-gradient-to-r from-[#050505] to-transparent lg:block"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[10vw] bg-gradient-to-l from-[#050505] to-transparent lg:block"
			aria-hidden="true"
		></div>

		<div
			class="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-[90%] lg:block"
			aria-hidden="true"
		>
			<span
				class="absolute top-0 right-0 left-0 border-t border-dashed border-[var(--timeline-accent)] opacity-[0.74]"
			></span>
			<span
				class="absolute right-0 bottom-0 left-0 border-t border-dashed border-[var(--timeline-accent)] opacity-[0.74]"
			></span>
		</div>

		<div
			bind:this={trackRef}
			class="relative z-10 flex flex-col gap-8 px-6 lg:h-[90%] lg:flex-row lg:gap-8 lg:px-[clamp(2rem,5vw,7rem)]"
		>
			{#each experienceItems as item, index}
				<article
					bind:this={cards[index]}
					class={`group relative flex w-full shrink-0 flex-col border border-white/10 bg-[#0a0a0a] transition-[opacity,transform,border-color,shadow] duration-500 ease-out lg:w-[clamp(45rem,75vw,65rem)] lg:flex-row lg:items-stretch lg:overflow-visible lg:border-dashed ${
						index === activeIndex
							? 'lg:scale-100 lg:border-[var(--timeline-accent)] lg:opacity-100 lg:shadow-[0_0_50px_-12px_rgba(255,255,255,0.08)]'
							: 'lg:scale-[0.98] lg:opacity-40 lg:shadow-none'
					}`}
				>
					<div class="relative flex h-full w-full flex-col overflow-hidden lg:flex-row">
						<div
							class="relative z-20 flex flex-1 flex-col justify-between overflow-hidden bg-[#0a0a0a] p-6 sm:p-8 lg:w-1/2 lg:p-12"
						>
							<div
								class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"
							></div>
							<div
								class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ffffff03_0%,transparent_50%)]"
							></div>

							<div class="relative z-10">
								<div class="mb-8 flex items-center justify-between">
									<span
										class="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 font-sans text-xs font-medium tracking-wide text-white/60 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
									>
										{item.period}
									</span>
								</div>

								<h3
									class="mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text font-sans text-3xl font-bold tracking-tight text-transparent lg:text-4xl"
								>
									{item.title}
								</h3>

								<p
									class="mb-6 font-mono text-[13px] font-semibold tracking-wider text-white/30 uppercase"
								>
									{item.role}
								</p>

								<p class="mb-5 text-base leading-relaxed text-white/70">
									{item.summary}
								</p>

								<p class="text-sm leading-relaxed text-white/40">
									{item.impact}
								</p>
							</div>

							<div class="relative z-10 mt-10">
								<div class="mb-8 flex flex-wrap gap-2">
									{#each item.tags as tag}
										<span
											class="rounded-full border border-white/5 bg-white/[0.02] px-3.5 py-1.5 font-sans text-xs font-medium text-white/60 transition-colors group-hover:bg-white/[0.04]"
										>
											{tag}
										</span>
									{/each}
								</div>

								<div class="flex flex-wrap items-center gap-4">
									{#if item.url}
										<a
											href={item.url}
											target="_blank"
											rel="noreferrer"
											class="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-sans text-sm font-semibold text-black transition-transform duration-150 active:scale-[0.98] hover:scale-[1.01]"
										>
											View Project
											<HugeiconsIcon icon={ArrowUpRight01Icon} className="fill-current" size={16} />
										</a>
									{/if}
									{#if item.githubUrl}
										<a
											href={item.githubUrl}
											target="_blank"
											rel="noreferrer"
											class="flex items-center gap-2 rounded-full px-2 py-2.5 font-sans text-sm font-semibold text-white/70 hover:text-white"
										>
											Source Code
											<HugeiconsIcon icon={GithubIcon} className="fill-current" size={16} />
										</a>
									{/if}
								</div>
							</div>
						</div>

						<div
							class="relative flex min-h-[320px] w-full bg-[#0a0a0a] lg:min-h-full lg:w-1/2 lg:items-center"
						>
							{#if item.image}
								<img
									src={item.image}
									alt={item.title}
									class="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out"
								/>

								<div
									class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:hidden"
								></div>

								<!-- <div
									class="pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/92 to-transparent lg:block"
								></div> -->
								<div
									class="pointer-events-none absolute  hidden h-[100%] w-[100%] bg-[radial-gradient(circle_at_center,_transparent_40%,_#0a0a0a_80%,_#0a0a0a_84%)] opacity-95 lg:block"
								></div>
								<!-- <div
									class="pointer-events-none absolute -bottom-[18%] -left-[13%] hidden h-[72%] w-[78%] bg-[radial-gradient(circle_at_bottom_left,_#0a0a0a_12%,_#0a0a0a_55%,_transparent_84%)] opacity-95 lg:block"
								></div> -->

								<div
									class="pointer-events-none absolute inset-0 bg-black/20 transition-opacity duration-500"
								></div>
							{:else}
								<div
									class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]"
								>
									<div
										class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff05,_transparent)]"
									></div>
									<div
										class="opacity-20 transition-transform duration-700 ease-out group-hover:scale-110"
									>
										<svg
											width="48"
											height="48"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
											<circle cx="8.5" cy="8.5" r="1.5"></circle>
											<polyline points="21 15 16 10 5 21"></polyline>
										</svg>
									</div>

									<div
										class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent lg:hidden"
									></div>
									<div
										class="pointer-events-none absolute inset-y-0 left-0 hidden w-[44%] bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/92 to-transparent lg:block"
									></div>
									<div
										class="pointer-events-none absolute -top-[18%] -left-[12%] hidden h-[72%] w-[78%] bg-[radial-gradient(circle_at_top_left,_#0a0a0a_12%,_#0a0a0a_55%,_transparent_84%)] opacity-95 lg:block"
									></div>
									<div
										class="pointer-events-none absolute -bottom-[18%] -left-[12%] hidden h-[72%] w-[78%] bg-[radial-gradient(circle_at_bottom_left,_#0a0a0a_12%,_#0a0a0a_55%,_transparent_84%)] opacity-95 lg:block"
									></div>
								</div>
							{/if}
						</div>
					</div>

					<div
						class="pointer-events-none absolute inset-0 z-[15] hidden lg:block"
						aria-hidden="true"
					>
						<div
							class={`absolute top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${index === activeIndex ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
						>
							<div
								class="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[var(--timeline-accent)]"
							></div>
							<div
								class="absolute top-0 left-1/2 h-full w-[1px] -translate-x-1/2 bg-[var(--timeline-accent)]"
							></div>
						</div>
						<div
							class={`absolute top-0 right-0 h-4 w-4 translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${index === activeIndex ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
						>
							<div
								class="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[var(--timeline-accent)]"
							></div>
							<div
								class="absolute top-0 left-1/2 h-full w-[1px] -translate-x-1/2 bg-[var(--timeline-accent)]"
							></div>
						</div>
						<div
							class={`absolute bottom-0 left-0 h-4 w-4 -translate-x-1/2 translate-y-1/2 transition-all duration-500 ease-out ${index === activeIndex ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
						>
							<div
								class="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[var(--timeline-accent)]"
							></div>
							<div
								class="absolute top-0 left-1/2 h-full w-[1px] -translate-x-1/2 bg-[var(--timeline-accent)]"
							></div>
						</div>
						<div
							class={`absolute right-0 bottom-0 h-4 w-4 translate-x-1/2 translate-y-1/2 transition-all duration-500 ease-out ${index === activeIndex ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
						>
							<div
								class="absolute top-1/2 left-0 h-[1px] w-full -translate-y-1/2 bg-[var(--timeline-accent)]"
							></div>
							<div
								class="absolute top-0 left-1/2 h-full w-[1px] -translate-x-1/2 bg-[var(--timeline-accent)]"
							></div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>
