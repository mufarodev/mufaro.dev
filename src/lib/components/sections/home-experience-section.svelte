<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
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
			impact:
				'Placed 3rd out of 200+ teams, validating both the product direction and implementation quality!',
			tags: ['Internal Tools', 'Social', 'Productivity', 'Work'],
			image: '/images/lythar.png',
			githubUrl: 'https://github.com/lythar/lythar-frontend'
		}
	];

	let sectionRef: HTMLElement;
	let railRef: HTMLDivElement;
	let trackRef: HTMLDivElement;
	let cards: HTMLElement[] = $state([]);
	let connectionPaths: SVGPathElement[] = $state([]);
	let outerGuides: SVGPathElement;

	let timeline: gsap.core.Timeline | null = null;
	let introRevealTl: gsap.core.Timeline | null = null;
	let introFallbackTrigger: ScrollTrigger | null = null;
	let mediaQuery: MediaQueryList | null = null;
	let motionQuery: MediaQueryList | null = null;
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
		const cardWidth = firstCard.offsetWidth;
		const preferredOffset = Math.max(
			Math.round(railWidth * 0.18),
			(railWidth - cardWidth) / 2 - safeLeftPadding
		);
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
		if (!sectionRef || mediaQuery?.matches || motionQuery?.matches) return;

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

	function setupDesktopTimeline() {
		if (!sectionRef || !railRef || !trackRef || cards.length === 0) return;

		// The shrinking hero reveals the desktop content in place. A second reveal
		// would move the pinned section vertically before the cards can scroll.
		waitsForHeroReveal = false;
		introRevealTl?.kill();
		introFallbackTrigger?.kill();
		removeHeroRevealListener?.();
		gsap.set([sectionRef, ...cards], { clearProps: 'opacity,visibility,transform' });

		let stepDistance = 1;
		let entryOffset = 0;
		let centerOffset = 0;
		let cardDrop = 0;
		let travelDistance = 0;
		let totalDistance = 1;
		const guideLength = 32;
		let cardBounds: { x: number; y: number; width: number; height: number }[] = [];
		const surfaces = cards.map((card) => card.firstElementChild as HTMLElement);

		const recalculateDistances = () => {
			const firstCard = cards[0];
			// Layout measurements stay stable while the cards rotate and scale.
			stepDistance = cards[1] ? cards[1].offsetLeft - firstCard.offsetLeft : firstCard.offsetWidth;
			entryOffset = getEntryOffset();
			centerOffset = railRef.clientWidth / 2 - firstCard.offsetLeft - firstCard.offsetWidth / 2;
			cardDrop = Math.min(90, railRef.clientHeight * 0.14);
			travelDistance = stepDistance * (cards.length - 1) - centerOffset;
			totalDistance = Math.max(1, entryOffset + travelDistance);
			cardBounds = cards.map((card) => {
				const style = window.getComputedStyle(card);
				return {
					x: card.offsetLeft,
					y: card.offsetTop,
					width: Number.parseFloat(style.width),
					height: Number.parseFloat(style.height)
				};
			});
		};

		const updateCards = (progress: number) => {
			const current = Math.max(
				0,
				Math.min(
					cards.length - 1,
					(progress * totalDistance - entryOffset + centerOffset) / stepDistance
				)
			);

			const frames = cards.map((card, index) => {
				const distance = Math.max(-1.5, Math.min(1.5, index - current));
				const proximity = Math.min(1, Math.abs(distance));
				const y = motionQuery?.matches ? 0 : distance * distance * cardDrop;
				const rotation = motionQuery?.matches ? 0 : distance * 3;
				const scale = motionQuery?.matches ? 1 : 1 - proximity * 0.025;
				// The same arc lifts incoming cards and lowers outgoing cards in either scroll direction.
				card.style.transform = motionQuery?.matches
					? 'none'
					: `translate3d(0, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
				surfaces[index].style.opacity = String(1 - proximity * 0.55);

				// SVG connections share the track's coordinates; no layout reads are needed while scrolling.
				const bounds = cardBounds[index];
				const cosine = Math.cos((rotation * Math.PI) / 180);
				const sine = Math.sin((rotation * Math.PI) / 180);
				const corner = (x: number, yOffset: number) => ({
					x: bounds.x + bounds.width / 2 + (x * cosine - yOffset * sine) * scale,
					y: bounds.y + bounds.height / 2 + y + (x * sine + yOffset * cosine) * scale
				});
				return {
					cosine,
					sine,
					corners: [
						corner(-bounds.width / 2, -bounds.height / 2),
						corner(bounds.width / 2, -bounds.height / 2),
						corner(-bounds.width / 2, bounds.height / 2),
						corner(bounds.width / 2, bounds.height / 2)
					]
				};
			});

			frames.slice(1).forEach((next, index) => {
				const previous = frames[index];
				for (const edge of [0, 1]) {
					const start = previous.corners[edge * 2 + 1];
					const end = next.corners[edge * 2];
					const handle = (end.x - start.x) / 2;
					// Match each card's edge tangent so the connecting rail bends without a kink.
					connectionPaths[index * 2 + edge].setAttribute(
						'd',
						`M ${start.x} ${start.y} C ${start.x + previous.cosine * handle} ${start.y + previous.sine * handle}, ${end.x - next.cosine * handle} ${end.y - next.sine * handle}, ${end.x} ${end.y}`
					);
				}
			});

			const first = frames[0];
			const last = frames[frames.length - 1];
			outerGuides.setAttribute(
				'd',
				[0, 1]
					.map((edge) => {
						const start = first.corners[edge * 2];
						const end = last.corners[edge * 2 + 1];
						return `M ${start.x - first.cosine * guideLength} ${start.y - first.sine * guideLength} L ${start.x} ${start.y} M ${end.x} ${end.y} L ${end.x + last.cosine * guideLength} ${end.y + last.sine * guideLength}`;
					})
					.join(' ')
			);
		};

		recalculateDistances();
		gsap.set(trackRef, { x: entryOffset });

		timeline = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef,
				pin: sectionRef,
				// Pin where the hero reveals the section, with no vertical lead-in.
				start: 0,
				end: () => `+=${totalDistance}`,
				// ScrollSmoother already eases the page position; follow it without extra lag.
				scrub: true,
				anticipatePin: 1,
				invalidateOnRefresh: true,
				onRefreshInit: () => {
					recalculateDistances();
					gsap.set(trackRef, { x: entryOffset });
				},
				onUpdate: (self) => updateCards(self.progress),
				onRefresh: (self) => updateCards(self.progress)
			}
		});

		timeline.fromTo(
			trackRef,
			{ x: () => entryOffset },
			{ x: () => -travelDistance, ease: 'none' },
			0
		);

		updateCards(timeline.scrollTrigger?.progress ?? 0);
	}

	function setupMobileLayout() {
		if (!trackRef || cards.length === 0) return;

		gsap.set(trackRef, { clearProps: 'transform' });
		gsap.set(cards, { clearProps: 'opacity,transform' });
		gsap.set(
			cards.map((card) => card.firstElementChild),
			{ clearProps: 'opacity' }
		);
	}

	function focusCard(event: FocusEvent, index: number) {
		const trigger = timeline?.scrollTrigger;
		if (
			!trigger ||
			!(event.target instanceof HTMLElement) ||
			!event.target.matches(':focus-visible')
		) {
			return;
		}

		// Keyboard navigation brings the whole project into view without a timed transition.
		sectionRef.scrollTo(0, 0);
		const card = cards[index];
		const center =
			getEntryOffset() + card.offsetLeft + card.offsetWidth / 2 - railRef.clientWidth / 2;
		trigger.scroll(Math.max(trigger.start, Math.min(trigger.end, trigger.start + center)));
	}

	onMount(() => {
		mediaQuery = window.matchMedia('(min-width: 1024px)');
		motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
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

		applyLayoutMode();

		mediaQuery.addEventListener('change', applyLayoutMode);
		motionQuery.addEventListener('change', applyLayoutMode);

		return () => {
			mediaQuery?.removeEventListener('change', applyLayoutMode);
			motionQuery?.removeEventListener('change', applyLayoutMode);
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

<section bind:this={sectionRef} class="relative w-full overflow-hidden bg-[#050505] lg:-mt-8">
	<div
		class="pointer-events-none absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-20"
	></div>

	<div
		class="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 pb-8 md:px-12 md:pt-28 lg:pt-0 lg:pb-8"
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
		class="relative left-1/2 h-auto w-screen -translate-x-1/2 pb-20 lg:h-[72svh] lg:max-h-[760px] lg:min-h-[520px] lg:pb-0 lg:[--timeline-accent:#34312f]"
	>
		<div class="project-grid" aria-hidden="true"></div>
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[10vw] bg-gradient-to-r from-[#050505] to-transparent lg:block"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[10vw] bg-gradient-to-l from-[#050505] to-transparent lg:block"
			aria-hidden="true"
		></div>

		<div
			bind:this={trackRef}
			class="relative z-10 flex flex-col gap-8 px-6 lg:h-[90%] lg:flex-row lg:gap-14 lg:px-[clamp(2rem,5vw,7rem)]"
		>
			<svg class="project-connections" aria-hidden="true">
				<path bind:this={outerGuides}></path>
				{#each experienceItems.slice(1) as item, index (item.title)}
					{#each [0, 1] as edge (edge)}
						<path class="project-connection" bind:this={connectionPaths[index * 2 + edge]}></path>
					{/each}
				{/each}
			</svg>
			{#each experienceItems as item, index (item.title)}
				<article
					bind:this={cards[index]}
					onfocusin={(event) => focusCard(event, index)}
					class="project-card group relative flex w-full shrink-0 flex-col border border-white/10 bg-[#0a0a0a] lg:w-[clamp(45rem,75vw,65rem)] lg:flex-row lg:items-stretch lg:overflow-visible lg:border-[var(--timeline-accent)]"
				>
					<div
						class="project-surface relative flex h-full w-full flex-col overflow-hidden lg:flex-row"
					>
						<div
							class="relative z-20 flex flex-1 flex-col justify-between overflow-hidden bg-[#0a0a0a] p-6 sm:p-8 lg:w-1/2 2xl:p-12"
						>
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
									{#each item.tags as tag (tag)}
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
											rel="external noreferrer"
											class="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 font-sans text-sm font-semibold text-black shadow-xs ring ring-white/80 transition-transform duration-150 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
										>
											<span
												aria-hidden="true"
												class="absolute inset-0 rounded-[inherit] bg-linear-to-b from-white to-white/78 shadow-[inset_0_1px_0_0_rgba(255,255,255,1),inset_0_-1px_0_0_rgba(0,0,0,0.22),inset_0_-10px_18px_-14px_rgba(0,0,0,0.55)] group-hover:from-white/92"
											></span>
											<span class="relative flex items-center gap-2">
												View Project
												<HugeiconsIcon
													icon={ArrowUpRight01Icon}
													className="fill-current"
													size={16}
												/>
											</span>
										</a>
									{/if}
									{#if item.githubUrl}
										<a
											href={item.githubUrl}
											target="_blank"
											rel="external noreferrer"
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
									class="pointer-events-none absolute hidden h-[100%] w-[100%] bg-[radial-gradient(circle_at_center,_transparent_40%,_#0a0a0a_80%,_#0a0a0a_84%)] opacity-95 lg:block"
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

					<div class="project-frame" aria-hidden="true">
						{#each [0, 100] as top (top)}
							{#each [0, 100] as left (left)}
								<span class="project-corner" style:top={`${top}%`} style:left={`${left}%`}></span>
							{/each}
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</div>
	<div class="pt-0 lg:pt-20"></div>
</section>

<style>
	.project-frame,
	.project-connections,
	.project-grid {
		display: none;
	}

	@media (min-width: 1024px) {
		.project-card {
			z-index: 1;
		}

		.project-grid {
			pointer-events: none;
			position: absolute;
			inset: -24px 0 -64px;
			display: block;
			background: radial-gradient(circle, #34312f 0.8px, transparent 1px) 0 0 / 18px 18px;
			mask-image: linear-gradient(transparent, black 48px, black calc(100% - 96px), transparent);
		}

		.project-connections {
			pointer-events: none;
			position: absolute;
			inset: 0;
			display: block;
			width: 100%;
			height: 100%;
			overflow: visible;
			fill: none;
			stroke: var(--timeline-accent);
			stroke-width: 1px;
		}

		.project-frame {
			pointer-events: none;
			position: absolute;
			inset: -1px;
			z-index: 30;
			display: block;
			color: var(--timeline-accent);
		}

		/* Dashed construction lines continue through the square corner junctions. */
		.project-frame::before,
		.project-frame::after {
			position: absolute;
			top: -24px;
			bottom: -24px;
			width: 1px;
			content: '';
			background: repeating-linear-gradient(to bottom, currentColor 0 16px, transparent 16px 40px);
		}

		.project-frame::before {
			left: 0;
		}

		.project-frame::after {
			right: 0;
		}

		.project-corner {
			position: absolute;
			z-index: 1;
			width: 1.125rem;
			height: 1.125rem;
			border: 1px solid currentColor;
			border-radius: 4px;
			transform: translate(-50%, -50%);
			background: #10100f;
		}
	}

	@media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
		.project-card {
			will-change: transform;
		}

		.project-surface {
			will-change: opacity;
		}
	}
</style>
