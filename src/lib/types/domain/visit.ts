export type VisitStatus = 'pending' | 'approved' | 'scheduled' | 'completed' | 'rejected';

export interface Visit {
	id: string;
	school_id: string;
	requested_by: string | null;
	status: VisitStatus;
	requested_date: string | null;
	scheduled_date: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
}
