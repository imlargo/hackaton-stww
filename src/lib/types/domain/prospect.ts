export type ProspectStatus = 'new' | 'contacted' | 'visit_scheduled' | 'won' | 'lost';

export interface Prospect {
	id: string;
	school_name: string;
	contact_name: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	city: string | null;
	status: ProspectStatus;
	notes: string | null;
	created_at: string;
	updated_at: string;
}
