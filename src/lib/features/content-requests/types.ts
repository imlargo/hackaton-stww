import type { ContentRequestStatus, ContentRequestType } from '$lib/types/domain/content-request';

export interface CreateContentRequestInput {
	school_id: string;
	type: ContentRequestType;
	title: string;
	description?: string;
	requested_by?: string;
}

export interface UpdateContentRequestInput {
	status?: ContentRequestStatus;
}
