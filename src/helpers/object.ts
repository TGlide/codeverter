export function objectKeys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[];
}

export function get<T extends object>(obj: T, key: PropertyKey): T[keyof T] | null {
	if (key in obj) return obj[key as keyof T];
	return null;
}
