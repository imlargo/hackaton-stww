export interface MinigranjaPlot {
	id: number;
	animal_id: string | null;
}

export interface MinigranjaState {
	student_id: string;
	plots: MinigranjaPlot[];
	completed: boolean;
	updated_at: string;
}
