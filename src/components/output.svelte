<script lang="ts">
	import { copy } from '$helpers/copy';
	import { queryOptions } from '$lib/query';
	import Icon from '$UI/icon.svelte';
	import { getHighlighter, setCDN, type Highlighter, type Lang } from 'shiki';
	import { onMount } from 'svelte';

	export let value = '';
	export let lang: Lang | null = null;
	let highlighter: Highlighter;

	$: htmlValue = (function generateHtml() {
		if (!highlighter || !value || !lang) {
			return null;
		}

		try {
			return highlighter.codeToHtml(value, { lang });
		} catch (e) {
			// we can't highlight the code
			console.log(e);
			return null;
		}
	})();

	onMount(async () => {
		setCDN('https://unpkg.com/shiki');
		highlighter = await getHighlighter({
			theme: 'github-dark',
			langs: Object.values(queryOptions).map(({ lang }) => lang)
		});
	});

	let copied = false;
	async function handleCopy() {
		await copy(value);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class="relative mt-2 grid w-full grow overflow-hidden">
	{#if htmlValue}
		<div class="textarea overflow-auto">
			{@html htmlValue}
		</div>
	{:else}
		<textarea
			bind:value
			name="output"
			readonly
			class="textarea overflow-auto"
			placeholder="Awaiting conversion..."
		/>
	{/if}

	{#if value}
		<button
			class="absolute top-3 right-3 flex items-center gap-1 text-zinc-400 hover:text-zinc-300"
			on:click={handleCopy}
		>
			<Icon name="copy" />
			<span>{copied ? 'copied' : 'copy'}</span>
		</button>
	{/if}
</div>
