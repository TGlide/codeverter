<script lang="ts">
	let loading = false;
	let endStream = false;
	let searchResponse = '';
	let input = '';
	let error = '';
	let selectedFramework = 'svelte';

	async function search() {
		if (loading) return;
		searchResponse = '';
		endStream = false;
		loading = true;
		let fullSearchCriteria = `Convert the following component to a ${selectedFramework} component:
			${input}		
		`;
		const response = await fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({ searched: fullSearchCriteria }),
			headers: {
				'content-type': 'application/json'
			}
		});
		if (response.ok) {
			try {
				const data = response.body;
				if (!data) {
					return;
				}
				const reader = data.getReader();
				const decoder = new TextDecoder();
				while (true) {
					console.log('reading');
					const { value, done } = await reader.read();
					const chunkValue = decoder.decode(value);
					searchResponse += chunkValue;
					if (done) {
						endStream = true;
						break;
					}
				}
			} catch (err) {
				error = 'Looks like OpenAI timed out :(';
			}
		} else {
			error = await response.text();
		}
		loading = false;
	}
</script>

<main class="min-h-screen bg-black text-white">
	<div class="mx-auto max-w-5xl ">
		<div class="grid grid-cols-2 gap-4 pt-16">
			<div>
				<label for="input">Input</label>
				<textarea
					bind:value={input}
					name="input"
					class="mt-2 w-full rounded-md border border-solid border-white bg-black p-2 text-white"
					rows="30"
					placeholder="Type here..."
				/>
			</div>
			<div>
				<label for="output">Output</label>
				<textarea
					bind:value={searchResponse}
					name="output"
					readonly
					class="mt-2 w-full rounded-md border border-solid border-white bg-black p-2 text-white"
					rows="30"
					placeholder="Type here..."
				/>
			</div>
		</div>

		<div class="flex flex-col items-center mt-8 gap-4">
			<select
				class="bg-black border border-solid border-white rounded-md p-1"
				bind:value={selectedFramework}
			>
				<option value="svelte">Svelte</option>
				<option value="react">React</option>
				<option value="Vue 2">Vue 2</option>
				<option value="Vue3 sfc with template tag and <script setup> syntax">Vue 3</option>
			</select>
			<button class="btn mx-auto block" on:click={search}>Convert</button>
		</div>
	</div>
</main>
