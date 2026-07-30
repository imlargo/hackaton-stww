export interface CreateAnimalInput {
	name: string;
	common_name?: string;
	category?: string;
	care_info?: string;
	image_url?: string;
}

export type UpdateAnimalInput = Partial<CreateAnimalInput>;
