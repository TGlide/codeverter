<script lang="ts">
	import Copy from '$components/copy.svelte';
	import Modal from '$components/modal.svelte';
	import Output from '$components/output.svelte';
	import { objectKeys } from '$helpers/object';
	import { fetchStream } from '$helpers/stream';
	import { getParamsFromForm, getQueryOption, hasParams, queryOptions } from '$lib/query';
	import { key } from '$stores/key';
	import Button from '$UI/button.svelte';
	import Combobox from '$components/combobox.svelte';
	import Select from '$UI/select.svelte';
	import { GPT, gpt } from '$stores/gpt';

	let optionKey = objectKeys(queryOptions)[0];
	$: option = getQueryOption(optionKey);

	let useAdvanced = false;
	const resetAdvanced = () => (useAdvanced = false);
	$: if (option) resetAdvanced();

	enum ErrorCode {
		NoKey = 'Set your API key',
		Generic = 'Failed to contact OpenAI :('
	}
	let error: ErrorCode | null = null;
	let loading = false;

	let input = '';
	let output = '';
	$: optionKey && (output = '');
	let settingsOpen = false;

	async function search(e: SubmitEvent) {
		if (loading || !input) return;
		output = '';
		error = null;
		loading = true;

		const form = e.target as HTMLFormElement;
		const params = hasParams(option) ? getParamsFromForm(form, option.params) : undefined;

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				body: JSON.stringify({ input, type: optionKey, key: $key, params, model: $gpt }),
				headers: {
					'content-type': 'application/json'
				}
			});

			if (!response.ok) throw new Error('Network response was not ok');

			await fetchStream(response, (chunk) => {
				output += chunk;
			});
		} catch (err) {
			error = $key ? ErrorCode.Generic : ErrorCode.NoKey;
		}

		loading = false;
	}

	$: if ($key) error = null;
</script>

<svelte:head>
	<title>Codeverter</title>
	<meta name="description" content="Convert code to your programming language of choice" />
</svelte:head>

<form
	class="relative flex min-h-screen flex-col justify-between gap-4 overflow-hidden pb-8"
	on:submit={search}
>
	<div class="bg" />

	<div class="mx-auto w-full max-w-7xl px-2 lg:px-4">
		<!-- Hero -->
		<h1 class="mx-auto mt-16 max-w-5xl text-center text-3xl font-bold lg:text-5xl lg:leading-tight">
			Convert <span class="gradient-text">code</span> to your programming
			<span class="gradient-text">language</span> of choice
		</h1>

		<!-- Input and Output -->
		<div class="mt-8 grid w-full gap-4 lg:grid-cols-2">
			<div class="flex h-[20rem] flex-col lg:h-[40rem]">
				<label for="input" class="font-semibold">Input</label>
				<textarea
					bind:value={input}
					name="input"
					class="textarea mt-2 w-full grow overflow-auto"
					placeholder="Type here..."
				/>
			</div>
			<div class="flex h-[20rem] flex-col lg:h-[40rem]">
				<div class="flex items-center justify-between">
					<label for="output" class="font-semibold">Output</label>
					{#if output}
						<Copy value={output} />
					{/if}
				</div>

				<Output value={output} lang={option.lang} />
			</div>
		</div>

		<!-- Button and Language selector -->
		<div class="mt-8 flex items-center justify-center gap-4">
			<Button {loading} disabled={!input.trim()} type="submit">Convert</Button>
			<span>to</span>
			<Combobox
				bind:value={optionKey}
				options={Object.entries(queryOptions).map(([key, { label, icon }]) => ({
					value: key,
					label,
					icon
				}))}
			/>
		</div>

		<!-- Advanced options -->
		{#if hasParams(option)}
			<div
				class="mt-8 flex items-center justify-center gap-2"
				class:opacity-50={!useAdvanced}
				class:opacity-100={useAdvanced}
			>
				<input type="checkbox" class="checkbox" id="advanced" bind:checked={useAdvanced} />
				<label for="advanced" class="font-light">Use advanced options</label>
			</div>

			{#if useAdvanced}
				<div class="params-wrapper">
					{#each Object.keys(option.params) as key}
						{@const param = option.params[key]}
						<div
							class="flex justify-start items-center gap-2"
							class:flex-row-reverse={param.type === 'boolean'}
							class:justify-end={param.type === 'boolean'}
						>
							<label for={key}>{param.label}</label>
							{#if param.type === 'boolean'}
								<input type="checkbox" name={key} id={key} />
							{:else if param.type === 'string'}
								<Select name={key}>
									{#each param.values as value}
										<option {value}>{value}</option>
									{/each}
								</Select>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		{#if error === ErrorCode.Generic}
			<p class="mt-4 text-center text-red-500">{error}</p>
		{/if}
		{#if error === ErrorCode.NoKey}
			<button
				class="mx-auto mt-4 block text-red-500 underline hover:text-red-400"
				on:click={() => (settingsOpen = true)}
				type="button"
			>
				Set your API key
			</button>
		{/if}
	</div>

	<footer class="text-center">
		<p class="mt-8">
			Made by <a
				class="text-orange-300 underline hover:text-orange-200"
				href="https://www.thomasglopes.com/"
				target="_blank"
			>
				Thomas G. Lopes
			</a>
		</p>
		<p class="mt-1 text-sm text-gray-500">Warning: Code conversions may not be accurate.</p>
		<p class="text-sm text-gray-500">
			<button
				type="button"
				class="underline hover:text-gray-400"
				on:click={() => (settingsOpen = true)}
			>
				Settings
			</button>
			-
			<a
				href="https://github.com/TGlide/codeverter"
				target="_blank"
				class="underline hover:text-gray-400"
			>
				Source
			</a>
		</p>
	</footer>
</form>

<Modal bind:open={settingsOpen} title="Settings">
	<div class="flex flex-col gap-2">
		<label class="font-semibold" for="api-key">GPT version: </label>
		<Select bind:value={$gpt}>
			<option value={GPT['three-dot-five']}>GPT 3.5-turbo</option>
			<option value={GPT.four}>GPT 4</option>
		</Select>
	</div>

	{#if $gpt === GPT.four}
		<p class="border-l-2 border-orange-500  text-orange-200 text-sm py-1 px-2 mt-2" role="alert">
			Make sure your API key has access to GPT-4. It is currently behind a waitlist.
		</p>
	{/if}

	<div class="flex flex-col gap-2 mt-4">
		<label class="font-semibold" for="api-key">API key: </label>
		<input class="input px-2 py-2" type="password" id="api-key" bind:value={$key} />
	</div>

	<p class="mt-2 text-sm text-gray-300">
		Get your free API key <a
			class="underline hover:opacity-75"
			href="https://platform.openai.com/account/api-keys"
			target="_blank">here</a
		>
	</p>
</Modal>

<style lang="postcss">
	.gradient-text {
		background: linear-gradient(90deg, theme('colors.orange.400'), theme('colors.red.400'));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.bg {
		background: radial-gradient(
			farthest-side,
			theme('colors.orange.400/0.25') 0%,
			theme('colors.red.400/0') 100%
		);
		position: absolute;
		width: 1200px;
		height: 800px;

		left: 50%;
		translate: -50% -50px;
		z-index: -1;
	}

	:global(.shiki) {
		background-color: transparent !important;
		white-space: pre-wrap;
	}

	.params-wrapper {
		@apply mx-auto;
		display: grid;

		gap: theme('spacing.4');

		background-color: theme('colors.zinc.800');
		border-radius: theme('borderRadius.md');
		padding: theme('spacing.4');

		margin-top: theme('spacing.4');
		max-width: theme('maxWidth.xs');
	}

	@media screen(lg) {
		.params-wrapper {
			grid-template-columns: repeat(1, minmax(0, 1fr));
		}
	}
</style>
