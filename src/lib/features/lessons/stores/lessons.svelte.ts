import { getErrorMessage } from '$lib/core/errors';
import type { Lesson, StudentProgress } from '$lib/types/domain/lesson';
import { studentsStore } from '$lib/features/students';
import { lessonService } from '../services/lessons';
import type { CreateLessonInput, UpdateLessonInput } from '../types';

/** Global lesson catalog, plus per-student progress loaded on demand. */
export class LessonsStore {
	items = $state<Lesson[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);
	loaded = $state(false);

	/** Completed lesson ids, keyed by student id. */
	progressByStudent = $state<Record<string, StudentProgress[]>>({});

	async load() {
		this.loading = true;
		this.error = null;
		try {
			this.items = await lessonService.list();
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

	async create(input: CreateLessonInput) {
		const created = await lessonService.create(input);
		this.items = [...this.items, created].sort((a, b) => a.order_index - b.order_index);
		return created;
	}

	async update(id: string, input: UpdateLessonInput) {
		const updated = await lessonService.update(id, input);
		this.items = this.items.map((lesson) => (lesson.id === id ? updated : lesson));
		return updated;
	}

	async remove(id: string) {
		await lessonService.remove(id);
		this.items = this.items.filter((lesson) => lesson.id !== id);
	}

	async loadProgressForStudent(studentId: string) {
		const progress = await lessonService.listProgressByStudent(studentId);
		this.progressByStudent = { ...this.progressByStudent, [studentId]: progress };
		return progress;
	}

	isCompleted(studentId: string, lessonId: string): boolean {
		return (this.progressByStudent[studentId] ?? []).some((p) => p.lesson_id === lessonId);
	}

	/** Marks a lesson as complete for a student and awards its points. */
	async completeForStudent(studentId: string, lesson: Lesson) {
		const progress = await lessonService.completeForStudent(studentId, lesson.id, lesson.points_reward);
		this.progressByStudent = {
			...this.progressByStudent,
			[studentId]: [...(this.progressByStudent[studentId] ?? []), progress]
		};
		await studentsStore.addPoints(studentId, lesson.points_reward);
		return progress;
	}
}

export const lessonsStore = new LessonsStore();
