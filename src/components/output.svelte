<script lang="ts">
	import { queryOptions } from '$lib/query';
	import { getHighlighter, setCDN, type Highlighter, type Lang } from 'shiki';
	import { onMount } from 'svelte';

	export let value = '';
	export let lang: Lang | null = null;
	let highlighter: Highlighter;

	function withoutCodeQuotes(code: string) {
		return code.replace(/`{3}.*\n/g, '').replace(/`{3}/g, '');
	}

	$: htmlValue = (function generateHtml() {
		if (!highlighter || !value || !lang) {
			return null;
		}

		try {
			return highlighter.codeToHtml(withoutCodeQuotes(value), { lang });
		} catch (e) {
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
</div>
