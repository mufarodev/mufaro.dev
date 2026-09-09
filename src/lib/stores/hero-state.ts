import { writable, derived } from 'svelte/store';

export const morphProgress = writable(0);
export const isAnimating = writable(false);
export const accentColor = writable({ r: 136, g: 153, b: 170 });
export const isMorphed = derived(morphProgress, ($progress) => $progress > 0.5);
