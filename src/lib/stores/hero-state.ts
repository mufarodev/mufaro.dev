import { writable, derived } from 'svelte/store';

export type SmoothScroller = {
	scrollTo: (
		target: number,
		options?: {
			duration?: number;
			immediate?: boolean;
			lock?: boolean;
			force?: boolean;
			onComplete?: () => void;
		}
	) => void;
};

export const morphProgress = writable(0);
export const isAnimating = writable(false);
export const heroScrollLocked = writable(false);
export const accentColor = writable({ r: 136, g: 153, b: 170 });
export const smoothScroller = writable<SmoothScroller | null>(null);
export const isMorphed = derived(morphProgress, ($progress) => $progress > 0.5);
