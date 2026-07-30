import { getErrorMessage } from '$lib/core/errors';
import type { Animal } from '$lib/types/domain/animal';
import { animalService } from '../services/animals';
import type { CreateAnimalInput, UpdateAnimalInput } from '../types';

/** Global species catalog — changes rarely, shared by characterization and lessons. */
export class AnimalsStore {
	items = $state<Animal[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await animalService.list();
			this.loaded = true;
		} catch (err) {
			this.error = getErrorMessage(err);
		} finally {
			this.loading = false;
		}
	}

	async ensureLoaded() {
		if (!this.loaded && !this.loading) await this.load();
	}

	async create(input: CreateAnimalInput) {
		const created = await animalService.create(input);
		this.items = [...this.items, created].sort((a, b) => a.name.localeCompare(b.name));
		return created;
	}

	async update(id: string, input: UpdateAnimalInput) {
		const updated = await animalService.update(id, input);
		this.items = this.items.map((animal) => (animal.id === id ? updated : animal));
		return updated;
	}

	async remove(id: string) {
		await animalService.remove(id);
		this.items = this.items.filter((animal) => animal.id !== id);
	}

	byId(id: string) {
		return this.items.find((animal) => animal.id === id) ?? null;
	}
}

export const animalsStore = new AnimalsStore();
