<script lang="ts">
	import UsernameDisplay from './username-display.svelte';
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import type { IconSvgElement } from '@hugeicons/svelte';
	import {
		RocketIcon,
		BookOpen02Icon,
		CheckmarkCircle02Icon,
		Github01Icon,
		Mail01Icon,
		TwitterIcon
	} from '@hugeicons/core-free-icons';
	import NovaIcon from './icons/nova-icon.svelte';

	const journeyStages: Array<{
		label: string;
		date: string;
		icon: IconSvgElement | typeof NovaIcon;
		active?: boolean;
	}> = [
		{ label: 'Self-Taught', date: '2020 - Now', icon: BookOpen02Icon },
		{ label: 'Freelancing', date: '2022 - Now', icon: RocketIcon },
		{ label: 'Project Nova', date: 'Mar/24 - May/25', icon: NovaIcon },
		{ label: 'Looking for a Role', date: 'Now', icon: CheckmarkCircle02Icon, active: true }
	];

	function generateHeatmap() {
		const now = new Date();
		const oneYearAgo = new Date(now);
		oneYearAgo.setFullYear(now.getFullYear() - 1);

		const data = [];
		const currentDate = new Date(oneYearAgo);

		while (currentDate <= now) {
			const intensity = Math.floor(Math.random() * 5);
			data.push({
				date: new Date(currentDate),
				value: intensity
			});
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return data;
	}

	function getMonthLabels(heatmapData: Array<{ date: Date; value: number }>) {
		if (heatmapData.length === 0) return [];

		const monthNames = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		const monthsMap = new Map();

		heatmapData.forEach((day) => {
			const key = `${day.date.getFullYear()}-${day.date.getMonth()}`;
			if (!monthsMap.has(key)) {
				monthsMap.set(key, {
					name: monthNames[day.date.getMonth()],
					month: day.date.getMonth(),
					year: day.date.getFullYear()
				});
			}
		});

		return Array.from(monthsMap.values());
	}

	const heatmapData = generateHeatmap();
	const totalContributions = heatmapData.filter((d) => d.value > 0).length * 3;
	const monthLabels = getMonthLabels(heatmapData);

	function getWeeksData(data: Array<{ date: Date; value: number }>) {
		const weeks = [];
		let currentWeek: Array<{ date: Date; value: number } | null> = [];

		const firstDate = data[0].date;
		const startDay = firstDate.getDay();

		for (let i = 0; i < startDay; i++) {
			currentWeek.push(null);
		}

		data.forEach((day) => {
			currentWeek.push(day);
			if (currentWeek.length === 7) {
				weeks.push([...currentWeek]);
				currentWeek = [];
			}
		});

		if (currentWeek.length > 0) {
			while (currentWeek.length < 7) {
				currentWeek.push(null);
			}
			weeks.push(currentWeek);
		}

		return weeks;
	}

	const weeksData = getWeeksData(heatmapData);

	function calculateStreak() {
		let currentStreak = 0;
		let maxStreak = 0;
		for (let i = heatmapData.length - 1; i >= 0; i--) {
			if (heatmapData[i].value > 0) {
				currentStreak++;
				maxStreak = Math.max(maxStreak, currentStreak);
			} else if (currentStreak > 0) {
				break;
			}
		}
		return { current: Math.ceil(currentStreak / 7), max: Math.ceil(maxStreak / 7) };
	}

	const streak = calculateStreak();

	const facts = [
		{
			label: 'Users Reached',
			value: '100K+',
			numericValue: 100000,
			suffix: 'users',
			startPercent: 0.6
		},
		{ label: 'Years Building', value: '5', numericValue: 5, suffix: 'years', startPercent: 0 },
		{
			label: 'Projects Delivered',
			value: '15+',
			numericValue: 15,
			suffix: 'completed',
			startPercent: 0.4
		}
	];

	const socials = [
		{
			icon: Github01Icon,
			label: 'GitHub',
			href: 'https://github.com/mufarodev',
			display: 'github.com/mufarodev'
		},
		{
			icon: Mail01Icon,
			label: 'Email',
			href: 'mailto:contact@mufaro.dev',
			display: 'contact@mufaro.dev'
		},
		{
			icon: TwitterIcon,
			label: 'X / Twitter',
			href: 'https://x.com/mufaro_dev',
			display: 'x.com/mufaro_dev'
		}
	];

	let socialLinks: HTMLElement[] = $state([]);
	let socialTexts: HTMLElement[] = $state([]);
	let socialIcons: HTMLElement[] = $state([]);

	function handleSocialHover(index: number, isHovering: boolean) {
		const text = socialTexts[index];
		const icon = socialIcons[index];
		const link = socialLinks[index];

		if (!text || !icon || !link) return;

		if (isHovering) {
			animate(link, { width: 'auto' }, { type: 'spring', stiffness: 100, damping: 15 });
			animate(
				text,
				{ opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] },
				{ type: 'spring', stiffness: 120, damping: 18 }
			);
			animate(icon, { scale: [1, 1.05] }, { type: 'spring', stiffness: 200, damping: 20 });
		} else {
			animate(
				text,
				{ opacity: [1, 0], filter: ['blur(0px)', 'blur(8px)'] },
				{ type: 'spring', stiffness: 150, damping: 20 }
			);
			animate(icon, { scale: [1.05, 1] }, { type: 'spring', stiffness: 200, damping: 20 });
			setTimeout(() => {
				if (link) {
					animate(link, { width: '36px' }, { type: 'spring', stiffness: 120, damping: 18 });
				}
			}, 100);
		}
	}

	let currentFactIndex = $state(0);
	let factContainer: HTMLElement | undefined = $state();
	let factValue: HTMLElement | undefined = $state();
	let factLabel: HTMLElement | undefined = $state();
	let journeyCards: HTMLElement[] = $state([]);
	let journeyLabels: HTMLElement[] = $state([]);
	let journeyLines: HTMLElement[] = $state([]);
	let heatmapCard: HTMLElement | undefined = $state();
	let factInterval: ReturnType<typeof setInterval> | undefined;
	let highlightElements: HTMLElement[] = $state([]);
	function formatFactValue(fact: (typeof facts)[0], current: number) {
		if (fact.value.includes('K')) {
			return `${Math.floor(current / 1000)}K+`;
		} else if (fact.value.includes('%')) {
			return `${current}%`;
		} else if (fact.value.includes('+')) {
			return `${current}+`;
		} else {
			return current.toString();
		}
	}

	let displayValue = $state(
		formatFactValue(facts[0], Math.floor(facts[0].numericValue * facts[0].startPercent))
	);
	let previousValue = $state('');

	function animateCountUp(fact: (typeof facts)[0], skipInitialAnimation = false) {
		const target = fact.numericValue;
		const startValue = Math.floor(target * fact.startPercent);

		const counter = { value: startValue };

		if (factValue && !skipInitialAnimation) {
			animate(
				factValue,
				{
					opacity: 1,
					filter: 'blur(0px)',
					transform: 'translateY(0px)'
				},
				{
					duration: 0.6,
					ease: [0.34, 1.56, 0.64, 1]
				}
			);
			factValue.style.opacity = '0';
			factValue.style.filter = 'blur(8px)';
			factValue.style.transform = 'translateY(8px)';
		}

		animate(
			counter,
			{ value: target },
			{
				duration: 1.5,
				ease: [0.33, 1, 0.68, 1],
				onUpdate: (latest) => {
					const current = Math.floor(counter.value);
					previousValue = displayValue;
					displayValue = formatFactValue(fact, current);
				},
				onComplete: () => {
					displayValue = fact.value;
				}
			}
		);
	}

	onMount(() => {
		if (factContainer && factValue && factLabel) {
			animate(
				factContainer,
				{ opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
				{ type: 'spring', stiffness: 120, damping: 18 }
			);

			setTimeout(() => {
				animateCountUp(facts[0], true);
			}, 300);

			factInterval = setInterval(() => {
				const nextIndex = (currentFactIndex + 1) % facts.length;

				if (factValue) {
					animate(
						factValue,
						{
							opacity: [1, 0],
							filter: ['blur(0px)', 'blur(8px)'],
							transform: ['scale(1) translateY(0px)', 'scale(0.95) translateY(-8px)']
						},
						{ type: 'spring', stiffness: 180, damping: 22 }
					);
				}
				if (factLabel) {
					animate(
						factLabel,
						{
							opacity: [1, 0],
							filter: ['blur(0px)', 'blur(8px)'],
							transform: ['translateY(0px)', 'translateY(-5px)']
						},
						{ type: 'spring', stiffness: 180, damping: 22 }
					);
				}

				setTimeout(() => {
					currentFactIndex = nextIndex;

					if (factValue && factLabel) {
						animate(
							factLabel,
							{
								opacity: [0, 1],
								filter: ['blur(8px)', 'blur(0px)'],
								transform: ['translateY(5px)', 'translateY(0px)']
							},
							{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }
						);

						setTimeout(() => {
							animateCountUp(facts[nextIndex]);
						}, 300);
					}
				}, 400);
			}, 5000);
		}

		journeyCards.forEach((card, i) => {
			if (card) {
				animate(
					card,
					{
						opacity: [0, 1],
						transform: ['scale(0.8)', 'scale(1)'],
						filter: ['blur(4px)', 'blur(0px)']
					},
					{ duration: 0.5, delay: i * 0.4 + 0.6, ease: [0.34, 1.56, 0.64, 1] }
				);
			}

			if (journeyLabels[i]) {
				animate(
					journeyLabels[i],
					{
						opacity: [0, 1],
						transform: ['translateY(-5px)', 'translateY(0px)'],
						filter: ['blur(4px)', 'blur(0px)']
					},
					{ duration: 0.5, delay: i * 0.4 + 0.7, ease: [0.34, 1.56, 0.64, 1] }
				);
			}

			if (journeyLines[i]) {
				animate(
					journeyLines[i],
					{
						transform: ['scaleX(0)', 'scaleX(1)'],
						opacity: [0, 1]
					},
					{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.4 + 0.8 }
				);
			}
		});

		if (heatmapCard) {
			animate(
				heatmapCard,
				{ opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
				{ type: 'spring', stiffness: 120, damping: 18, delay: 1 }
			);
		}

		return () => {
			if (factInterval) {
				clearInterval(factInterval);
			}
		};
	});
</script>

{#snippet highlight(text: string, index: number)}
	<span
		bind:this={highlightElements[index]}
		class="relative inline-flex items-center overflow-hidden rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary shadow-neu-highlight"
	>
		<span class="relative z-10">{text}</span>
	</span>
{/snippet}

<div class="space-y-6">
	<div class="flex items-start gap-4">
		<UsernameDisplay />

		<div class="ml-auto flex items-center gap-2">
			{#each socials as social, i}
				<a
					bind:this={socialLinks[i]}
					href={social.href}
					target={social.href.startsWith('mailto:') ? undefined : '_blank'}
					rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
					class="flex w-9 items-center gap-2 overflow-hidden rounded-lg bg-card text-muted-foreground outline-2 outline-border/70 transition-colors will-change-transform hover:bg-primary/5 hover:text-primary hover:outline-primary/30"
					aria-label={social.label}
					onmouseenter={() => handleSocialHover(i, true)}
					onmouseleave={() => handleSocialHover(i, false)}
				>
					<div bind:this={socialIcons[i]} class="flex h-9 w-9 shrink-0 items-center justify-center">
						<HugeiconsIcon icon={social.icon} size={18} className="fill-current/40" />
					</div>
					<span
						bind:this={socialTexts[i]}
						class="pr-3 text-xs font-medium whitespace-nowrap opacity-0 blur-md"
					>
						{social.display}
					</span>
				</a>
			{/each}
		</div>
	</div>

	<div class="space-y-4 text-sm leading-relaxed">
		<p class="text-foreground">
			I'm a {@render highlight('17-year-old', 0)} developer from
			{@render highlight('Poland', 1)} who genuinely loves building things for the web. I started teaching
			myself to code in 2020 and have since focused on getting practical experience building full-stack
			applications.
		</p>

		<div class="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
			<p class="flex-1 text-foreground">
				As a strong supporter of {@render highlight('open-source software', 2)}, I believe that
				technology should be accessible to everyone. I'm now looking for a role where I can
				contribute to meaningful projects and continue to grow as a developer.
			</p>

			<div
				bind:this={factContainer}
				class="group relative shrink-0 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-4 opacity-0 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 md:w-80"
			>
				<div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
				<div
					class="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/3 blur-3xl"
				></div>

				<div class="relative space-y-1">
					<div
						bind:this={factValue}
						class="font-mono text-4xl font-bold tracking-tight text-foreground transition-all will-change-[opacity,transform,filter]"
					>
						{displayValue}
					</div>
					<div bind:this={factLabel} class="text-sm font-semibold text-foreground/90">
						{facts[currentFactIndex].label}
					</div>
				</div>

				<div class="absolute right-4 bottom-4 flex items-center gap-2">
					{#each facts as _, i}
						<button
							onclick={() => {
								if (factValue && factLabel) {
									animate(
										factValue,
										{
											opacity: [1, 0],
											filter: ['blur(0px)', 'blur(8px)'],
											transform: ['scale(1) translateY(0px)', 'scale(0.95) translateY(-8px)']
										},
										{ type: 'spring', stiffness: 200, damping: 24 }
									);
									animate(
										factLabel,
										{
											opacity: [1, 0],
											filter: ['blur(0px)', 'blur(8px)'],
											transform: ['translateY(0px)', 'translateY(-5px)']
										},
										{ type: 'spring', stiffness: 200, damping: 24 }
									);
									setTimeout(() => {
										currentFactIndex = i;
										if (factValue && factLabel) {
											animate(
												factLabel,
												{
													opacity: [0, 1],
													filter: ['blur(8px)', 'blur(0px)'],
													transform: ['translateY(5px)', 'translateY(0px)']
												},
												{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] }
											);
											setTimeout(() => {
												animateCountUp(facts[i]);
											}, 300);
										}
									}, 300);
								}
							}}
							class="group/dot relative h-2 rounded-full transition-all duration-300 {i ===
							currentFactIndex
								? 'w-8 bg-primary shadow-lg shadow-primary/40'
								: 'w-2 bg-muted-foreground/30 hover:scale-125 hover:bg-muted-foreground/60'}"
							aria-label="Go to fact {i + 1}"
						>
							{#if i === currentFactIndex}
								<div class="absolute inset-0 rounded-full bg-primary/20 blur-md"></div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
	<!-- Journey Timeline -->
	<div class="relative pt-4 pb-6">
		<div class="mx-auto max-w-4xl">
			<div class="relative pb-12">
				<!-- Icons and connecting lines -->
				<div class="flex items-center justify-between px-12">
					{#each journeyStages as stage, i}
						<div class="relative will-change-transform">
							<div
								bind:this={journeyCards[i]}
								class="group relative z-10 h-12 w-12 rounded-xl bg-card opacity-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.03),inset_-1px_-1px_2px_rgba(0,0,0,0.2)] transition-all duration-300 hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.04),inset_-2px_-2px_4px_rgba(0,0,0,0.3)]"
							>
								{#if stage.active}
									<div
										class="absolute inset-[2px] rounded-lg border border-primary/20 bg-primary/[0.08]"
									></div>
								{/if}
								<div
									class="absolute inset-0 flex items-center justify-center {stage.active
										? 'text-primary'
										: 'text-muted-foreground group-hover:text-foreground'} transition-colors"
								>
									{#if stage.icon === NovaIcon}
										<stage.icon />
									{:else}
										<HugeiconsIcon icon={stage.icon as unknown as IconSvgElement} size={18} />
									{/if}
								</div>
							</div>

							<!-- Label positioned below icon -->
							<div
								bind:this={journeyLabels[i]}
								class="absolute top-full left-1/2 mt-3 -translate-x-1/2 text-center opacity-0"
							>
								<div class="text-[10px] font-medium whitespace-nowrap text-muted-foreground">
									{stage.date}
								</div>
								<h3 class="text-xs font-semibold whitespace-nowrap">{stage.label}</h3>
								{#if stage.active}
									<div class="mt-1 flex items-center justify-center">
										<div class="h-1 w-1 animate-pulse rounded-full bg-primary"></div>
									</div>
								{/if}
							</div>
						</div>

						{#if i < journeyStages.length - 1}
							<div bind:this={journeyLines[i]} class="mx-4 h-[2px] flex-1 origin-left opacity-0">
								{#if journeyStages[i + 1].active}
									<div
										class="h-full w-full bg-gradient-to-r from-border via-primary/50 to-primary"
									></div>
								{:else if stage.active}
									<div
										class="h-full w-full bg-gradient-to-r from-primary via-primary/50 to-border"
									></div>
								{:else}
									<div class="h-full w-full bg-border"></div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- <div bind:this={heatmapCard} class="relative opacity-0">
		<div class="space-y-3">
			<div class="flex items-baseline gap-2">
				<h3 class="text-sm font-bold text-foreground">Contribution Activity</h3>
				<div class="text-xs text-muted-foreground">
					<span class="font-mono font-semibold text-primary">{totalContributions}</span> contributions
					in the last year
				</div>
			</div>

			<div
				class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 p-4 backdrop-blur-sm"
			>
				<div
					class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
				></div>

				<div class="relative space-y-2">
					<div class="flex gap-[2px] pl-8">
						{#each monthLabels as month}
							<div class="flex-1 text-left text-[10px] font-medium text-muted-foreground">
								{month.name}
							</div>
						{/each}
					</div>

					<div class="flex gap-2">
						<div
							class="flex flex-col justify-between py-1 text-[9px] font-medium text-muted-foreground"
						>
							<div>Mon</div>
							<div>Wed</div>
							<div>Fri</div>
						</div>

						<div class="flex-1 overflow-x-auto">
							<div class="flex gap-[2px]">
								{#each weeksData as week}
									<div class="flex flex-col gap-[2px]">
										{#each week as day}
											{#if day === null}
												<div class="h-[9px] w-[9px]"></div>
											{:else}
												{@const value = day.value}
												<div
													class="h-[9px] w-[9px] rounded-[3px] transition-all duration-150 hover:scale-125 hover:rounded-sm {value ===
													0
														? 'bg-muted/40'
														: value === 1
															? 'bg-primary/25'
															: value === 2
																? 'bg-primary/45'
																: value === 3
																	? 'bg-primary/65'
																	: 'bg-primary'}"
													title="{value} contributions on {day.date.toLocaleDateString()}"
												></div>
											{/if}
										{/each}
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div
					class="mt-3 flex items-center justify-end border-t border-border/30 pt-3 text-xs text-muted-foreground"
				>
					<div class="flex items-center gap-2">
						<span>Less</span>
						<div class="flex gap-1">
							<div class="h-2 w-2 rounded-sm bg-muted/40"></div>
							<div class="h-2 w-2 rounded-sm bg-primary/25"></div>
							<div class="h-2 w-2 rounded-sm bg-primary/45"></div>
							<div class="h-2 w-2 rounded-sm bg-primary/65"></div>
							<div class="h-2 w-2 rounded-sm bg-primary"></div>
						</div>
						<span>More</span>
					</div>
				</div>
			</div>
		</div>
	</div> -->
</div>
