<script lang="ts" module>
	// Nothing OS-style dot-matrix glyphs on a 9x9 grid: '#' is a lit dot.
	const CLOUD = ['....##...', '...####..', '.#######.', '#########', '.#######.'];
	export const ICONS = {
		sun: ['....#....', '.#.....#.', '...###...', '..#####..', '#.#####.#', '..#####..', '...###...', '.#.....#.', '....#....'],
		moon: ['..####...', '.###.....', '###......', '###......', '###......', '###......', '###.....#', '.###..###', '..#####..'],
		partly: ['.#...#...', '..###....', '.#####...', '.###.###.', '..#######', '.########', '#########', '.#######.', '.........'],
		cloud: ['.........', '....##...', '...####..', '.#######.', '#########', '#########', '.#######.', '.........', '.........'],
		fog: ['.........', '.........', '#######..', '.........', '.#######.', '.........', '..#######', '.........', '.........'],
		drizzle: [...CLOUD, '.........', '..#...#..', '.........', '.#...#...'],
		rain: [...CLOUD, '.........', '..#..#..#', '.#..#..#.', '#..#..#..'],
		snow: [...CLOUD, '.........', '#...#...#', '..#...#..', '#...#...#'],
		storm: [...CLOUD, '....##...', '...##....', '..####...', '...##....']
	};
	export type Icon = keyof typeof ICONS;
</script>

<script lang="ts">
	let { icon }: { icon: Icon } = $props();
	let dots = $derived(
		ICONS[icon].flatMap((row, y) => [...row].flatMap((c, x) => (c === '#' ? [{ x, y }] : [])))
	);
</script>

<svg viewBox="0 0 9 9" width="18" height="18" aria-hidden="true">
	{#each dots as { x, y } (`${x},${y}`)}
		<circle cx={x + 0.5} cy={y + 0.5} r="0.36" style:--d="{(x + y) * 18}ms" />
	{/each}
</svg>

<style>
	svg {
		display: block;
		fill: currentColor;
	}
	/* Dots light up in a diagonal sweep when the icon mounts or changes. */
	circle {
		animation: light 400ms cubic-bezier(0.22, 1, 0.36, 1) var(--d) both;
	}
	@keyframes light {
		from {
			opacity: 0;
			scale: 0.2;
		}
	}
	circle {
		transform-box: fill-box;
		transform-origin: center;
	}
	@media (prefers-reduced-motion: reduce) {
		circle {
			animation: none;
		}
	}
</style>
