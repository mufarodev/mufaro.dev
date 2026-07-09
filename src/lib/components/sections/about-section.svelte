<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import { animate } from 'motion';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Github01Icon, Mail01Icon, TwitterIcon } from '@hugeicons/core-free-icons';

	interface Props {
		showSocials?: boolean;
	}

	let { showSocials = false }: Props = $props();

	gsap.registerPlugin(ScrollTrigger);

	let sectionRef: HTMLElement;
	let titleRef: HTMLElement;
	let paragraphs: HTMLElement[] = [];
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

	let socialLinks: HTMLElement[] = [];

	onMount(() => {
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

			socialLinks.forEach((link, i) => {
				gsap.fromTo(
					link,
					{ opacity: 0, y: 16, filter: 'blur(8px)' },
					{
						opacity: 1,
						y: 0,
						filter: 'blur(0px)',
						duration: 0.55,
						delay: 0.12 + i * 0.08,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: sectionRef,
							start: 'top 55%',
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
		<!-- <div class="mb-8 flex items-center gap-4">
			<div class="about-accent-line h-px w-12"></div>
			<span class="about-accent-muted font-mono text-xs tracking-widest uppercase">About Me</span>
		</div> -->

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
					Outside of that? I reverse engineer, play games, watch anime, and explore whatever new
					thing catches my eye.
				</p>
			</div>

			{#if showSocials}
				<div class="border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
					<p class="mb-3 text-sm text-white/50">Find me on</p>
					<div class="flex flex-wrap items-center gap-2 md:flex-col md:items-start">
						{#each socials as social, i}
							<a
							bind:this={socialLinks[i]}
							href={social.href}
							target={social.href.startsWith('mailto:') ? undefined : '_blank'}
							rel={social.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
							class="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] pr-3 text-white/70 transition-colors will-change-transform hover:border-white/30 hover:bg-white/[0.07] hover:text-white"
							aria-label={social.label}
						>
							<div class="flex h-10 w-10 shrink-0 items-center justify-center">
								<HugeiconsIcon icon={social.icon} size={18} className="fill-current/60" />
							</div>
							<span class="text-xs font-medium whitespace-nowrap">
								{social.display}
							</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.about-accent {
		color: rgb(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170));
	}

	.bg-about-accent {
		background-color: rgba(var(--accent-r, 136), var(--accent-g, 153), var(--accent-b, 170), 0.14);
	}
</style>
