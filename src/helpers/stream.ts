export async function fetchStream(response: Response, onRead?: (chunk: string) => void) {
	const data = response.body;
	if (!data) return;

	const reader = data.getReader();
	const decoder = new TextDecoder();

	let done = false;
	while (!done) {
		const res = await reader.read();
		done = res.done;

		const chunkValue = decoder.decode(res.value);
		onRead?.(chunkValue);
	}
}
