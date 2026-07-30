import { getErrorMessage } from '$lib/core/errors';
import type { Prospect } from '$lib/types/domain/prospect';
import { prospectService } from '../services/prospects';
import type { CreateProspectInput, UpdateProspectInput } from '../types';

/** Global pipeline of schools Unergy is courting. */
export class ProspectsStore {
	items = $state<Prospect[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await prospectService.list();
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

	async create(input: CreateProspectInput) {
		const created = await prospectService.create(input);
		this.items = [created, ...this.items];
		return created;
	}

	async update(id: string, input: UpdateProspectInput) {
		const updated = await prospectService.update(id, input);
		this.items = this.items.map((prospect) => (prospect.id === id ? updated : prospect));
		return updated;
	}

	async remove(id: string) {
		await prospectService.remove(id);
		this.items = this.items.filter((prospect) => prospect.id !== id);
	}
}

export const prospectsStore = new ProspectsStore();
