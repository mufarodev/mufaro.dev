<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import ScrambleText from '$lib/components/core/scramble-text.svelte';

	type ExperienceItem = {
		title: string;
		period: string;
		role: string;
		summary: string;
		impact: string;
		tags: string[];
	};

	const experienceItems: ExperienceItem[] = [
		{
			title: 'The Great Emu Relocation',
			period: '2023 - Present',
			role: 'Flightless Logistics Specialist',
			summary:
				'Coordinated the diplomatic migration of 400 disgruntled emus across state lines using only a harmonica and a school bus.',
			impact:
				'Successfully avoided a regional uprising and significantly improved my 40-yard dash.',
			tags: ['Animal Husbandry', 'Crisis Management', 'Harmonica', 'Speed']
		},
		{
			title: 'Subterranean Disco',
			period: '1994 - 1996',
			role: 'Deep-Crust DJ',
			summary:
				'Operated a high-fidelity sound system inside an abandoned salt mine for a community of very rhythmic mole-people.',
			impact:
				'Achieved a world record for the lowest bass drop ever recorded (4,000ft below sea level).',
			tags: ['Acoustics', 'Mining', 'Funky Beats', 'Low Oxygen']
		},
		{
			title: 'Professional Cloud Watcher',
			period: '2022 - Present',
			role: 'Cumulus Critic',
			summary:
				'Provided harsh, unsolicited feedback to various atmospheric vapor formations regarding their lack of structural integrity.',
			impact: 'Documented 14 instances of clouds pretending to be sheep just to get attention.',
			tags: ['Meteorology', 'Judgment', 'Lawn Chairs', 'Staring']
		},
		{
			title: 'Toaster Archaeology',
			period: 'Ongoing',
			role: 'Chief Excavator',
			summary:
				'Uncovering the hidden history of 1950s kitchen appliances buried in my backyard. Currently piecing together a sentient bread-warmer.',
			impact: 'Recovered three burnt slices of sourdough from the Eisenhower administration.',
			tags: ['History', 'Rust', 'Breakfast', 'Carbon Dating']
		},
		{
			title: 'Universal Spoon Bending',
			period: 'The Dawn of Time',
			role: 'Cutlery Consultant',
			summary:
				'Assisted local diners in converting their rigid metal spoons into modern, unusable abstract art through sheer willpower.',
			impact: 'Increased soup-related frustration by 400% across the greater tri-state area.',
			tags: ['Telekinesis', 'Kitchenware', 'Chaos', 'Psychology']
		}
	];

	let sectionRef: HTMLElement;
	let railRef: HTMLDivElement;
	let trackRef: HTMLDivElement;
	let cards: HTMLElement[] = [];
	let activeIndex = $state(0);

	let timeline: gsap.core.Timeline | null = null;
	let introRevealTl: gsap.core.Timeline | null = null;
	let introFallbackTrigger: ScrollTrigger | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let removeHeroRevealListener: (() => void) | null = null;
	let waitsForHeroReveal = false;

	function getEntryOffset() {
		if (!railRef) return 0;
		return Math.min(420, Math.round(railRef.clientWidth * 0.32));
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

	function updateActiveCard() {
		if (!cards.length) return;

		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;
		const viewportCenter = window.innerWidth * 0.5;

		cards.forEach((card, index) => {
			const rect = card.getBoundingClientRect();
			const cardCenter = rect.left + rect.width * 0.5;
			const distance = Math.abs(cardCenter - viewportCenter);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		activeIndex = closestIndex;
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

		const getTravelDistance = () => Math.max(0, getStepDistance() * (cards.length - 1));
		const getTotalDistance = () => getEntryOffset() + getTravelDistance();
		const getPinStartOffset = () => Math.round(Math.max(104, window.innerHeight * 0.12));

		gsap.set(trackRef, { x: getEntryOffset() });
		activeIndex = 0;

		timeline = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef,
				pin: sectionRef,
				start: () => `top top+=${getPinStartOffset()}`,
				end: () => `+=${getTotalDistance()}`,
				scrub: 0.75,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onUpdate: updateActiveCard,
				onRefresh: updateActiveCard
			}
		});

		timeline.to(trackRef, { x: () => -getTravelDistance(), ease: 'none' }, 0);

		requestAnimationFrame(updateActiveCard);
	}

	function setupMobileLayout() {
		if (!trackRef || cards.length === 0) return;

		activeIndex = 0;
		gsap.set(trackRef, { clearProps: 'transform' });
		gsap.set(cards, { clearProps: 'opacity,transform' });
	}

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);
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

<section bind:this={sectionRef} class="relative w-full overflow-hidden">
	<div class="mx-auto w-full max-w-7xl px-6 pt-24 pb-8 md:px-12 md:pt-28 lg:pt-16 lg:pb-10">
		<div class="z-20 max-w-3xl">
			<div class="mb-5 flex items-center gap-4">
				<div class="h-px w-14 bg-gradient-to-r from-white/35 to-transparent"></div>
				<span class="font-mono text-xs tracking-[0.24em] text-white/45 uppercase">Experience</span>
			</div>
			<h2 class="font-serif text-5xl leading-[0.94] text-white md:text-7xl lg:text-8xl">
				<ScrambleText text="Projects that Flow In" />
			</h2>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
				hello this needs some text
			</p>
		</div>
	</div>

	<div
		bind:this={railRef}
		class="relative left-1/2 h-auto w-screen -translate-x-1/2 lg:h-[72svh] lg:max-h-[760px] lg:min-h-[520px]"
	>
		<div
			bind:this={trackRef}
			class="flex flex-col gap-4 px-6 lg:h-[90%] lg:flex-row lg:gap-7 lg:px-[9vw]"
		>
			{#each experienceItems as item, index}
				<article
					bind:this={cards[index]}
					class="timeline-card relative w-full shrink-0 overflow-hidden rounded-[1.65rem] border border-white/12 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.13),rgba(255,255,255,0.04)_56%,rgba(2,2,8,0.78)_100%)] p-6 shadow-[0_40px_90px_-55px_rgba(0,0,0,0.95)] lg:w-[min(86vw,980px)] lg:p-10"
					class:is-active={index === activeIndex}
				>
					<div
						class="absolute inset-0 opacity-90"
						style="background: linear-gradient(115deg, rgba(var(--accent-r,136), var(--accent-g,153), var(--accent-b,170),0.08), transparent 42%);"
					></div>
					<div class="relative flex h-full flex-col">
						<div class="mb-10 flex items-start justify-between gap-4">
							<div>
								<p class="font-mono text-xs tracking-[0.22em] text-white/45 uppercase">
									Project {String(index + 1).padStart(2, '0')}
								</p>
								<h3 class="mt-3 font-serif text-4xl leading-tight text-white md:text-6xl">
									{item.title}
								</h3>
							</div>
							<div
								class="rounded-full border border-white/15 bg-black/20 px-3 py-1 font-mono text-xs whitespace-nowrap text-white/55"
							>
								{item.period}
							</div>
						</div>

						<p
							class="font-mono text-sm tracking-wide uppercase"
							style="color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));"
						>
							{item.role}
						</p>

						<p class="mt-5 max-w-3xl text-lg leading-relaxed text-white/72 lg:text-2xl">
							{item.summary}
						</p>

						<p class="mt-6 max-w-3xl text-base leading-relaxed text-white/56 lg:text-lg">
							{item.impact}
						</p>

						<div class="mt-auto pt-10">
							<div class="h-px w-full bg-gradient-to-r from-white/20 to-transparent"></div>
							<div class="mt-4 flex flex-wrap gap-2">
								{#each item.tags as tag}
									<span
										class="rounded-md border border-white/14 bg-black/25 px-2 py-1 font-mono text-xs tracking-wide text-white/60"
									>
										{tag}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	@media (min-width: 1024px) {
		.timeline-card {
			opacity: 0.42;
			transform: translateY(10px) scale(0.985);
			transition:
				opacity 260ms ease,
				transform 260ms ease,
				border-color 260ms ease;
		}

		.timeline-card.is-active {
			opacity: 1;
			transform: translateY(0) scale(1);
			border-color: rgba(255, 255, 255, 0.22);
		}
	}
</style>
