import { getErrorMessage } from '$lib/core/errors';
import type { School } from '$lib/types/domain/school';
import { schoolService } from '../services/schools';
import type { CreateSchoolInput, UpdateSchoolInput } from '../types';

/** Global reactive list of schools — shared across dashboard, students, visits, prospects. */
export class SchoolsStore {
	items = $state<School[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await schoolService.list();
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

	async create(input: CreateSchoolInput) {
		const created = await schoolService.create(input);
		this.items = [created, ...this.items];
		return created;
	}

	async update(id: string, input: UpdateSchoolInput) {
		const updated = await schoolService.update(id, input);
		this.items = this.items.map((school) => (school.id === id ? updated : school));
		return updated;
	}

	async updateCharacterization(id: string, characterization: Record<string, unknown>) {
		const updated = await schoolService.updateCharacterization(id, characterization);
		this.items = this.items.map((school) => (school.id === id ? updated : school));
		return updated;
	}

	async remove(id: string) {
		await schoolService.remove(id);
		this.items = this.items.filter((school) => school.id !== id);
	}

	byId(id: string) {
		return this.items.find((school) => school.id === id) ?? null;
	}
}

export const schoolsStore = new SchoolsStore();
