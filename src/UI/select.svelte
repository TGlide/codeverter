<script lang="ts">
	import { autoUpdate, computePosition, flip, offset } from '@floating-ui/dom';
	import type { Action } from 'svelte/action';
	import type { IconName } from './icon.svelte';
	import Icon from './icon.svelte';

	export let value: string;
	export let options: { value: string; label: string; icon?: IconName }[];
	const getSelectedOption = (v: string) => options.find((o) => o.value === v || o.label === v);

	let input: string = getSelectedOption(value)?.label || '';
	let hasFocus = false;

	$: filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(input.toLowerCase())
	);
	$: {
		filteredOptions;
		selectedIndex = 0;
	}

	$: {
		const inputOption = getSelectedOption(input);
		if (inputOption) {
			value = inputOption.value;
		}
	}

	$: icon = getSelectedOption(value)?.icon;

	const tooltip: Action<HTMLDivElement> = (wrapperEl) => {
		const suggestionsEl = wrapperEl.querySelector('.suggestions') as HTMLDivElement;

		function updatePosition() {
			computePosition(wrapperEl, suggestionsEl, {
				middleware: [flip(), offset(8)]
			}).then(({ x, y }) => {
				Object.assign(suggestionsEl.style, {
					left: `${x}px`,
					top: `${y}px`,
					visibility: 'visible'
				});
			});
		}

		const cleanup = autoUpdate(wrapperEl, suggestionsEl, updatePosition);

		return {
			destroy() {
				cleanup();
			}
		};
	};

	let selectedIndex = 0;
	function onKeydown(event: KeyboardEvent) {
		hasFocus = true;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % filteredOptions.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + filteredOptions.length) % filteredOptions.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			input = filteredOptions[selectedIndex]?.label || '';
			hasFocus = false;
		}
	}
</script>

<div class="relative" use:tooltip>
	{#if icon}
		<div class="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
			<Icon name={icon} />
		</div>
	{/if}

	<input
		type="text"
		class="input font-sans py-2 pr-2 pl-9 w-48"
		on:focus={() => (hasFocus = true)}
		on:blur={() => {
			hasFocus = false;
			input = getSelectedOption(value)?.label || '';
		}}
		on:keydown={onKeydown}
		bind:value={input}
	/>
	<div class="suggestions" class:hidden={!hasFocus || !filteredOptions.length}>
		<ul>
			{#each filteredOptions as option, i}
				<li class="flex items-center py-2" data-selected={i === selectedIndex}>
					<span>
						{#if option.icon}
							<Icon name={option.icon} />
						{/if}
					</span>

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

	ul {
		display: flex;
		flex-direction: column;
		gap: theme('spacing.1');
	}

	li {
		display: flex;
		align-items: center;
		gap: theme('spacing.2');
		padding: theme('spacing.2');
		border-radius: theme('borderRadius.md');

		&:hover,
		&[data-selected='true'] {
			background-color: theme('colors.zinc.800');
			cursor: pointer;
		}
	}
</style>
