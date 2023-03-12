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
				<label for="output">Input</label>
				<textarea
					name="output"
					readonly
					class="mt-2 w-full rounded-md border border-solid border-white bg-black p-2 text-white"
					rows="30"
					placeholder="Type here..."
				/>
			</div>
		</div>
		<button class="btn mx-auto mt-8 block">Convert</button>
	</div>
</main>
