export type ContentRequestType = 'animal' | 'lesson' | 'material' | 'other';
export type ContentRequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface ContentRequest {
	id: string;
	school_id: string;
	type: ContentRequestType;
	title: string;
	description: string | null;
	requested_by: string | null;
	status: ContentRequestStatus;
	created_at: string;
	updated_at: string;
}
