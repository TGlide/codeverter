import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export function localStorageWritable<T>(key: string, defaultValue?: T) {
	const localStoreItem = browser ? localStorage.getItem(key) : undefined;
	const initialData = localStoreItem ? JSON.parse(localStoreItem) : defaultValue;

	const store: Writable<T> = writable(initialData);

	const set: typeof store.set = (value) => {
		localStorage.setItem(key, JSON.stringify(value));
		store.set(value);
	};

	const update: typeof store.update = (fn) => {
		store.update((prev) => {
			const newValue = fn(prev);
			set(newValue);
			return newValue;
		});
	};

	return {
		...store,
		set,
		update
	};
}
