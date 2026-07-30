import type { VisitStatus } from '$lib/types/domain/visit';

export interface CreateVisitInput {
	school_id: string;
	requested_by?: string;
	requested_date?: string;
	notes?: string;
}

export interface UpdateVisitInput {
	status?: VisitStatus;
	scheduled_date?: string;
	notes?: string;
}
