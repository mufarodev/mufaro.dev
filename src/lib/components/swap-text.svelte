<script lang="ts">
	import { untrack } from 'svelte';

	// transitions.dev's three-phase text swap. The text is rendered as markup, so SSR already
	// shows the right label and hydration has nothing to fill in.
	let { text, class: className = '' }: { text: string; class?: string } = $props();
	let shown = $state(untrack(() => text));
	let phase = $state<'idle' | 'exit' | 'enter'>('idle');

	$effect(() => {
		const next = text;
		if (next === untrack(() => shown)) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			shown = next;
			return;
		}
		let cancelled = false;
		phase = 'exit';
		const timeout = setTimeout(() => {
			shown = next;
			phase = 'enter';
			// Two frames so the enter-start styles are painted before transitioning out of them.
			requestAnimationFrame(() =>
				requestAnimationFrame(() => {
					if (!cancelled) phase = 'idle';
				})
			);
		}, 150);
		return () => {
			cancelled = true;
			clearTimeout(timeout);
		};
	});
</script>

<span
	class="t-text-swap {className}"
	class:is-exit={phase === 'exit'}
	class:is-enter-start={phase === 'enter'}>{shown}</span
>
