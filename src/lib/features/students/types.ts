export interface CreateStudentInput {
	school_id: string;
	name: string;
	grade?: string;
}

export type UpdateStudentInput = Partial<Omit<CreateStudentInput, 'school_id'>>;
