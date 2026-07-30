export interface Lesson {
	id: string;
	title: string;
	description: string | null;
	content: string | null;
	animal_id: string | null;
	points_reward: number;
	order_index: number;
	created_at: string;
}

export interface StudentProgress {
	id: string;
	student_id: string;
	lesson_id: string;
	points_earned: number;
	completed_at: string;
}
