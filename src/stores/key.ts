import { localStorageWritable } from '$helpers/store';

export const key = localStorageWritable<string | null>('openai-key', null);
