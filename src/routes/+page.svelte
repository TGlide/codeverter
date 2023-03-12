<script lang="ts">
	import { objectKeys } from '$helpers/object';
	import { fetchStream } from '$helpers/stream';
	import Button from '$UI/button.svelte';
	import type { IconName } from '$UI/icon.svelte';
	import Select from '$UI/select.svelte';

	type Options = {
		[value: string]: {
			label: string;
			icon: IconName;
			query: (input: string) => string;
		};
	};
	const options = {
		svelte: {
			label: 'Svelte',
			icon: 'svelte',
			query: (input) => `Convert the following component to a Svelte component:\n${input}`
		},
		react: {
			label: 'React',
			icon: 'react',
			query: (input) => `Convert the following component to a React component:\n${input}`
		},
		vue2: {
			label: 'Vue 2',
			icon: 'vue',
			query: (input) => `Convert the following component to a Vue 2 component:\n${input}`
		},
		vue3: {
			label: 'Vue 3',
			icon: 'vue',
			query: (input) =>
				`Convert the following component to a Vue 3 component, using SFCs, template tags, and <script setup>:\n${input}`
		},
		css: {
			label: 'CSS',
			icon: 'css',
			query: (input) => `Convert the following tailwind-css code to normal CSS.
Use the theme function when possible, e.g. '@apply text-white' should become 'color: theme("colors.white")''. 
Also, be smart with opacity colors. e.g. '@apply bg-black-50' should become 'background-color: theme("colors.black/0.5")'.
Do not use CSS vars. Do not use hex color values.
For hover states, use SCSS-like nesting. e.g. '@apply hover:bg-black-50' should become '&:hover { background-color: theme("colors.black/0.5") }'.
This is the code:\n${input}`
		},
		tailwind: {
			label: 'Tailwind',
			icon: 'tailwind',
			query: (
				input
			) => `Convert the following CSS code to Tailwind CSS code. Use the @apply directive.
e.g. .input { border-radius: theme('borderRadius.md'); background-color: theme('colors.black/0.5');} should become <input class="rounded-md bg-black/50" />":
${input}		
			`
		},
		python: {
			label: 'Python',
			icon: 'python',
			query: (input) => `Convert the following code to Python 3:\n${input}`
		},
		javascript: {
			label: 'JavaScript',
			icon: 'javascript',
			query: (input) => `Convert the following code to JavaScript:\n${input}`
		},
		typescript: {
			label: 'TypeScript',
			icon: 'typescript',
			query: (input) => `Convert the following code to TypeScript:\n${input}`
		}
	} satisfies Options;

	let loading = false;
	let output = '';
	let input = '';
	let error: string | null = null;
	let selected = objectKeys(options)[0];
	let queryVisible = false;
	let query = options[selected].query(input);
	$: query = options[selected].query(input);

	async function search() {
		if (loading || !input) return;
		output = '';
		error = null;
		loading = true;

		const response = await fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({ search: query }),
			headers: {
				'content-type': 'application/json'
			}
		});

		if (response.ok) {
			try {
				await fetchStream(response, (chunk) => {
					output += chunk;
				});
			} catch (err) {
				error = 'Looks like OpenAI timed out :(';
			}
		} else {
			error = await response.text();
		}
		loading = false;
	}
</script>

<main class="relative mx-auto max-w-5xl overflow-hidden px-4 pb-8">
	<div class="bg" />
	<h1 class="mt-16 text-center text-5xl font-bold leading-tight ">
		Convert <span class="gradient-text">code</span> to your programming
		<span class="gradient-text">language</span> of choice
	</h1>

	<div class="mt-8 grid gap-4 lg:grid-cols-2">
		<div>
			<label for="input" class="font-semibold">Input</label>
			<textarea
				bind:value={input}
				name="input"
				class="input mt-2 w-full"
				rows="20"
				placeholder="Type here..."
			/>
		</div>
		<div>
			<label for="output" class="font-semibold">Output</label>
			<textarea
				bind:value={output}
				name="output"
				readonly
				class="input mt-2 w-full"
				rows="20"
				placeholder="Awaiting conversion..."
			/>
		</div>
	</div>

	<div class="mt-8 flex items-center justify-center gap-4">
		<Button {loading} on:click={search}>Convert</Button>
		<span>to</span>
		<Select bind:value={selected} icon={options[selected].icon}>
			{#each objectKeys(options) as key}
				<option value={key}>{options[key].label}</option>
			{/each}
		</Select>
	</div>

	<!-- <button
		class="mx-auto mt-8 block text-gray-400 underline underline-offset-1 hover:text-gray-300"
		on:click={() => (queryVisible = !queryVisible)}
	>
		{queryVisible ? 'Hide' : 'Modify'} search query
	</button> -->

	{#if queryVisible}
		<div class="mt-4">
			<label for="query" class="font-semibold">Query</label>
			<textarea
				bind:value={query}
				name="query"
				class="input mt-2 w-full"
				rows="10"
				placeholder="Awaiting conversion..."
			/>
		</div>
	{/if}

	{#if error}
		<p class="mt-4 text-center text-red-500">{error}</p>
	{/if}
</main>

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

	.input {
		border: 1px solid theme('colors.gray.500');
		border-radius: theme('borderRadius.md');
		background-color: theme('colors.black/0.5');
		padding: theme('padding.4');
		font-family: theme('fontFamily.mono');
		color: theme('colors.white');

		&:focus {
			border-color: theme('colors.orange.300');
			outline: none;
			@apply ring ring-orange-300;
		}
	}
</style>
