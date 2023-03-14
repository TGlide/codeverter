<script lang="ts">
	import { queryOptions } from '$lib/query';
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
</script>

{#if htmlValue}
	<div class="textarea mt-2 w-full grow overflow-auto">
		{@html htmlValue}
	</div>
{:else}
	<textarea
		bind:value
		name="output"
		readonly
		class="textarea mt-2 w-full grow overflow-auto"
		placeholder="Awaiting conversion..."
	/>
{/if}
