import { getErrorMessage } from '$lib/core/errors';
import type { Student } from '$lib/types/domain/student';
import { studentService } from '../services/students';
import type { CreateStudentInput, UpdateStudentInput } from '../types';

/** Global reactive list of students — used for rosters, progress and scoreboards. */
export class StudentsStore {
	items = $state<Student[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	readonly scoreboard = $derived([...this.items].sort((a, b) => b.points - a.points));

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await studentService.list();
			this.loaded = true;
		} catch (err) {
			this.error = getErrorMessage(err);
		} finally {
			this.loading = false;
		}
	}

	async ensureLoaded() {
		if (!this.loaded && !this.loading) await this.load();
	}

	async create(input: CreateStudentInput) {
		const created = await studentService.create(input);
		this.items = [created, ...this.items];
		return created;
	}

	async update(id: string, input: UpdateStudentInput) {
		const updated = await studentService.update(id, input);
		this.items = this.items.map((student) => (student.id === id ? updated : student));
		return updated;
	}

	async addPoints(id: string, points: number) {
		const current = this.byId(id);
		if (!current) return;
		const updated = await studentService.addPoints(id, points, current.points);
		this.items = this.items.map((student) => (student.id === id ? updated : student));
		return updated;
	}

	async remove(id: string) {
		await studentService.remove(id);
		this.items = this.items.filter((student) => student.id !== id);
	}

	byId(id: string) {
		return this.items.find((student) => student.id === id) ?? null;
	}

	bySchool(schoolId: string) {
		return this.items.filter((student) => student.school_id === schoolId);
	}
}

export const studentsStore = new StudentsStore();
