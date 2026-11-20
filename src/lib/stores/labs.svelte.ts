import { getContext, setContext } from 'svelte';
import { cleanLabs, type Lab } from '$lib/labs';

const LABS = Symbol('labs');
const STEP = 5000;

// Polls only while the tab is visible.
export function initLabs() {
	let labs = $state<Lab[]>([]);
	let visible = $state(true);

	$effect(() => {
		const update = () => (visible = !document.hidden);
		update();
		document.addEventListener('visibilitychange', update);
		return () => document.removeEventListener('visibilitychange', update);
	});

	$effect(() => {
		if (!visible) return;
		const controller = new AbortController();
		const poll = async () => {
			try {
				const response = await fetch('/api/labs', { signal: controller.signal });
				if (!response.ok) throw new Error(String(response.status));
				labs = cleanLabs(await response.json());
			} catch {
				/* keep the last answer; the next poll tries again */
			}
		};
		poll();
		const interval = setInterval(poll, STEP);
		return () => {
			controller.abort();
			clearInterval(interval);
		};
	});

	return setContext(LABS, {
		get labs() {
			return labs;
		},
		// An empty list means unconfigured or unreachable: show nothing rather than two offline rows.
		get ready() {
			return labs.length > 0;
		}
	});
}

export function getLabs() {
	return getContext<ReturnType<typeof initLabs>>(LABS);
}
