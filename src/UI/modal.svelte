<script lang="ts">
	import Icon from './icon.svelte';

	export let open = false;
	export let title: string;
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="modal-wrapper" on:click={() => (open = false)}>
		<div class="modal" on:click|stopPropagation>
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
		z-index: theme('zIndex.50');

		display: grid;
		place-items: center;
	}

	.modal {
		background-color: theme('colors.zinc.900');
		/* border: 1px solid theme('colors.gray.800'); */
		padding: 2rem;
		border-radius: 0.25rem;

		width: 30rem;
		max-width: calc(100vw - 2rem);
	}
</style>
