import type { Action } from 'svelte/action';

type ClickOutsideParams = () => void;

export const clickOutside: Action<HTMLElement, ClickOutsideParams> = (node, cb) => {
	const clickHandler = (e: MouseEvent) => {
		if (node.contains(e.target as Node)) {
			return;
		}

		cb?.();
	};

	document.addEventListener('click', clickHandler);

	return {
		destroy: () => {
			document.removeEventListener('click', clickHandler);
		}
	};
};
