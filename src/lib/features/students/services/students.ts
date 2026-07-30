import { MockService, id, now } from '$lib/core/mock-service';
import type { Student } from '$lib/types/domain/student';
import { SEED_SCHOOL_IDS } from '$lib/features/schools/services/schools';
import type { CreateStudentInput, UpdateStudentInput } from '../types';

const SEED: Student[] = [
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.elRoble,
		name: 'Sofía Martínez',
		grade: '5°',
		points: 120,
		created_at: now(),
		updated_at: now()
	},
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.elRoble,
		name: 'Andrés Torres',
		grade: '4°',
		points: 80,
		created_at: now(),
		updated_at: now()
	},
	{
		id: id(),
		school_id: SEED_SCHOOL_IDS.buenavista,
		name: 'Valentina Ríos',
		grade: '5°',
		points: 60,
		created_at: now(),
		updated_at: now()
	}
];

export class StudentService extends MockService<Student> {
	constructor() {
		super(SEED);
	}

	list() {
		return this.findAll();
	}

	async listBySchool(schoolId: string) {
		const all = await this.findAll();
		return all.filter((student) => student.school_id === schoolId);
	}

	create(input: CreateStudentInput) {
		return this.insert({
			id: id(),
			school_id: input.school_id,
			name: input.name,
			grade: input.grade ?? null,
			points: 0,
			created_at: now(),
			updated_at: now()
		});
	}

	update(studentId: string, input: UpdateStudentInput) {
		return this.patch(studentId, { ...input, updated_at: now() });
	}

	addPoints(studentId: string, points: number, currentPoints: number) {
		return this.patch(studentId, { points: currentPoints + points, updated_at: now() });
	}

	remove(studentId: string) {
		return this.destroy(studentId);
	}
}

export const studentService = new StudentService();
