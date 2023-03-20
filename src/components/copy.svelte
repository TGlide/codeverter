<script lang="ts">
	import { copy } from '$helpers/copy';
	import Icon from '$UI/icon.svelte';

	export let value = '';

	let copied = false;
	async function handleCopy() {
		await copy(value);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<button class="flex items-center gap-1 text-zinc-400 hover:text-zinc-300" on:click={handleCopy}>
	<Icon name="copy" />
	<span>{copied ? 'copied' : 'copy'}</span>
</button>
