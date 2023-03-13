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
		};
	};
	const options = {
		svelte: {
			label: 'Svelte',
			icon: 'svelte'
		},
		react: {
			label: 'React',
			icon: 'react'
		},
		vue2: {
			label: 'Vue 2',
			icon: 'vue'
		},
		vue3: {
			label: 'Vue 3',
			icon: 'vue'
		},
		angular: {
			label: 'Angular',
			icon: 'angular'
		},
		css: {
			label: 'CSS',
			icon: 'css'
		},
		tailwind: {
			label: 'Tailwind',
			icon: 'tailwind'
		},
		python: {
			label: 'Python',
			icon: 'python'
		},
		javascript: {
			label: 'JavaScript',
			icon: 'javascript'
		},
		typescript: {
			label: 'TypeScript',
			icon: 'typescript'
		},
		rust: {
			label: 'Rust',
			icon: 'rust'
		}
	} satisfies Options;

	let loading = false;
	let output = '';
	let input = '';
	let error: string | null = null;
	let selected = objectKeys(options)[0];

	async function search() {
		if (loading || !input) return;
		output = '';
		error = null;
		loading = true;

		const response = await fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({ input, type: selected }),
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

<svelte:head>
	<title>Codeverter</title>
	<meta name="description" content="Convert code to your programming language of choice" />
</svelte:head>

<main class="relative overflow-hidden flex min-h-screen flex-col justify-between gap-4 pb-8">
	<div class="bg" />
	<div class=" mx-auto max-w-5xl px-4 ">
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
			<Button {loading} disabled={!input.trim()} on:click={search}>Convert</Button>
			<span>to</span>
			<Select bind:value={selected} icon={options[selected].icon}>
				{#each objectKeys(options) as key}
					<option value={key}>{options[key].label}</option>
				{/each}
			</Select>
		</div>

		{#if error}
			<p class="mt-4 text-center text-red-500">{error}</p>
		{/if}
	</div>

	<footer class="text-center">
		<p>
			Made by <a
				class="text-orange-300 underline hover:text-orange-200"
				href="https://www.thomasglopes.com/"
				target="_blank">Thomas G. Lopes</a
			>
		</p>
		<p class="text-gray-500 text-sm mt-1">Warning: Code conversions may not be accurate.</p>
		<p class="text-gray-500 text-sm">
			Powered by OpenAI. <a
				href="https://github.com/TGlide/codeverter"
				target="_blank"
				class="underline hover:text-gray-400">Source</a
			>
		</p>
	</footer>
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
