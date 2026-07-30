export interface CreateLessonInput {
	title: string;
	description?: string;
	content?: string;
	animal_id?: string;
	points_reward?: number;
	order_index?: number;
}

export type UpdateLessonInput = Partial<CreateLessonInput>;
