<script lang="ts">
	import type { IconName } from './icon.svelte';
	import Icon from './icon.svelte';

	export let value: string | undefined = undefined;
	export let icon: IconName | null = null;
	export let name: string | undefined = undefined;
</script>

<div class="relative">
	{#if icon}
		<div class="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
			<Icon name={icon} />
		</div>
	{/if}
	<select {name} data-has-icon={!!icon} bind:value>
		<slot />
	</select>
</div>

<style lang="postcss">
	select {
		@apply focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-300;
		position: relative;
		border: 1px solid theme('colors.gray.500');
		border-radius: theme('borderRadius.md');
		background-color: theme('colors.black');

		padding: 0.5rem;

		outline: none;

		&:focus {
			@apply border-orange-300 ring ring-orange-300;
		}
	}

	[data-has-icon='true'] {
		@apply pl-9;
	}
</style>
