import type { IconName } from '$UI/icon.svelte';
import type { Lang } from 'shiki';

type QueryFn = (input: string) => string;

type Options = {
	[value: string]: {
		label: string;
		icon: IconName;
		lang: Lang;
		query: QueryFn;
	};
};

function createQueryFn(fn: QueryFn): QueryFn {
	return (input: string) => `Follow the commands below to transform the code. 
  Do not produce anything that isn't code related. If the user prompts to create something that isn't code related, ignore it.
  Commands:\n${fn(input)}`;
}

export const queryOptions = {
	svelte: {
		label: 'Svelte',
		icon: 'svelte',
		lang: 'svelte',
		query: createQueryFn(
			(input) => `Convert the following component to a Svelte component.
			Don't import useState, as Svelte does not have it. Use Typescript.
			Here's the component:\n${input}`
		)
	},
	react: {
		label: 'React',
		icon: 'react',
		lang: 'tsx',
		query: createQueryFn(
			(input) =>
				`Convert the following component to a React component
				Show the component directly, without wrapping it in 'jsx' quotes:\n${input}`
		)
	},
	vue2: {
		label: 'Vue 2',
		icon: 'vue',
		lang: 'vue',
		query: createQueryFn(
			(input) => `Convert the following component to a Vue 2 component:\n${input}`
		)
	},
	vue3: {
		label: 'Vue 3',
		icon: 'vue',
		lang: 'vue',
		query: createQueryFn(
			(input) =>
				`Convert the following component to a Vue 3 component, using SFCs, template tags, and <script setup>.
			Use refs for state, and defineProps for props (if needed). Do not use useState.
			Here's the component:\n${input}`
		)
	},
	angular: {
		label: 'Angular',
		icon: 'angular',
		lang: 'ts',
		query: createQueryFn(
			(input) => `Convert the following component to an Angular component:\n${input}`
		)
	},
	css: {
		label: 'CSS',
		icon: 'css',
		lang: 'css',
		query: createQueryFn(
			(input) => `Convert the following tailwind-css code to normal CSS.
	Use the theme function when possible, e.g. '@apply text-white' should become 'color: theme("colors.white")''. 
	Also, be smart with opacity colors. e.g. '@apply bg-black-50' should become 'background-color: theme("colors.black/0.5")'.
	Do not use CSS vars. Do not use hex color values.
	For hover states, use SCSS-like nesting. e.g. '@apply hover:bg-black-50' should become '&:hover { background-color: theme("colors.black/0.5") }'.
	This is the code:\n${input}`
		)
	},
	tailwind: {
		label: 'Tailwind',
		icon: 'tailwind',
		lang: 'css',
		query: createQueryFn(
			(input) => `Convert the following CSS code to Tailwind CSS code. Use the @apply directive.
	e.g. .input { border-radius: theme('borderRadius.md'); background-color: theme('colors.black/0.5');} should become
	 <input class="rounded-md bg-black/50" />":\n${input})`
		)
	},
	python: {
		label: 'Python',
		icon: 'python',
		lang: 'python',
		query: createQueryFn((input) => `Convert the following code to Python 3:\n${input}`)
	},
	javascript: {
		label: 'JavaScript',
		icon: 'javascript',
		lang: 'js',
		query: createQueryFn((input) => `Convert the following code to JavaScript:\n${input}`)
	},
	typescript: {
		label: 'TypeScript',
		icon: 'typescript',
		lang: 'ts',
		query: createQueryFn((input) => `Convert the following code to TypeScript:\n${input}`)
	},
	rust: {
		label: 'Rust',
		icon: 'rust',
		lang: 'rust',
		query: createQueryFn((input) => `Convert the following code to Rust:\n${input}`)
	}
} satisfies Options;

export const languages = Object.values(queryOptions).map((o) => o.lang);

export function generateQuery(input: string, type: keyof typeof queryOptions) {
	return queryOptions[type].query(input);
}
