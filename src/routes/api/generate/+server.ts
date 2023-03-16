import { wordCount } from '$helpers/string';
import { generateQuery, systemQuery } from '$lib/query';
import { createParser, type ParseEvent } from 'eventsource-parser';

interface OpenAIChatPayload {
	model: string;
	messages: Array<{
		role: 'user' | 'system' | 'agent';
		content: string;
	}>;
	temperature: number;
	frequency_penalty: number;
	presence_penalty: number;
	max_tokens: number;
	stream: boolean;
	n: number;
}

async function OpenAIChatStream(search: string, key: string) {
	const payload: OpenAIChatPayload = {
		model: 'gpt-3.5-turbo',
		messages: [
			{ role: 'system', content: systemQuery },
			{
				role: 'user',
				content: search
			}
		],
		temperature: 0,
		max_tokens: 3500 - wordCount(search) * 2,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	};

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	let counter = 0;

	// const testRes = await fetch('https://api.openai.com/v1/chat/completions', {
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		Authorization: `Bearer ${key}`
	// 	},
	// 	method: 'POST',
	// 	body: JSON.stringify({ ...payload, stream: false })
	// });

	// const testJson = await testRes.json();
	// console.log(testJson);

	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key}`
		},
		method: 'POST',
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		console.log(await res.json());
		throw new Error("Couldn't fetch from OpenAI");
	}

	const stream = new ReadableStream({
		async start(controller) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			function onParse(event: ParseEvent) {
				if (event.type === 'event') {
					const data = event.data;
					// https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
					if (data === '[DONE]') {
						controller.close();
						return;
					}

					try {
						const json = JSON.parse(data);
						const text = json.choices[0].delta?.content;

						if (!text || (counter < 2 && (text.match(/\n/) || []).length)) {
							// this is a prefix character (i.e., "\n\n"), do nothing
							return;
						}

						const queue = encoder.encode(text);
						controller.enqueue(queue);
						counter++;
					} catch (e) {
						controller.error(e);
					}
				}
			}

			// stream response (SSE) from OpenAI may be fragmented into multiple chunks
			// this ensures we properly read chunks and invoke an event for each SSE event stream
			const parser = createParser(onParse);
			// https://web.dev/streams/#asynchronous-iteration
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for await (const chunk of res.body as any) {
				const chunkString = decoder.decode(chunk);
				parser.feed(chunkString);
			}
		}
	});
	return stream;
}

export async function POST({ request }) {
	const { input, type, key } = await request.json();
	const query = generateQuery(input, type);

	const stream = await OpenAIChatStream(query, key);

	return new Response(stream);
}
