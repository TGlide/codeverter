import { wordCount } from '$helpers/string';
import { getQueryOption, systemQuery } from '$lib/query';
import type { GPT } from '$stores/gpt';
import { createParser, type ParseEvent } from 'eventsource-parser';

interface OpenAIChatPayload {
	model: GPT;
	messages: Array<{
		role: 'user' | 'system' | 'agent';
		content: string;
	}>;
	temperature: number;
	frequency_penalty: number;
	presence_penalty: number;
	stream: boolean;
	n: number;
}

type OpenAIChatStreamParams = {
	search: string;
	key: string;
	model: GPT;
};

async function OpenAIChatStream({ search, key, model }: OpenAIChatStreamParams) {
	const payload: OpenAIChatPayload = {
		model,
		messages: [
			{ role: 'system', content: systemQuery },
			{
				role: 'user',
				content: search
			}
		],
		temperature: 0.5,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	};

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	let counter = 0;

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
	const { input, type, key, params, model } = await request.json();
	const queryOption = getQueryOption(type);
	if (!queryOption) throw new Error('Invalid query type');

	const query = queryOption.query(input, params);
	console.log(query);
	const stream = await OpenAIChatStream({ search: query, key, model });

	return new Response(stream);
}
