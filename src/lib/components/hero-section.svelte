<script lang="ts">
	import UsernameDisplay from './username-display.svelte';
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import type { IconSvgElement } from '@hugeicons/svelte';
	import {
		RocketIcon,
		BookOpen02Icon,
		Settings01Icon,
		CheckmarkCircle02Icon
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
		{ label: 'Project Nova', date: '2022 - Now', icon: NovaIcon },
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
		{ label: 'Users Reached', value: '100K+', suffix: 'users' },
		{ label: 'Years Building', value: '5', suffix: 'years' },
		{ label: 'Client Satisfaction', value: '100%', suffix: 'happy clients' },
		{ label: 'Projects Delivered', value: '15+', suffix: 'completed' }
	];

	let currentFactIndex = $state(0);
	let factContainer: HTMLElement | undefined = $state();
	let factValue: HTMLElement | undefined = $state();
	let factLabel: HTMLElement | undefined = $state();
	let journeyCards: HTMLElement[] = $state([]);
	let journeyLabels: HTMLElement[] = $state([]);
	let journeyLines: HTMLElement[] = $state([]);
	let heatmapCard: HTMLElement | undefined = $state();
	let factInterval: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		if (factContainer && factValue && factLabel) {
			animate(
				factContainer,
				{ opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
				{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }
			);

			factInterval = setInterval(() => {
				const nextIndex = (currentFactIndex + 1) % facts.length;

				if (factValue) {
					animate(
						factValue,
						{
							opacity: [1, 0],
							filter: ['blur(0px)', 'blur(8px)'],
							transform: ['scale(1)', 'scale(0.98)']
						},
						{ duration: 0.4, ease: 'easeOut' }
					);
				}
				if (factLabel) {
					animate(
						factLabel,
						{ opacity: [1, 0], filter: ['blur(0px)', 'blur(8px)'] },
						{ duration: 0.4, ease: 'easeOut' }
					);
				}

				setTimeout(() => {
					currentFactIndex = nextIndex;

					if (factValue && factLabel) {
						animate(
							factValue,
							{
								opacity: [0, 1],
								filter: ['blur(8px)', 'blur(0px)'],
								transform: ['scale(0.98)', 'scale(1)']
							},
							{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
						);
						animate(
							factLabel,
							{ opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] },
							{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }
						);
					}
				}, 400);
			}, 3000);
		}

		journeyCards.forEach((card, i) => {
			if (card) {
				// Animate card appearing
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
					{ duration: 0.4, delay: i * 0.4 + 0.8, ease: [0.22, 1, 0.36, 1] }
				);
			}
		});

		if (heatmapCard) {
			animate(
				heatmapCard,
				{ opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] },
				{ duration: 0.4, delay: 1, ease: [0.22, 1, 0.36, 1] }
			);
		}

		return () => {
			if (factInterval) {
				clearInterval(factInterval);
			}
		};
	});
</script>

<div class="space-y-6">
	<UsernameDisplay />

	<div class="space-y-4 text-sm leading-relaxed">
		<p class="text-foreground">
			I'm a <span class="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
				>17-year-old</span
			>
			developer from
			<span class="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">Poland</span> who
			genuinely loves building things for the web. I started teaching myself to code in 2020 and have
			since focused on getting practical experience building full-stack applications.
		</p>
		<p class="text-foreground">
			As a strong supporter of <span
				class="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary"
				>open-source software</span
			>, I believe that technology should be accessible to everyone. I'm now looking for a role
			where I can contribute to meaningful projects and continue to grow as a developer.
		</p>
	</div>

	<div
		bind:this={factContainer}
		class="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-5 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
	>
		<div class="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
		<div class="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-primary/3 blur-3xl"></div>

		<div class="relative flex items-center justify-between gap-6">
			<div class="flex items-baseline gap-3">
				<div
					bind:this={factValue}
					class="font-mono text-4xl font-bold tracking-tight text-foreground"
				>
					{facts[currentFactIndex].value}
				</div>
				<div bind:this={factLabel} class="text-sm font-medium text-muted-foreground">
					{facts[currentFactIndex].label}
				</div>
			</div>

			<div
				class="flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/60 px-3 py-2 backdrop-blur-sm"
			>
				{#each facts as _, i}
					<button
						onclick={() => {
							if (factValue && factLabel) {
								animate(
									factValue,
									{
										opacity: [1, 0],
										filter: ['blur(0px)', 'blur(8px)'],
										transform: ['scale(1)', 'scale(0.98)']
									},
									{ duration: 0.3 }
								);
								animate(
									factLabel,
									{ opacity: [1, 0], filter: ['blur(0px)', 'blur(8px)'] },
									{ duration: 0.3 }
								);
								setTimeout(() => {
									currentFactIndex = i;
									if (factValue && factLabel) {
										animate(
											factValue,
											{
												opacity: [0, 1],
												filter: ['blur(8px)', 'blur(0px)'],
												transform: ['scale(0.98)', 'scale(1)']
											},
											{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
										);
										animate(
											factLabel,
											{ opacity: [0, 1], filter: ['blur(8px)', 'blur(0px)'] },
											{ duration: 0.5, delay: 0.08, ease: [0.34, 1.56, 0.64, 1] }
										);
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
