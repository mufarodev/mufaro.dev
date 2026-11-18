<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Copy01Icon } from '@hugeicons/core-free-icons';
	import HeroArtwork from '$lib/components/hero-artwork.svelte';
	import PixelStars from '$lib/components/pixel-stars.svelte';
	import Reel from '$lib/components/reel.svelte';
	import WeatherIcon from '$lib/components/weather-icon.svelte';
	import { getWeather } from '$lib/weather';
	import Presence from '$lib/components/presence.svelte';
	import SwapText from '$lib/components/swap-text.svelte';
	import { getLanyard } from '$lib/stores/lanyard.svelte';

	const presence = getLanyard();

	const projects = [
		{
			year: '2026',
			name: 'Discord Experiment Rollouts',
			type: 'Tool',
			blurb: 'Look up which Discord experiments and rollouts apply to your account.',
			icon: '/images/projects/rollouts.png',
			image: '/images/rollouts.webp',
			href: 'https://rollouts.wumpus.tools'
		},
		{
			year: '’24–25',
			name: 'Project Nova',
			type: 'Game launcher',
			blurb: 'Desktop launcher and website for a Fortnite server that reached 2M+ players.',
			icon: '/images/projects/nova.svg',
			image: '/images/nova-website.png',
			href: 'https://novafn.dev'
		},
		{
			year: '2023',
			name: 'Lythar',
			type: 'Hackathon',
			blurb: 'Team chat with channels, Markdown and LaTeX. Placed 3rd out of 200+ teams.',
			icon: '/images/projects/lythar.svg',
			image: '/images/lythar.png',
			href: 'https://github.com/lythar/lythar-frontend'
		}
	];

	type Button = { image: string; name: string; href?: string };
	const sticker = (file: string, name: string): Button => ({
		image: `/images/88x31/${file}.gif`,
		name
	});
	// Friends link out; the rest are decorative buttons from the cyber.dabamos.de 88x31 archive.
	const rows: Button[][] = [
		[
			{ href: 'https://melqtx.com/', image: '/images/88x31/melqtx.png', name: 'melqtx.com' },
			{ href: 'https://tiago.zip', image: '/images/88x31/tiago.gif', name: 'tiago.zip' },
			{ href: 'https://anemoia.moe', image: '/images/88x31/jesx.gif', name: 'anemoia.moe' },
			{ href: 'https://luniiya.me', image: '/images/88x31/luniiya.gif', name: 'luniiya.me' },
			sticker('neovim', 'Made with Neovim'),
			sticker('best_viewed_with_eyes', 'Best viewed with eyes'),
			sticker('antinft', 'Anti-NFT site')
		],
		[
			sticker('miku', 'Hatsune Miku approved'),
			sticker('anybrowser', 'Viewable with any browser'),
			sticker('nocookie', 'Certified cookie free'),
			sticker('github', 'GitHub'),
			sticker('steam', 'Play with Steam'),
			sticker('y2k', 'Y2K')
		]
	];

	const buttonCode =
		'<a href="https://mufaro.dev"><img src="https://mufaro.dev/images/88x31.png" alt="mufaro.dev" width="88" height="31"></a>';
	// transitions.dev icon swap + success check: the copy icon blurs out, a check draws in,
	// and the tooltip's label swaps to confirm. The check resets only after the swap back ends.
	let copied = $state(false);
	let tipLabel = $derived(copied ? 'Copied!' : 'Copy my button');
	let tipMeasure = $state<HTMLElement>();
	let tipWidth = $state(0);
	$effect(() => {
		void tipLabel;
		if (tipMeasure) tipWidth = tipMeasure.offsetWidth;
	});
	let checkShown = $state(false);
	let resetTimer: ReturnType<typeof setTimeout>;
	// The Clipboard API only exists in secure contexts; plain-http previews (e.g. the dev server
	// opened over LAN) fall back to the legacy copy command.
	async function writeClipboard(text: string) {
		if (window.isSecureContext && navigator.clipboard) return navigator.clipboard.writeText(text);
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.append(area);
		area.select();
		const ok = document.execCommand('copy');
		area.remove();
		if (!ok) throw new Error('Copy failed');
	}

	async function copyButton() {
		try {
			await writeClipboard(buttonCode);
		} catch {
			return;
		}
		clearTimeout(resetTimer);
		copied = true;
		checkShown = true;
		resetTimer = setTimeout(() => {
			copied = false;
			resetTimer = setTimeout(() => (checkShown = false), 250);
		}, 1800);
	}

	const clock = new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit',
		minute: '2-digit',
		timeZone: 'Europe/Warsaw'
	});
	// Rendered on the server too, so hydration doesn't swap a placeholder for the time.
	let time = $state(clock.format(new Date()));
	let list: HTMLUListElement;

	let { data } = $props();
	// Seeded from the server once; the interval below keeps it fresh.
	let weather = $state(untrack(() => data.weather));

	onMount(() => {
		const tick = () => (time = clock.format(new Date()));
		tick();
		const interval = setInterval(tick, 10_000);
		// The server sent the weather with the page; this only keeps it fresh.
		const refresh = setInterval(
			async () => (weather = (await getWeather(fetch)) ?? weather),
			15 * 60_000
		);
		return () => {
			clearInterval(interval);
			clearInterval(refresh);
		};
	});

	// The previews are fixed-position and read the cursor from these two variables.
	// The preview chases the cursor with a little lag and leans into horizontal movement.
	const FOLLOW = 90; // ms for the card to close ~63% of the gap
	const preview = { x: 0, y: 0, tx: 0, ty: 0, tilt: 0, frame: 0, last: 0 };

	function placePreview() {
		list.style.setProperty('--px', `${preview.x}px`);
		list.style.setProperty('--py', `${preview.y}px`);
		list.style.setProperty('--tilt', `${preview.tilt}deg`);
	}

	function stepPreview(now: number) {
		const dt = Math.min(now - preview.last, 50);
		preview.last = now;
		const k = 1 - Math.exp(-dt / FOLLOW);
		const dx = (preview.tx - preview.x) * k;
		preview.x += dx;
		preview.y += (preview.ty - preview.y) * k;
		// Lean from horizontal speed (px per ms), eased so it settles back upright.
		const lean = Math.max(-8, Math.min(8, (dx / Math.max(dt, 1)) * 6));
		preview.tilt += (lean - preview.tilt) * k;
		placePreview();
		const settled =
			Math.abs(preview.tx - preview.x) < 0.3 &&
			Math.abs(preview.ty - preview.y) < 0.3 &&
			Math.abs(preview.tilt) < 0.05;
		preview.frame = settled ? 0 : requestAnimationFrame(stepPreview);
	}

	function trackPreview(event: PointerEvent) {
		preview.tx = Math.min(event.clientX + 20, window.innerWidth - 344);
		preview.ty = Math.min(event.clientY + 20, window.innerHeight - 250);
		// Entering the list (or reduced motion): jump straight to the cursor so it never flies in from afar.
		if (event.type === 'pointerenter' || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			cancelAnimationFrame(preview.frame);
			preview.frame = 0;
			preview.x = preview.tx;
			preview.y = preview.ty;
			preview.tilt = 0;
			return placePreview();
		}
		if (!preview.frame) {
			preview.last = performance.now();
			preview.frame = requestAnimationFrame(stepPreview);
		}
	}
</script>

<div
	class="page"
	style:--accent-r={presence.color.r}
	style:--accent-g={presence.color.g}
	style:--accent-b={presence.color.b}
>
	<PixelStars />
	<header class="hero">
		<div class="frame">
			<HeroArtwork />
			<div class="presence-slot">
				<Presence />
			</div>
		</div>
	</header>

	<main>
		<div class="greeting">
			<h1 class="rise" style="--d: 80ms; --y: 16px; --blur: 4px">Hello, I'm <span>Mufaro</span></h1>
			<div class="now fade" style="--d: 80ms">
				<p><span class="digits"><Reel value={time} /></span> in Poland</p>
				<!-- Always rendered so the row's height is reserved before the weather arrives. -->
				<p class="weather">
					{#if weather}
						<span class="sky">
							{#key weather.icon}<WeatherIcon icon={weather.icon} />{/key}
							{weather.sky}
						</span>
						<span class="digits"><Reel value={String(weather.temp)} />°C</span>
					{/if}
				</p>
			</div>
		</div>

		<section class="intro">
			<p class="rise" style="--d: 160ms; --y: 10px">
				I'm an 18-year-old from Poland, and I like building software that is
				<mark>clean</mark>, <mark>quick</mark>, and <mark>beautiful</mark>.
			</p>
			<p class="rise" style="--d: 230ms; --y: 10px">
				My philosophy is pretty simple: make it work, make it fast, care about the user and don't
				make it annoying.
			</p>
			<p class="rise" style="--d: 290ms; --y: 8px">
				Outside of that I reverse engineer, play games, watch anime, and explore whatever new thing
				catches my eye.
			</p>
			<p class="rise" style="--d: 340ms; --y: 8px">
				Find me on
				<a href="https://github.com/mufarodev" target="_blank" rel="noopener noreferrer">GitHub</a>,
				<a href="https://x.com/mufaro_dev" target="_blank" rel="noopener noreferrer">Twitter</a>,
				<a href="https://discord.com/users/769702535124090904" target="_blank" rel="noopener noreferrer"
					>Discord</a
				>, or at
				<a href="mailto:contact@mufaro.dev">contact@mufaro.dev</a>.
			</p>
		</section>

		<section>
			<h2 class="fade" style="--d: 380ms">Projects</h2>
			<ul
				class="projects"
				bind:this={list}
				onpointerenter={trackPreview}
				onpointermove={trackPreview}
			>
				{#each projects as project, i (project.name)}
					<li class="rise" style:--d="{400 + i * (42 - 2 * i)}ms" style:--y="8px">
						<a href={project.href} target="_blank" rel="noopener noreferrer">
							<img class="icon" src={project.icon} alt="" width="40" height="40" />
							<span class="name">{project.name}</span>
							<span class="meta">{project.type} · {project.year}</span>
							<span class="blurb">{project.blurb}</span>
							<span class="preview" aria-hidden="true">
								<span class="card pixel-card">
									<img src={project.image} alt="" loading="lazy" />
									<span class="caption">
										<span class="host">{project.href.replace(/^https?:\/\//, '')}</span>
										<span>↗</span>
									</span>
								</span>
								<!-- Pixel star in the same style as the hero's sparks, stuck on the card's corner. -->
								<svg class="sticker" viewBox="0 0 7 7" shape-rendering="crispEdges">
									<path d="M3 0h1v2h1v1h2v1h-2v1h-1v2h-1v-2h-1v-1h-2v-1h2v-1h1z" />
									<rect x="3" y="3" width="1" height="1" fill="#fff" />
								</svg>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>

		<section class="rise" style="--d: 510ms; --y: 6px">
			<div class="buttons-head">
				<h2>88x31</h2>
				<div class="mine">
					<img src="/images/88x31.png" alt="mufaro.dev" width="88" height="31" />
					<span class="t-tt-wrap" class:is-copied={copied}>
						<button
							type="button"
							class="t-tt-trigger"
							class:is-copied={copied}
							onclick={copyButton}
							aria-describedby="copy-tip"
						>
							<span class="t-icon-swap" data-state={copied ? 'b' : 'a'} aria-hidden="true">
								<span class="t-icon" data-icon="a"><HugeiconsIcon icon={Copy01Icon} size={16} /></span>
								<span class="t-icon" data-icon="b">
									<span class="t-success-check" data-state={checkShown ? 'in' : 'out'}>
										<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
											<path
												d="M5 12.5 9.5 17 19 7"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</span>
								</span>
							</span>
							<span class="sr-only">Copy the HTML for my 88x31 button</span>
						</button>
						<span
							class="t-tt"
							id="copy-tip"
							role="tooltip"
							style:width={tipWidth ? `${tipWidth}px` : undefined}
						>
							<SwapText text={tipLabel} />
						</span>
						<!-- Measures the label about to show, so the tooltip can animate its width to fit. -->
						<span class="t-tt tip-measure" bind:this={tipMeasure} aria-hidden="true">{tipLabel}</span>
					</span>
					<span class="sr-only" role="status">{copied ? 'Copied to clipboard' : ''}</span>
				</div>
			</div>
			<div class="marquee">
				{#each rows as row, r (r)}
					<!-- Each row is rendered twice so the loop never shows a seam; the copy is hidden from AT. -->
					<div class="track" class:reverse={r === 1}>
						{#each [0, 1] as copy (copy)}
							<div class="set" aria-hidden={copy === 1}>
								{#each row as button (button.name)}
									{#if button.href}
										<a href={button.href} target="_blank" rel="noopener" tabindex={copy ? -1 : 0}>
											<img src={button.image} alt={button.name} width="88" height="31" />
										</a>
									{:else}
										<img src={button.image} alt={button.name} width="88" height="31" />
									{/if}
								{/each}
							</div>
						{/each}
					</div>
				{/each}
				<!-- Progressive blur: stacked layers, each blurring harder over a thinner edge band. -->
				<div class="edge left" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
				<div class="edge right" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
			</div>
		</section>

		<footer class="fade" style="--d: 560ms">( ˶ˆᗜˆ˵ ) thanks for stopping by ✧</footer>
	</main>
</div>

<style>
	.page {
		--accent: rgb(var(--accent-r), var(--accent-g), var(--accent-b));
		--text: #f2eeea;
		--dim: rgb(242 238 234 / 0.62);
		--faint: rgb(242 238 234 / 0.4);
		--line: rgb(242 238 234 / 0.1);
		--pink: #f6b8d6;
		--bg: #050508;
		display: grid;
		grid-template-columns: minmax(360px, 42vw) minmax(0, 1fr);
		min-height: 100svh;
	}

	.hero {
		position: sticky;
		top: 0;
		height: 100svh;
		padding: 8px;
	}
	.frame {
		position: relative;
		height: 100%;
		overflow: hidden;
		border-radius: 16px;
		background: #09090d;
	}
	.presence-slot {
		position: absolute;
		left: 24px;
		right: 24px;
		bottom: 24px;
		z-index: 1;
	}

	main {
		/* Positioned so it paints above the fixed star canvas. */
		position: relative;
		display: flex;
		flex-direction: column;
		gap: clamp(36px, 5vh, 48px);
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		padding: clamp(32px, 7vh, 80px) clamp(24px, 5vw, 72px) 40px;
	}

	.greeting {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 16px;
	}
	/* Doto: the same dot-matrix face as the clock, in the spirit of Nothing's Ndot. */
	h1 {
		font-family: 'Doto Variable', var(--font-mono);
		font-size: 32px;
		font-weight: 900;
		letter-spacing: -0.01em;
		line-height: 1.1;
		color: var(--dim);
	}
	h1 span {
		color: var(--text);
	}
	.now {
		display: grid;
		justify-items: end;
		gap: 2px;
		font-size: 14px;
		color: var(--faint);
	}
	.now p {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 22px;
	}
	.sky {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.sky :global(svg) {
		color: var(--text);
	}
	.digits {
		font-family: 'Doto Variable', var(--font-mono);
		font-size: 18px;
		font-weight: 800;
		letter-spacing: 0.04em;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 16px;
		font-size: 17px;
		line-height: 1.6;
		color: var(--dim);
		text-wrap: pretty;
	}
	.intro mark {
		padding: 2px 7px;
		border-radius: 4px;
		background: rgb(var(--accent-r), var(--accent-g), var(--accent-b), 0.14);
		color: var(--accent);
		transition:
			color 1.5s ease,
			background-color 1.5s ease;
	}
	.intro a {
		color: var(--text);
		text-decoration: underline;
		text-decoration-color: var(--faint);
		text-underline-offset: 4px;
		transition: text-decoration-color 150ms ease;
	}
	.intro a:hover {
		text-decoration-color: var(--accent);
	}

	h2 {
		font-size: 13px;
		color: var(--faint);
	}
	h2 {
		margin-bottom: 10px;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--line);
		font-weight: 500;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.projects {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.projects a {
		display: grid;
		grid-template-columns: 40px 1fr auto;
		grid-template-areas:
			'icon name meta'
			'icon blurb blurb';
		gap: 3px 14px;
		align-items: baseline;
		margin-inline: -12px;
		padding: 10px 12px;
		border-radius: 10px;
		transition:
			background-color 150ms ease,
			opacity 150ms ease;
	}
	.icon {
		grid-area: icon;
		align-self: center;
		width: 40px;
		height: 40px;
	}
	.name {
		grid-area: name;
		font-size: 16px;
		font-weight: 500;
	}
	.meta {
		grid-area: meta;
		font-size: 13px;
		color: var(--faint);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.blurb {
		grid-area: blurb;
		font-size: 14px;
		line-height: 1.5;
		color: var(--dim);
	}
	.preview {
		position: relative;
		grid-column: 2 / -1;
		display: block;
		width: 100%;
		margin-top: 10px;
		filter: drop-shadow(0 12px 24px rgb(0 0 0 / 0.45));
	}
	.card {
		display: block;
		padding: 5px 5px 0;
	}
	.preview img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		object-position: top;
		background: #0d0d12;
	}
	.caption {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 5px 3px 6px;
		font-size: 12px;
		font-weight: 600;
		line-height: 1.2;
		color: #3a2238;
	}
	.host {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sticker {
		position: absolute;
		top: -12px;
		right: -12px;
		width: 28px;
		height: 28px;
		fill: var(--pink);
		filter: drop-shadow(0 0 4px rgb(246 184 214 / 0.6));
	}

	@media (hover: hover) and (pointer: fine) {
		.projects a:hover {
			background: rgb(242 238 234 / 0.06);
		}
		.projects:hover a:not(:hover) {
			opacity: 0.5;
		}
		/* Dimmed rows become stacking contexts, trapping their fading preview's z-index; lift the
		   whole list so a preview never slips under the 88x31 marquee below. */
		.projects {
			position: relative;
			z-index: 10;
		}
		/* The row's own image becomes the floating preview that follows the cursor. */
		.preview {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 10;
			width: 320px;
			margin: 0;
			pointer-events: none;
			opacity: 0;
			/* Position follows the cursor instantly; only the fade and scale animate. */
			translate: var(--px, 0) var(--py, 0);
			scale: 0.96;
			rotate: calc(-2deg + var(--tilt, 0deg));
			transform-origin: top left;
			transition:
				opacity 150ms ease,
				scale 150ms ease-out;
		}
		.projects a:hover .preview {
			opacity: 1;
			scale: 1;
		}
		/* The sticker lands a beat after the card. */
		.sticker {
			scale: 0.4;
			rotate: -30deg;
			transition:
				scale 150ms ease-out,
				rotate 150ms ease-out;
		}
		.projects a:hover .sticker {
			scale: 1;
			rotate: 0deg;
			transition:
				scale 320ms cubic-bezier(0.34, 1.56, 0.64, 1) 60ms,
				rotate 320ms cubic-bezier(0.34, 1.56, 0.64, 1) 60ms;
		}
	}

	.buttons-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--line);
	}
	.buttons-head h2 {
		margin: 0;
		border: 0;
	}
	.mine {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.mine img {
		display: block;
		image-rendering: pixelated;
	}
	.mine button {
		display: grid;
		place-items: center;
		width: 31px;
		height: 31px;
		border-radius: 8px;
		color: var(--dim);
		background: rgb(242 238 234 / 0.05);
		box-shadow: inset 0 0 0 1px var(--line);
		cursor: pointer;
		transition:
			color 150ms ease,
			background-color 150ms ease,
			box-shadow 150ms ease;
	}
	.mine button:hover {
		color: var(--text);
		background: rgb(242 238 234 / 0.1);
	}
	.mine button.is-copied {
		color: #55c58a;
		background: rgb(85 197 138 / 0.12);
		box-shadow: inset 0 0 0 1px rgb(85 197 138 / 0.35);
	}
	/* Inline svgs sit on a text baseline; make each icon cell exactly the icon so it centres. */
	.mine .t-icon-swap {
		display: grid;
		line-height: 0;
	}
	.mine .t-icon {
		display: grid;
		place-items: center;
	}
	/* The check is drawn at icon size, so the bob and blur are scaled down to match. */
	.mine .t-success-check {
		--check-y-amount: 6px;
		--check-blur-from: 4px;
	}
	.mine .t-success-check path {
		stroke-dasharray: 21;
		stroke-dashoffset: 21;
	}
	/* The tooltip stays up while the confirmation is showing, not just on hover. */
	.mine .t-tt-wrap.is-copied .t-tt {
		opacity: 1;
		transform: translate(-50%, 0) scale(1);
		transition-duration: var(--tt-in-dur);
	}
	.mine .t-tt {
		--tt-bg: #f2eeea;
		--tt-fg: #18181b;
		padding: 6px 10px;
		font-size: 12px;
		font-weight: 500;
		text-align: center;
		box-sizing: border-box;
		overflow: hidden;
		transition:
			opacity var(--tt-out-dur) var(--tt-out-ease),
			transform var(--tt-out-dur) var(--tt-out-ease),
			width 250ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.mine .t-tt-wrap:hover .t-tt,
	.mine .t-tt-wrap.is-copied .t-tt {
		transition:
			opacity var(--tt-in-dur) var(--tt-in-ease) var(--tt-delay),
			transform var(--tt-in-dur) var(--tt-in-ease) var(--tt-delay),
			width 250ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.mine .tip-measure {
		visibility: hidden;
		width: auto;
		transition: none;
	}

	.marquee {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: hidden;
	}
	.track {
		display: flex;
		width: max-content;
		animation: marquee 40s linear infinite;
	}
	.track.reverse {
		animation-direction: reverse;
		animation-duration: 46s;
	}
	.marquee:hover .track {
		animation-play-state: paused;
	}
	.set {
		display: flex;
		gap: 8px;
		padding-right: 8px;
	}
	.set img {
		display: block;
		image-rendering: pixelated;
	}
	.set a {
		display: block;
		border-radius: 2px;
	}
	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	.edge {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 72px;
		pointer-events: none;
	}
	.edge.left {
		left: 0;
		--dir: to left;
	}
	.edge.right {
		right: 0;
		--dir: to right;
	}
	.edge i {
		position: absolute;
		inset: 0;
	}
	/* Each layer starts further toward the outer edge and blurs harder. */
	.edge i:nth-child(1) {
		backdrop-filter: blur(1px);
		mask-image: linear-gradient(var(--dir), transparent, #000 50%);
	}
	.edge i:nth-child(2) {
		backdrop-filter: blur(3px);
		mask-image: linear-gradient(var(--dir), transparent 30%, #000 70%);
	}
	.edge i:nth-child(3) {
		backdrop-filter: blur(6px);
		mask-image: linear-gradient(var(--dir), transparent 55%, #000 85%);
	}
	.edge i:nth-child(4) {
		background: linear-gradient(var(--dir), transparent 40%, var(--bg));
	}

	footer {
		font-size: 13px;
		color: var(--faint);
	}

	a:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 3px;
	}

	/* First-visit entrance, one wave down the column while the hero dissolves open.
	   The title leads and travels furthest; content follows with shrinking gaps and smaller
	   rises; the clock, section label and footer only fade. Delays and distances are set
	   per element in the markup.
	   Fill mode is backwards only, so no transform or filter outlives the animation:
	   either would become the containing block for the fixed project previews. */
	.rise {
		animation: rise 600ms cubic-bezier(0.23, 1, 0.32, 1) var(--d) backwards;
	}
	.fade {
		animation: fade 450ms ease-out var(--d) backwards;
	}
	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 var(--y);
			filter: blur(var(--blur, 2px));
		}
	}

	@media (max-width: 899px) {
		.page {
			display: block;
		}
		.hero {
			position: relative;
			height: 56svh;
			min-height: 380px;
		}
		main {
			padding-top: 32px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.preview {
			transition: opacity 150ms ease;
		}
		.sticker {
			scale: 1 !important;
			rotate: 0deg !important;
		}
		/* No auto-scroll; the rows become plain horizontal scrollers. */
		.marquee {
			overflow-x: auto;
		}
		.track {
			animation: none;
		}
		/* Collapse the wave: everything fades in together, no movement or blur. */
		.rise,
		.fade {
			animation: fade 300ms ease-out backwards;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
</style>
