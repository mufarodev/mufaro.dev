import { getContext, setContext } from 'svelte';
import { useLanyard } from 'sveltekit-lanyard';
import { getActivity, getPlayback, statusLabels } from '$lib/presence';
import { extractDominantColor } from '$lib/utils';
import { accentColor } from './hero-state';

const PRESENCE = Symbol('discord-presence');
const DEFAULT_COLOR = { r: 136, g: 153, b: 170 };

// The layout owns the connection and effects; widgets can mount and unmount freely.
export function initLanyard() {
	const lanyard = useLanyard({
		connectionType: 'ws',
		subscriptionScope: { subscribe_to_id: '769702535124090904' }
	});
	const activity = $derived(getActivity(lanyard.data));
	const status = $derived(lanyard.data?.discord_status ?? 'offline');
	let now = $state(Date.now());
	let waiting = $state(true);
	let color = $state(DEFAULT_COLOR);
	const artwork = $derived(activity?.music ? activity.image : null);

	$effect(() => {
		if (lanyard.connected) {
			waiting = false;
			return;
		}
		const timeout = setTimeout(() => (waiting = false), 10000);
		return () => clearTimeout(timeout);
	});

	$effect(() => {
		if (!activity?.music || !getPlayback(activity.timestamps, Date.now())) return;
		const update = () => {
			now = Date.now();
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		color = DEFAULT_COLOR;
		if (!artwork) return;
		const controller = new AbortController();
		fetch(artwork, { signal: controller.signal })
			.then((response) => {
				if (!response.ok) throw new Error('Artwork unavailable');
				return response.arrayBuffer();
			})
			.then(extractDominantColor)
			.then((extracted) => {
				if (!controller.signal.aborted) color = extracted;
			})
			.catch(() => {
				/* The neutral accent also covers unavailable or cross-origin artwork. */
			});
		return () => controller.abort();
	});

	$effect(() => {
		accentColor.set(color);
	});

	const presence = {
		get activity() {
			return activity;
		},
		get status() {
			return status;
		},
		get label() {
			return lanyard.connected
				? statusLabels[status]
				: waiting && !lanyard.error
					? 'Connecting to Discord'
					: 'Discord unavailable';
		},
		get connected() {
			return lanyard.connected;
		},
		get now() {
			return now;
		},
		get color() {
			return color;
		}
	};
	return setContext(PRESENCE, presence);
}

export function getLanyard() {
	return getContext<ReturnType<typeof initLanyard>>(PRESENCE);
}
