<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

	let sectionRef: HTMLElement;
	let titleRef: HTMLElement;
	let paragraphs: HTMLElement[] = [];
	let statsRef: HTMLElement;

	const stats = [
		{ label: 'Years Coding', value: '5+' },
		{ label: 'Projects Built', value: '15+' },
		{ label: 'Users Reached', value: '100K+' }
	];

	onMount(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			gsap.fromTo(
				titleRef,
				{
					opacity: 0,
					y: 80,
					filter: 'blur(20px)'
				},
				{
					opacity: 1,
					y: 0,
					filter: 'blur(0px)',
					duration: 1,
					ease: 'power3.out',
					scrollTrigger: {
						trigger: sectionRef,
						start: 'top 70%',
						toggleActions: 'play none none reverse'
					}
				}
			);

			paragraphs.forEach((p, i) => {
				gsap.fromTo(
					p,
					{
						opacity: 0,
						y: 40,
						clipPath: 'inset(0 0 100% 0)'
					},
					{
						opacity: 1,
						y: 0,
						clipPath: 'inset(0 0 0% 0)',
						duration: 0.8,
						delay: i * 0.15,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: sectionRef,
							start: 'top 60%',
							toggleActions: 'play none none reverse'
						}
					}
				);
			});

			const statItems = statsRef?.querySelectorAll('.stat-item');
			statItems?.forEach((item, i) => {
				const valueEl = item.querySelector('.stat-value');
				const labelEl = item.querySelector('.stat-label');
				const line = item.querySelector('.stat-line');

				gsap.fromTo(
					line,
					{ scaleX: 0 },
					{
						scaleX: 1,
						duration: 0.6,
						delay: i * 0.1,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: statsRef,
							start: 'top 80%',
							toggleActions: 'play none none reverse'
						}
					}
				);

				gsap.fromTo(
					valueEl,
					{ opacity: 0, scale: 0.5, y: 20 },
					{
						opacity: 1,
						scale: 1,
						y: 0,
						duration: 0.5,
						delay: 0.2 + i * 0.1,
						ease: 'back.out(2)',
						scrollTrigger: {
							trigger: statsRef,
							start: 'top 80%',
							toggleActions: 'play none none reverse'
						}
					}
				);

				gsap.fromTo(
					labelEl,
					{ opacity: 0, y: 10 },
					{
						opacity: 1,
						y: 0,
						duration: 0.4,
						delay: 0.3 + i * 0.1,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: statsRef,
							start: 'top 80%',
							toggleActions: 'play none none reverse'
						}
					}
				);
			});
		}, sectionRef);

		return () => ctx.revert();
	});
</script>

<div
	bind:this={sectionRef}
	class="flex min-h-[calc(100svh-8rem)] w-full flex-col items-center justify-center px-8 py-12 md:px-24 md:py-16"
>
	<div class="w-full max-w-5xl">
		<!-- Section label -->
		<div class="mb-8 flex items-center gap-4">
			<div class="about-accent-line h-px w-12"></div>
			<span class="about-accent-muted font-mono text-xs tracking-widest uppercase">About Me</span>
		</div>

		<h2 bind:this={titleRef} class="mb-12 font-serif text-5xl text-white md:text-7xl lg:text-8xl">
			Just building<br />
			<span class="text-white/40">cool stuff</span>
		</h2>

		<div class="grid gap-12 md:grid-cols-2 md:gap-16">
			<div class="space-y-6 text-lg leading-relaxed text-white/60 md:text-xl">
				<p bind:this={paragraphs[0]}>
					I'm <span class="font-medium text-white">Mufaro</span>, an 18-year-old from Poland. I like
					building software that is
					<span class="about-accent bg-about-accent rounded-sm p-1 px-2">clean</span>,
					<span class="about-accent bg-about-accent rounded-sm p-1 px-2">quick</span>, and
					<span class="about-accent bg-about-accent rounded-sm p-1 px-2">beautiful</span>.
				</p>
				<p bind:this={paragraphs[1]}>
					My philosophy is pretty simple: make it work, make it fast, care about the user and don't
					make it annoying. That's about it
				</p>
				<p bind:this={paragraphs[2]}>
					Outside of that? I play games, watch anime, and explore whatever new thing catches my eye.
				</p>
			</div>

			<div bind:this={statsRef} class="space-y-8">
				{#each stats as stat, i}
					<div class="stat-item relative">
						<div
							class="stat-line absolute top-0 right-0 left-0 h-px origin-left bg-gradient-to-r from-white/10 to-transparent"
						></div>
						<div class="pt-6">
							<div
								class="stat-value font-mono text-4xl font-light tracking-tight text-white md:text-5xl"
							>
								{stat.value}
							</div>
							<div class="stat-label mt-2 text-sm tracking-wider text-white/40 uppercase">
								{stat.label}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.about-accent {
		color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));
	}

	.about-accent-muted {
		color: rgba(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170), 0.6);
	}

	.bg-about-accent {
		background-color: rgba(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170), 0.14);
	}

	.about-accent-line {
		background: linear-gradient(
			to right,
			rgba(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170), 0.85),
			transparent
		);
	}
</style>
