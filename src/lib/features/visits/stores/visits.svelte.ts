import { getErrorMessage } from '$lib/core/errors';
import type { Visit } from '$lib/types/domain/visit';
import { visitService } from '../services/visits';
import type { CreateVisitInput, UpdateVisitInput } from '../types';

/** Global visit requests — this is the "cronograma" of where Unergy is going. */
export class VisitsStore {
	items = $state<Visit[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	readonly upcoming = $derived(
		[...this.items]
			.filter((v) => v.status === 'scheduled' && v.scheduled_date)
			.sort((a, b) => (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))
	);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await visitService.list();
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

	async create(input: CreateVisitInput) {
		const created = await visitService.create(input);
		this.items = [created, ...this.items];
		return created;
	}

	async update(id: string, input: UpdateVisitInput) {
		const updated = await visitService.update(id, input);
		this.items = this.items.map((visit) => (visit.id === id ? updated : visit));
		return updated;
	}

	async remove(id: string) {
		await visitService.remove(id);
		this.items = this.items.filter((visit) => visit.id !== id);
	}

	bySchool(schoolId: string) {
		return this.items.filter((visit) => visit.school_id === schoolId);
	}
}

export const visitsStore = new VisitsStore();
