type QueryFn = (input: string) => string;

const options = {
	svelte: (input) => `Convert the following component to a Svelte component.
		Don't import useState, as Svelte does not have it. Use Typescript.
		Here's the component:\n${input}`,
	react: (input) => `Convert the following component to a React component:\n${input}`,
	vue2: (input) => `Convert the following component to a Vue 2 component:\n${input}`,
	vue3: (input) =>
		`Convert the following component to a Vue 3 component, using SFCs, template tags, and <script setup>.
    Use refs for state, and defineProps for props (if needed). Do not use useState.
    Here's the component:\n${input}`,
	angular: (input) => `Convert the following component to an Angular component:\n${input}`,
	css: (input) => `Convert the following tailwind-css code to normal CSS.
Use the theme function when possible, e.g. '@apply text-white' should become 'color: theme("colors.white")''. 
Also, be smart with opacity colors. e.g. '@apply bg-black-50' should become 'background-color: theme("colors.black/0.5")'.
Do not use CSS vars. Do not use hex color values.
For hover states, use SCSS-like nesting. e.g. '@apply hover:bg-black-50' should become '&:hover { background-color: theme("colors.black/0.5") }'.
This is the code:\n${input}`,
	tailwind: (
		input
	) => `Convert the following CSS code to Tailwind CSS code. Use the @apply directive.
e.g. .input { border-radius: theme('borderRadius.md'); background-color: theme('colors.black/0.5');} should become <input class="rounded-md bg-black/50" />":
${input}		
		`,

	python: (input) => `Convert the following code to Python 3:\n${input}`,
	javascript: (input) => `Convert the following code to JavaScript:\n${input}`,
	typescript: (input) => `Convert the following code to TypeScript:\n${input}`,
	rust: (input) => `Convert the following code to Rust:\n${input}`
} satisfies Record<string, QueryFn>;

export function generateQuery(input: string, type: keyof typeof options) {
	return options[type](input);
}
