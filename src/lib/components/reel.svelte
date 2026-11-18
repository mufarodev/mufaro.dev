<script lang="ts">
	import { tick, untrack } from 'svelte';

	// transitions.dev spinning counter: each digit is a clipped reel of 0-9 cells.
	// The strip holds 0-9 twice, so a reel can always roll forward up to a full turn.
	let { value }: { value: string } = $props();

	const uid = $props.id();
	const digit = (c: string) => (/\d/.test(c) ? +c : 0);

	let chars = $derived([...value]);
	// Cell offset per column, server-rendered one full turn in: the intro spin is a CSS
	// animation from the digit's first-loop cell, so it starts on first paint, not on hydrate.
	let pos = $state(untrack(() => [...value].map((c) => digit(c) + 10)));
	let kind = $state<'intro' | 'snap' | 'roll'>('intro');
	let first = true;

	async function roll(next: number[]) {
		// Fold every reel back into its first loop without a transition: the strip repeats, so
		// this is invisible, and it leaves a full loop of headroom to roll forward into.
		kind = 'snap';
		pos = pos.map((p) => p % 10);
		await tick();
		document.body.offsetWidth;
		// Leaving 'snap' (no animation) and coming back restarts the blur keyframes.
		kind = 'roll';
		pos = next;
	}

	$effect(() => {
		const target = chars.map(digit);
		untrack(() => {
			// The first run is hydration: the server already placed every reel.
			if (first) return void (first = false);
			// Roll forward to the next occurrence of each new digit; unchanged digits stay put.
			roll(
				target.map((d, i) => {
					const from = (pos[i] ?? 0) % 10;
					return d >= from ? d : d + 10;
				})
			);
		});
	});
</script>

<span class="reel" data-kind={kind}>
	<span class="sr-only">{value}</span>
	<!-- Vertical-only blur: CSS blur() would smear sideways too. -->
	<svg class="defs" aria-hidden="true">
		<filter id="{uid}-3"><feGaussianBlur stdDeviation="0 3" /></filter>
		<filter id="{uid}-2"><feGaussianBlur stdDeviation="0 1.6" /></filter>
		<filter id="{uid}-1"><feGaussianBlur stdDeviation="0 0.6" /></filter>
	</svg>
	{#each chars as c, i (i)}
		{#if /\d/.test(c)}
			<span class="col" aria-hidden="true">
				<span
					class="strip"
					style:translate="0 calc({pos[i] ?? 0} * -1 * var(--cell))"
					style:--i={i}
					style:--from={digit(c)}
					style:--b3="url(#{uid}-3)"
					style:--b2="url(#{uid}-2)"
					style:--b1="url(#{uid}-1)"
				>
					{#each { length: 20 } as _, n (n)}<span>{n % 10}</span>{/each}
				</span>
			</span>
		{:else}
			<span aria-hidden="true">{c}</span>
		{/if}
	{/each}
</span>

<style>
	.reel {
		--cell: 1.2em;
		display: inline-flex;
		height: var(--cell);
		line-height: var(--cell);
		font-variant-numeric: tabular-nums;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.defs {
		position: absolute;
		width: 0;
		height: 0;
	}
	.col {
		height: var(--cell);
		overflow: hidden;
		/* Soft-fade the window edges instead of hard-cropping. */
		mask-image: linear-gradient(transparent, #000 18%, #000 82%, transparent);
	}
	.strip {
		display: flex;
		flex-direction: column;
		/* No will-change: a permanent layer at a fractional offset (1.2em = 21.6px cells)
		   rasterizes soft, and the digits blur the moment the spin ends. Animations promote
		   the strip on their own while they run. */
	}
	.strip > span {
		height: var(--cell);
		text-align: center;
	}
	/* Intro: one full turn from the digit's first-loop cell to the same digit one loop on,
	   timed with the title's entrance. */
	.reel[data-kind='intro'] .strip {
		animation:
			spin-in 1400ms cubic-bezier(0.16, 1, 0.3, 1) calc(80ms + var(--i) * 90ms) backwards,
			blur 1400ms calc(80ms + var(--i) * 90ms) backwards;
	}
	@keyframes spin-in {
		from {
			translate: 0 calc(var(--from) * -1 * var(--cell));
		}
	}
	.reel[data-kind='roll'] .strip {
		transition: translate 700ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i) * 60ms);
		animation: blur 700ms calc(var(--i) * 60ms) backwards;
	}
	/* The streak decays in steps as the reel slows down. */
	@keyframes blur {
		0% { filter: var(--b3); }
		35% { filter: var(--b2); }
		60% { filter: var(--b1); }
		80%, 100% { filter: none; }
	}

	@media (prefers-reduced-motion: reduce) {
		.strip {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
