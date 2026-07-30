import { MockService, id, now } from '$lib/core/mock-service';
import type { ContentRequest } from '$lib/types/domain/content-request';
import { SEED_SCHOOL_IDS } from '$lib/features/schools/services/schools';
import type { CreateContentRequestInput, UpdateContentRequestInput } from '../types';

const SEED: ContentRequest[] = [
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.elRoble,
		type: 'animal',
		title: 'Ficha de la cabra',
		description: 'Nos gustaría contenido para identificar y cuidar cabras, tenemos varias en la vereda.',
		requested_by: 'Marta Gómez',
		status: 'in_review',
		created_at: now(),
		updated_at: now()
	},
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.buenavista,
		type: 'lesson',
		title: 'Lección sobre compostaje',
		description: 'Contenido para enseñar a los estudiantes a hacer compost con residuos del colegio.',
		requested_by: 'Julián Restrepo',
		status: 'pending',
		created_at: now(),
		updated_at: now()
	}
];

export class ContentRequestService extends MockService<ContentRequest> {
	constructor() {
		super(SEED);
	}

	list() {
		return this.findAll();
	}

	async listBySchool(schoolId: string) {
		const all = await this.findAll();
		return all.filter((request) => request.school_id === schoolId);
	}

	create(input: CreateContentRequestInput) {
		return this.insert({
			id: id(),
			school_id: input.school_id,
			type: input.type,
			title: input.title,
			description: input.description ?? null,
			requested_by: input.requested_by ?? null,
			status: 'pending',
			created_at: now(),
			updated_at: now()
		});
	}

	update(requestId: string, input: UpdateContentRequestInput) {
		return this.patch(requestId, { ...input, updated_at: now() });
	}

	remove(requestId: string) {
		return this.destroy(requestId);
	}
}

export const contentRequestService = new ContentRequestService();
