export interface CreateSchoolInput {
	name: string;
	city?: string;
	address?: string;
	contact_name?: string;
	contact_email?: string;
	contact_phone?: string;
}

export type UpdateSchoolInput = Partial<CreateSchoolInput>;
