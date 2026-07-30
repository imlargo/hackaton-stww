import { MINIGRANJA_GAME } from '$lib/config/domain/minigranja';
import type { MinigranjaState } from '$lib/types/domain/minigranja';
import { studentsStore } from '$lib/features/students';
import { minigranjaService } from '../services/minigranja';

/** Estado del juego "Construye tu minigranja", por estudiante. */
export class MinigranjaStore {
	states = $state<Record<string, MinigranjaState>>({});
	private loadingFor = $state<Record<string, boolean>>({});

	async ensureLoaded(studentId: string) {
		if (this.states[studentId] || this.loadingFor[studentId]) return;
		this.loadingFor = { ...this.loadingFor, [studentId]: true };
		try {
			this.states = { ...this.states, [studentId]: await minigranjaService.get(studentId) };
		} finally {
			this.loadingFor = { ...this.loadingFor, [studentId]: false };
		}
	}

	forStudent(studentId: string): MinigranjaState | null {
		return this.states[studentId] ?? null;
	}

	async setPlot(studentId: string, plotId: number, animalId: string | null) {
		const wasCompleted = this.states[studentId]?.completed ?? false;
		const updated = await minigranjaService.setPlot(studentId, plotId, animalId);
		this.states = { ...this.states, [studentId]: updated };
		if (updated.completed && !wasCompleted) {
			await studentsStore.addPoints(studentId, MINIGRANJA_GAME.bonusPoints);
			return { state: updated, justCompleted: true };
		}
		return { state: updated, justCompleted: false };
	}

	async reset(studentId: string) {
		this.states = { ...this.states, [studentId]: await minigranjaService.reset(studentId) };
	}
}

export const minigranjaStore = new MinigranjaStore();
