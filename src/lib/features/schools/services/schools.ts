import { MockService, id, now } from '$lib/core/mock-service';
import type { School } from '$lib/types/domain/school';
import type { CreateSchoolInput, UpdateSchoolInput } from '../types';

export const SEED_SCHOOL_IDS = { elRoble: id(), buenavista: id() } as const;

const SEED: School[] = [
	{
		id: SEED_SCHOOL_IDS.elRoble,
		name: 'Institución Educativa El Roble',
		city: 'Cali',
		address: 'Vereda El Roble, km 3',
		contact_name: 'Marta Gómez',
		contact_email: 'marta.gomez@ieelroble.edu.co',
		contact_phone: '300 123 4567',
		characterization: null,
		created_at: now(),
		updated_at: now()
	},
	{
		id: SEED_SCHOOL_IDS.buenavista,
		name: 'Colegio Rural Buenavista',
		city: 'Popayán',
		address: 'Km 8 vía Buenavista',
		contact_name: 'Julián Restrepo',
		contact_email: 'jrestrepo@buenavista.edu.co',
		contact_phone: '311 987 6543',
		characterization: null,
		created_at: now(),
		updated_at: now()
	}
];

export class SchoolService extends MockService<School> {
	constructor() {
		super(SEED);
	}

	list() {
		return this.findAll();
	}

	get(schoolId: string) {
		return this.findOne(schoolId);
	}

	create(input: CreateSchoolInput) {
		return this.insert({
			id: id(),
			name: input.name,
			city: input.city ?? null,
			address: input.address ?? null,
			contact_name: input.contact_name ?? null,
			contact_email: input.contact_email ?? null,
			contact_phone: input.contact_phone ?? null,
			characterization: null,
			created_at: now(),
			updated_at: now()
		});
	}

	update(schoolId: string, input: UpdateSchoolInput) {
		return this.patch(schoolId, { ...input, updated_at: now() });
	}

	updateCharacterization(schoolId: string, characterization: Record<string, unknown>) {
		return this.patch(schoolId, { characterization, updated_at: now() });
	}

	remove(schoolId: string) {
		return this.destroy(schoolId);
	}
}

export const schoolService = new SchoolService();
