import { getErrorMessage } from '$lib/core/errors';
import type { ContentRequest } from '$lib/types/domain/content-request';
import { contentRequestService } from '../services/content-requests';
import type { CreateContentRequestInput, UpdateContentRequestInput } from '../types';

/** Colegios piden contenido (especies, lecciones, material) — Unergy lo revisa. */
export class ContentRequestsStore {
	items = $state<ContentRequest[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await contentRequestService.list();
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

	async create(input: CreateContentRequestInput) {
		const created = await contentRequestService.create(input);
		this.items = [created, ...this.items];
		return created;
	}

	async update(id: string, input: UpdateContentRequestInput) {
		const updated = await contentRequestService.update(id, input);
		this.items = this.items.map((request) => (request.id === id ? updated : request));
		return updated;
	}

	bySchool(schoolId: string) {
		return this.items.filter((request) => request.school_id === schoolId);
	}
}

export const contentRequestsStore = new ContentRequestsStore();
