/**
 * MockService — in-memory service base class for hackathon-speed features.
 *
 * No backend, no Supabase: each service keeps its own in-memory array (seeded
 * with demo data) and simulates network latency. Same shape as BaseService so
 * swapping in a real API/Supabase-backed implementation later is a one-file change.
 */
import { AppError } from '$lib/core/errors';

export function id(): string {
	return crypto.randomUUID();
}

export function now(): string {
	return new Date().toISOString();
}

function delay(ms = 200): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockService<T extends { id: string }> {
	protected items: T[];

	constructor(seed: T[] = []) {
		this.items = seed;
	}

	protected async findAll(): Promise<T[]> {
		await delay();
		return [...this.items];
	}

	protected async findOne(itemId: string): Promise<T> {
		await delay();
		const found = this.items.find((item) => item.id === itemId);
		if (!found) throw new AppError('Resource not found.', 'NOT_FOUND');
		return found;
	}

	protected async insert(item: T): Promise<T> {
		await delay();
		this.items = [item, ...this.items];
		return item;
	}

	protected async patch(itemId: string, changes: Partial<T>): Promise<T> {
		await delay();
		const index = this.items.findIndex((item) => item.id === itemId);
		if (index === -1) throw new AppError('Resource not found.', 'NOT_FOUND');
		const updated = { ...this.items[index], ...changes };
		this.items = [...this.items.slice(0, index), updated, ...this.items.slice(index + 1)];
		return updated;
	}

	protected async destroy(itemId: string): Promise<void> {
		await delay();
		this.items = this.items.filter((item) => item.id !== itemId);
	}
}
