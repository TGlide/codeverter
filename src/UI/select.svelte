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
		@apply relative rounded-md border border-solid border-gray-500 bg-black py-2 pr-2 pl-2 focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-300;
	}

	[data-has-icon='true'] {
		@apply pl-9;
	}
</style>
