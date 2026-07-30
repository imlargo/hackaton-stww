import { MockService, id, now } from '$lib/core/mock-service';
import type { Prospect } from '$lib/types/domain/prospect';
import type { CreateProspectInput, UpdateProspectInput } from '../types';

const SEED: Prospect[] = [
	{
		id: id(),
		school_name: 'Escuela Nueva Esperanza',
		contact_name: 'Diana Ceballos',
		contact_email: 'diana.ceballos@nuevaesperanza.edu.co',
		contact_phone: '312 456 7890',
		city: 'Palmira',
		status: 'contacted',
		notes: 'Interesados, esperando aprobación de la rectoría.',
		created_at: now(),
		updated_at: now()
	},
	{
		id: id(),
		school_name: 'Colegio San Isidro',
		contact_name: 'Camilo Pardo',
		contact_email: 'cpardo@sanisidro.edu.co',
		contact_phone: '320 111 2233',
		city: 'Yumbo',
		status: 'new',
		notes: null,
		created_at: now(),
		updated_at: now()
	}
];

export class ProspectService extends MockService<Prospect> {
	constructor() {
		super(SEED);
	}

	list() {
		return this.findAll();
	}

	create(input: CreateProspectInput) {
		return this.insert({
			id: id(),
			school_name: input.school_name,
			contact_name: input.contact_name ?? null,
			contact_email: input.contact_email ?? null,
			contact_phone: input.contact_phone ?? null,
			city: input.city ?? null,
			status: 'new',
			notes: input.notes ?? null,
			created_at: now(),
			updated_at: now()
		});
	}

	update(prospectId: string, input: UpdateProspectInput) {
		return this.patch(prospectId, { ...input, updated_at: now() });
	}

	remove(prospectId: string) {
		return this.destroy(prospectId);
	}
}

export const prospectService = new ProspectService();
