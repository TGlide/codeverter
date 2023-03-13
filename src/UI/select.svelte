<script lang="ts">
	import { computePosition, flip } from '@floating-ui/dom';
	import type { Action } from 'svelte/action';
	import type { IconName } from './icon.svelte';
	import Icon from './icon.svelte';

	export let value: string;
	export let options: { value: string; label: string; icon?: IconName }[];
	const getSelectedOption = (v: string) => options.find((o) => o.value === v);

	let input: string = getSelectedOption(value)?.label || '';

	$: icon = options.find((option) => option.value === value)?.icon;
	$: filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(input.toLowerCase())
	);

	const tooltip: Action<HTMLDivElement> = (wrapperEl) => {
		const suggestionsEl = wrapperEl.querySelector('.suggestions') as HTMLDivElement;

		computePosition(wrapperEl, suggestionsEl, {
			middleware: [flip()]
		}).then(({ x, y }) => {
			Object.assign(suggestionsEl.style, {
				left: `${x}px`,
				top: `${y}px`,
				visibility: 'visible'
			});
		});
	};
</script>

<div class="relative" use:tooltip>
	{#if icon}
		<div class="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
			<Icon name={icon} />
		</div>
	{/if}

	<input type="text" class="input font-sans py-2 pr-2 pl-9 w-48" bind:value={input} />
	<div class="suggestions">
		<ul>
			{#each filteredOptions as option}
				<li class="flex items-center py-2">
					{option.label}
				</li>
			{/each}
		</ul>
	</div>
	<!-- <select class="input py-2 pr-2 pl-9 font-sans bg-black" bind:value>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select> -->
</div>

<style lang="postcss">
	.suggestions {
		position: absolute;
		background-color: theme('colors.black');
		border: 1px solid theme('colors.gray.500');
		border-radius: theme('borderRadius.md');

		width: 100%;
		top: 0;
		left: 0;
		visibility: hidden;

		padding: theme('spacing.2');
	}
</style>
