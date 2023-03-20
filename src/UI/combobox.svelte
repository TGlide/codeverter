<script lang="ts">
	import { clickOutside } from '$actions/clickOutside';
	import { autoUpdate, computePosition, flip, offset } from '@floating-ui/dom';
	import type { Action } from 'svelte/action';
	import type { IconName } from './icon.svelte';
	import Icon from './icon.svelte';

	// Props
	export let value: string;
	export let options: { value: string; label: string; icon?: IconName }[];
	const getSelectedOption = (v: string) => options.find((o) => o.value === v || o.label === v);

	// Variables
	let input: string = getSelectedOption(value)?.label || '';
	let dirty = false;
	let hasFocus = false;
	let selectedIndex = 0;

	// Computed values
	$: filteredOptions = ((): typeof options => {
		if (!dirty) return [...options];
		return options.filter((option) => option.label.toLowerCase().includes(input.toLowerCase()));
	})();

	$: icon = getSelectedOption(value)?.icon;

	// Effects
	$: {
		hasFocus; // dependecies
		dirty = false;
	}

	$: {
		filteredOptions; // dependecies
		selectedIndex = 0;
	}

	$: if (hasFocus === true && !dirty) {
		selectedIndex = filteredOptions.findIndex((option) => option.label === input);
	}

	$: if (hasFocus === false) {
		input = getSelectedOption(value)?.label || '';
	}

	// Helpers
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
			value = getSelectedOption(input)?.value || '';
			hasFocus = false;
		}
	}
</script>

<div class="relative" use:tooltip use:clickOutside={() => (hasFocus = false)}>
	{#if icon}
		<div class="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
			<Icon name={icon} />
		</div>
	{/if}

	<input
		type="text"
		class="input font-sans py-2 pr-2 pl-9 w-48"
		on:focus={() => (hasFocus = true)}
		on:click={() => (hasFocus = true)}
		on:input={() => (dirty = true)}
		on:keydown={onKeydown}
		bind:value={input}
	/>
	<div class="suggestions" class:hidden={!hasFocus || !filteredOptions.length}>
		{#each filteredOptions as option, i}
			<button
				data-selected={i === selectedIndex}
				on:click={() => {
					input = option.label;
					value = option.value;
					hasFocus = false;
				}}
			>
				<span>
					{#if option.icon}
						<Icon name={option.icon} />
					{/if}
				</span>
				{option.label}
			</button>
		{/each}
	</div>
	<!-- <select class="input py-2 pr-2 pl-9 font-sans bg-black" bind:value>
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select> -->
</div>

<style lang="postcss">
	.suggestions {
		display: flex;
		flex-direction: column;
		gap: theme('spacing.1');

		background-color: theme('colors.black');
		border: 1px solid theme('colors.gray.500');
		border-radius: theme('borderRadius.md');

		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		max-height: theme('maxHeight.96');
		overflow-y: scroll;
		visibility: hidden;

		padding: theme('spacing.2');

		@media screen(lg) {
			max-height: initial;
			overflow-y: initial;
		}

		&.hidden {
			display: none;
		}

		button {
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
	}
</style>
