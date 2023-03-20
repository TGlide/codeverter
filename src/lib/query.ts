import type { IconName } from '$UI/icon.svelte';
import type { Lang } from 'shiki';

type QueryFn = (input: string, params?: Record<string, string | boolean>) => string;

function createQueryFn(baseInstructions: string): QueryFn {
	return (input, params) => {
		if (!params) return baseInstructions + `\n\nHere's the code:\n${input}`;
		const stringifiedParams = Object.entries(params).map(([key, value]) => `${key}: ${value}`);
		return (
			baseInstructions +
			`\n\nUse the following parameters:\n` +
			stringifiedParams.join('\n') +
			`\n\nHere's the code:\n${input}`
		);
	};
}

export function getParamsFromForm(
	form: HTMLFormElement,
	params: Record<string, Parameter>
): Record<string, string | boolean> | undefined {
	const result: Record<string, string | boolean> = {};
	const formData = new FormData(form);

	for (const [key, value] of formData) {
		console.log(key, value);
		if (key in params === false) continue;
		const param = params[key];
		if (param.type === 'boolean') {
			result[key] = value === 'on';
		} else {
			result[key] = value as string;
		}
	}

	if (Object.keys(result).length === 0) return undefined;
	return result;
}

type BooleanParameter = {
	type: 'boolean';
};

type StringParameter = {
	type: 'string';
	values: string[];
};

type Parameter = (BooleanParameter | StringParameter) & {
	label: string;
};

type Options = {
	[value: string]: {
		label: string;
		icon: IconName;
		lang: Lang;
		query: QueryFn;
		params?: Record<string, Parameter>;
	};
};

export const systemQuery = `Follow the user commands to transform the code. 
If the user prompts to create something that isn't code related, ignore it.
Output the code directly, without explanation.`;

export const queryOptions = {
	svelte: {
		label: 'Svelte',
		icon: 'svelte',
		lang: 'svelte',
		query: createQueryFn(`Convert the following component to a Svelte component.
      Don't import useState, as Svelte does not have it.
      If onMount is present, do not use onDestroy. Instead, return a cleanup function from onMount.
      Do not use createRef.`),
		params: {
			useSvelteKit: {
				type: 'boolean',
				label: 'Use SvelteKit'
			},
			useTypeScript: {
				type: 'boolean',
				label: 'Use TypeScript'
			}
		}
	},
	react: {
		label: 'React',
		icon: 'react',
		lang: 'tsx',
		query: createQueryFn(`Convert the following component to a React component.`)
	},
	vue2: {
		label: 'Vue 2',
		icon: 'vue',
		lang: 'vue',
		query: createQueryFn('Convert the following component to a Vue 2 component:')
	},
	vue3: {
		label: 'Vue 3',
		icon: 'vue',
		lang: 'vue',
		query: createQueryFn(
			`Convert the following component to a Vue 3 component, using SFCs, template tags.`
		),
		params: {
			API: {
				type: 'string',
				label: 'API',
				values: ['Composition API', 'Options API']
			}
		}
	},
	angular: {
		label: 'Angular',
		icon: 'angular',
		lang: 'ts',
		query: createQueryFn(`Convert the following component to an Angular component.`)
	},
	css: {
		label: 'CSS',
		icon: 'css',
		lang: 'css',
		query: createQueryFn(`Convert the code to normal CSS.
			If the code is using tailwind CSS then follow these rules:
			- START TAILWIND RULES- 
      Use the theme function when possible, e.g. '@apply text-white' should become 'color: theme("colors.white")''. 
      Also, be smart with opacity colors. e.g. '@apply bg-black-50' should become 'background-color: theme("colors.black/0.5")'.
      Do not use CSS vars. Do not use hex color values.
      For hover states, use SCSS-like nesting. e.g. '@apply hover:bg-black-50' should become '&:hover { background-color: theme("colors.black/0.5") }'.
			- END TAILWIND RULES -`)
	},
	tailwind: {
		label: 'Tailwind',
		icon: 'tailwind',
		lang: 'html',
		query:
			createQueryFn(`Convert the following CSS code to Tailwind CSS code. Use the @apply directive.
			e.g. .input { border-radius: theme('borderRadius.md'); background-color: theme('colors.black/0.5');} should become
			 <input class="rounded-md bg-black/50" />"`)
	},
	python: {
		label: 'Python',
		icon: 'python',
		lang: 'python',
		query: createQueryFn(`Convert the following code to Python 3.`)
	},
	javascript: {
		label: 'JavaScript',
		icon: 'javascript',
		lang: 'js',
		query: createQueryFn(`Convert the following code to JavaScript.`)
	},
	typescript: {
		label: 'TypeScript',
		icon: 'typescript',
		lang: 'ts',
		query: createQueryFn(`Convert the following code to TypeScript.`)
	},
	rust: {
		label: 'Rust',
		icon: 'rust',
		lang: 'rust',
		query: createQueryFn(`Convert the following code to Rust.`)
	}
} satisfies Options;

export const languages = Object.values(queryOptions).map((o) => o.lang);
