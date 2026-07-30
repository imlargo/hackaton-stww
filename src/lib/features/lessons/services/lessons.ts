import { MockService, id, now } from '$lib/core/mock-service';
import type { Lesson, StudentProgress } from '$lib/types/domain/lesson';
import { SEED_ANIMAL_IDS } from '$lib/features/animals/services/animals';
import type { CreateLessonInput, UpdateLessonInput } from '../types';

const SEED: Lesson[] = [
	{
		id: id(),
		title: 'Cuidados básicos de la gallina',
		description: 'Aprende qué comen, dónde duermen y cómo mantenerlas sanas.',
		content: 'Las gallinas necesitan un gallinero limpio, agua fresca todos los días y alimento balanceado.',
		animal_id: SEED_ANIMAL_IDS.gallina,
		points_reward: 10,
		order_index: 0,
		created_at: now()
	},
	{
		id: id(),
		title: 'El hogar del conejo',
		description: 'Cómo construir y mantener una conejera adecuada.',
		content: 'Los conejos necesitan espacio ventilado, heno siempre disponible y protección del sol directo.',
		animal_id: SEED_ANIMAL_IDS.conejo,
		points_reward: 10,
		order_index: 1,
		created_at: now()
	},
	{
		id: id(),
		title: '¿Qué es una caracterización?',
		description: 'Por qué se estudia el terreno y los recursos antes de construir la minigranja.',
		content: 'Antes de construir, se revisa el espacio disponible, el clima y los recursos de la comunidad.',
		animal_id: null,
		points_reward: 15,
		order_index: 2,
		created_at: now()
	}
];

export class LessonService extends MockService<Lesson> {
	private progress: StudentProgress[] = [];

	constructor() {
		super(SEED);
	}

	async list() {
		const all = await this.findAll();
		return [...all].sort((a, b) => a.order_index - b.order_index);
	}

	create(input: CreateLessonInput) {
		return this.insert({
			id: id(),
			title: input.title,
			description: input.description ?? null,
			content: input.content ?? null,
			animal_id: input.animal_id ?? null,
			points_reward: input.points_reward ?? 10,
			order_index: input.order_index ?? this.items.length,
			created_at: now()
		});
	}

	update(lessonId: string, input: UpdateLessonInput) {
		return this.patch(lessonId, input);
	}

	remove(lessonId: string) {
		return this.destroy(lessonId);
	}

	async listProgressByStudent(studentId: string): Promise<StudentProgress[]> {
		return this.progress.filter((p) => p.student_id === studentId);
	}

	async completeForStudent(
		studentId: string,
		lessonId: string,
		pointsEarned: number
	): Promise<StudentProgress> {
		if (this.progress.some((p) => p.student_id === studentId && p.lesson_id === lessonId)) {
			throw new Error('Lesson already completed by this student.');
		}
		const entry: StudentProgress = {
			id: id(),
			student_id: studentId,
			lesson_id: lessonId,
			points_earned: pointsEarned,
			completed_at: now()
		};
		this.progress = [...this.progress, entry];
		return entry;
	}
}

export const lessonService = new LessonService();
