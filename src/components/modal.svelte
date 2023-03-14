<script lang="ts">
	import { fade, scale, type TransitionConfig } from 'svelte/transition';
	import Icon from '../UI/icon.svelte';

	export let open = false;
	export let title: string;

	type BgFadeConfig = {
		duration: number;
	};
	function bgFade(node: HTMLElement, { duration }: BgFadeConfig): TransitionConfig {
		return {
			duration,
			css: (t) => `
				background-color: rgba(0, 0, 0, ${t * 0.5});
			`
		};
	}
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="modal-wrapper" on:click={() => (open = false)} transition:bgFade={{ duration: 200 }}>
		<div class="modal" on:click|stopPropagation transition:scale={{ start: 0.9, duration: 250 }}>
			<div class="flex items-center justify-between">
				<h2 class="text-4xl font-bold">{title}</h2>
				<button on:click={() => (open = false)}>
					<Icon name="close" />
				</button>
			</div>
			<!-- <hr class="mt-4 opacity-20" /> -->
			<div class="mt-4">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.modal-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: theme('colors.black/0.5');

		display: grid;
		place-items: center;
		z-index: theme('zIndex.50');
	}

	.modal {
		background-color: theme('colors.zinc.900');
		/* border: 1px solid theme('colors.gray.800'); */
		padding: 2rem;
		border-radius: theme('borderRadius.lg');

		width: 30rem;
		max-width: calc(100vw - 2rem);
	}
</style>
