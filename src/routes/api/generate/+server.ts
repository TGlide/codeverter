import { createParser, type ParseEvent } from 'eventsource-parser';
import { OPENAI_API_KEY } from '$env/static/private';
import { generateQuery } from '$helpers/query';

const key = OPENAI_API_KEY;

interface OpenAITextPayload {
	model: string;
	prompt: string;
	temperature: number;
	frequency_penalty: number;
	presence_penalty: number;
	max_tokens: number;
	stream: boolean;
	n: number;
}

async function OpenAITextStream(search: string) {
	const payload: OpenAITextPayload = {
		model: 'text-davinci-003',
		prompt: search,
		temperature: 0,
		max_tokens: 2048,
		frequency_penalty: 0.0,
		stream: true,
		presence_penalty: 0.0,
		n: 1
	};

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	let counter = 0;

	const res = await fetch('https://api.openai.com/v1/completions', {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${key}`
		},
		method: 'POST',
		body: JSON.stringify(payload)
	});

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
						const text = json.choices[0].text;

						if (counter < 2 && (text.match(/\n/) || []).length) {
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
				parser.feed(decoder.decode(chunk));
			}
		}
	});
	return stream;
}

interface OpenAIChatPayload {
	model: string;
	messages: Array<{
		role: 'user';
		content: string;
	}>;
	temperature: number;
	frequency_penalty: number;
	presence_penalty: number;
	max_tokens: number;
	stream: boolean;
	n: number;
}

async function OpenAIChatStream(search: string) {
	const payload: OpenAIChatPayload = {
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'user',
				content: search
			}
		],
		temperature: 0,
		max_tokens: 2048,
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
						console.log(json.choices[0]);
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
				parser.feed(decoder.decode(chunk));
			}
		}
	});
	return stream;
}

export async function POST({ request }) {
	const { input, type } = await request.json();
	const query = generateQuery(input, type);

	const stream = await OpenAIChatStream(query);
	return new Response(stream);
}
