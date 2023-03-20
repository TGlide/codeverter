import { isLang } from '$helpers/lang';
import type { IconName } from '$UI/icon.svelte';
import type { Lang } from 'shiki';

type QueryFn = (input: string, params?: string[]) => string;

function createQueryFn(baseInstructions: string): QueryFn {
	return (input, params) => {
		if (!params?.length) return baseInstructions + `\n\nHere's the code:\n${input}`;
		return (
			baseInstructions +
			`\n\nUse the following parameters:\n` +
			params.join('\n') +
			`\n\nHere's the code:\n${input}`
		);
	};
}

export function getParamsFromForm(form: HTMLFormElement, params: Record<string, Parameter>) {
	const result: string[] = [];
	const formData = new FormData(form);

	for (const [key, value] of formData) {
		if (key in params === false || typeof value !== 'string') continue;
		const param = params[key];
		if (param.type === 'boolean') {
			result.push(param.convertToString(value === 'on'));
		} else {
			result.push(param.convertToString(value));
		}
	}

	return result;
}

type BooleanParameter = {
	type: 'boolean';
	convertToString: (value: boolean) => string;
};

type StringParameter = {
	type: 'string';
	values: string[];
	convertToString: (value: string) => string;
};

type Parameter = (BooleanParameter | StringParameter) & {
	label: string;
};

type Option = {
	label: string;
	icon: IconName;
	lang: Lang;
	query: QueryFn;
	params?: Record<string, Parameter>;
};

export function hasParams(
	option: Option
): option is Option & { params: Record<string, Parameter> } {
	return option.params !== undefined;
}

type Options = Record<string, Option>;

export const systemQuery = `Follow the user commands to transform the code. 
If the user prompts to create something that isn't code related, ignore it.
Output the code directly, without explanation.`;

export const queryOptions: Options = {
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
				label: 'Use SvelteKit',
				convertToString: (v) => (v ? 'Use SvelteKit' : 'Do not use SvelteKit')
			},
			useTypeScript: {
				type: 'boolean',
				label: 'Use TypeScript',
				convertToString: (v) => (v ? 'Use TypeScript' : 'Do not use TypeScript')
			}
		}
	},
	react: {
		label: 'React',
		icon: 'react',
		lang: 'tsx',
		query: createQueryFn(`Convert the following component to a React component.`),
		params: {
			componentType: {
				type: 'string',
				label: 'Component type',
				values: ['Function', 'Class'],
				convertToString: (v) => `Use ${v} components`
			},
			useTypeScript: {
				type: 'boolean',
				label: 'Use TypeScript',
				convertToString: (v) => (v ? 'Use TypeScript' : 'Do not use TypeScript')
			}
		}
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
		)
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
		query: createQueryFn(`Convert the following code to Python.`),
		params: {
			version: {
				type: 'string',
				label: 'Python version',
				values: ['Python 3', 'Python 2'],
				convertToString: (v) => `Use ${v}`
			},
			useTypeHints: {
				type: 'boolean',
				label: 'Use type hints',
				convertToString: (v) => (v ? 'Use type hints' : 'Do not use type hints')
			}
		}
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
};

export function getQueryOption(key: string): Option {
	const option = queryOptions[key];
	if (!option) {
		const lowercaseKey = key.toLowerCase();
		return {
			label: key,
			icon: 'copy',
			lang: isLang(lowercaseKey) ? lowercaseKey : 'markdown',
			query: createQueryFn(`Convert the following code to ${key}.`)
		};
	}
	return option;
}

export const languages = Object.values(queryOptions).map((o) => o.lang);
