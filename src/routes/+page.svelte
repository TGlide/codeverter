<main class="min-h-screen bg-black text-white">
	<div class="mx-auto max-w-5xl ">
		<div class="grid grid-cols-2 gap-4 pt-16">
			<div>
				<label for="input">Input</label>
				<textarea
					name="input"
					class="mt-2 w-full rounded-md border border-solid border-white bg-black p-2 text-white"
					rows="30"
					placeholder="Type here..."
				/>
			</div>
			<div>
				<label for="output">Output</label>
				<textarea
					name="output"
					readonly
					class="mt-2 w-full rounded-md border border-solid border-white bg-black p-2 text-white"
					rows="30"
					placeholder="Type here..."
				/>
			</div>
		</div>

		<div class="flex flex-col items-center mt-8 gap-4">
			<select class="bg-black border border-solid border-white rounded-md p-1" name="" id="">
				<option value="svelte">Svelte</option>
				<option value="react">React</option>
				<option value="Vue">Vue</option>
				<option value="Angular">Angular</option>
			</select>
			<button class="btn mx-auto block">Convert</button>
		</div>
	</div>
</main>
