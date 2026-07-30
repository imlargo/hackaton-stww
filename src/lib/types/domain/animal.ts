export interface Animal {
	id: string;
	name: string;
	common_name: string | null;
	category: string | null;
	care_info: string | null;
	image_url: string | null;
	created_at: string;
}
