import type { ProspectStatus } from '$lib/types/domain/prospect';

export interface CreateProspectInput {
	school_name: string;
	contact_name?: string;
	contact_email?: string;
	contact_phone?: string;
	city?: string;
	notes?: string;
}

export interface UpdateProspectInput {
	status?: ProspectStatus;
	notes?: string;
}
