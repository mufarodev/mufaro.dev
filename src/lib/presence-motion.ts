import { cubicOut } from 'svelte/easing';
import { fly, slide } from 'svelte/transition';

// transitions.dev's three-phase text swap, with one pending update per label.
export function swapText(node: HTMLElement, value: string) {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	let next = value;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	node.textContent = value;

	function commit() {
		clearTimeout(timeout);
		timeout = undefined;
		node.textContent = next;
		node.classList.remove('is-exit');
		if (!reducedMotion.matches) {
			node.classList.add('is-enter-start');
			void node.offsetHeight;
		}
		node.classList.remove('is-enter-start');
	}

	function update(value: string) {
		next = value;
		if (reducedMotion.matches) return commit();
		if (timeout || value === node.textContent) return;
		node.classList.add('is-exit');
		const duration = parseFloat(getComputedStyle(node).getPropertyValue('--text-swap-dur'));
		timeout = setTimeout(commit, duration);
	}

	reducedMotion.addEventListener('change', commit);
	return {
		update,
		destroy() {
			clearTimeout(timeout);
			reducedMotion.removeEventListener('change', commit);
		}
	};
}

export function presenceTransition(
	node: HTMLElement,
	{ collapse = false, active = true } = {},
	{ direction }: { direction: 'in' | 'out' | 'both' }
) {
	const reduce = !active || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const style = getComputedStyle(node);
	const duration = reduce
		? 0
		: parseFloat(
				style.getPropertyValue(direction === 'out' ? '--presence-close-dur' : '--presence-open-dur')
			);
	const options = { duration, easing: cubicOut };
	return collapse ? slide(node, options) : fly(node, { ...options, y: reduce ? 0 : 8 });
}
