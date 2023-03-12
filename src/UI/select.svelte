<script lang="ts">
	import type { IconName } from './icon.svelte';
	import Icon from './icon.svelte';

	export let value: string;
	export let icon: IconName;
</script>

<div class="relative">
	<div class="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2">
		<Icon name={icon} />
	</div>
	<select
		class="relative rounded-md border border-solid border-gray-500 bg-black py-2 pr-2 pl-9 focus:border-orange-300 focus:outline-none focus:ring focus:ring-orange-300"
		bind:value
	>
		<slot />
	</select>
</div>
