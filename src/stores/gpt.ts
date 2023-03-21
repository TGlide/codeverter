import { localStorageWritable } from '$helpers/store';

export enum GPT {
	'three-dot-five' = 'gpt-3.5-turbo',
	'four' = 'gpt-4'
}

export const gpt = localStorageWritable<GPT>('openai-gpt-version', GPT['three-dot-five']);
