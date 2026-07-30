export interface School {
	id: string;
	name: string;
	city: string | null;
	address: string | null;
	contact_name: string | null;
	contact_email: string | null;
	contact_phone: string | null;
	characterization: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
}
