import { MockService, id, now } from '$lib/core/mock-service';
import type { Visit } from '$lib/types/domain/visit';
import { SEED_SCHOOL_IDS } from '$lib/features/schools/services/schools';
import type { CreateVisitInput, UpdateVisitInput } from '../types';

const SEED: Visit[] = [
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.elRoble,
		requested_by: 'Marta Gómez',
		status: 'scheduled',
		requested_date: '2026-07-10',
		scheduled_date: '2026-08-15',
		notes: 'Visita a la minigranja para ver a las gallinas.',
		created_at: now(),
		updated_at: now()
	},
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.buenavista,
		requested_by: 'Julián Restrepo',
		status: 'pending',
		requested_date: '2026-07-20',
		scheduled_date: null,
		notes: null,
		created_at: now(),
		updated_at: now()
	}
];

export class VisitService extends MockService<Visit> {
	constructor() {
		super(SEED);
	}

	list() {
		return this.findAll();
	}

	async listBySchool(schoolId: string) {
		const all = await this.findAll();
		return all.filter((visit) => visit.school_id === schoolId);
	}

	create(input: CreateVisitInput) {
		return this.insert({
			id: id(),
			school_id: input.school_id,
			requested_by: input.requested_by ?? null,
			status: 'pending',
			requested_date: input.requested_date ?? null,
			scheduled_date: null,
			notes: input.notes ?? null,
			created_at: now(),
			updated_at: now()
		});
	}

	update(visitId: string, input: UpdateVisitInput) {
		return this.patch(visitId, { ...input, updated_at: now() });
	}

	remove(visitId: string) {
		return this.destroy(visitId);
	}
}

export const visitService = new VisitService();
