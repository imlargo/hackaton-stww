import { MINIGRANJA_GAME } from '$lib/config/domain/minigranja';
import type { MinigranjaPlot, MinigranjaState } from '$lib/types/domain/minigranja';

function emptyPlots(): MinigranjaPlot[] {
	return Array.from({ length: MINIGRANJA_GAME.plotCount }, (_, index) => ({
		id: index,
		animal_id: null
	}));
}

/**
 * In-memory per-student game state. Not a MockService (keyed by student_id,
 * not a row id) but follows the same "mocked, no backend" spirit.
 */
export class MinigranjaService {
	private states = new Map<string, MinigranjaState>();

	private ensure(studentId: string): MinigranjaState {
		let state = this.states.get(studentId);
		if (!state) {
			state = {
				student_id: studentId,
				plots: emptyPlots(),
				completed: false,
				updated_at: new Date().toISOString()
			};
			this.states.set(studentId, state);
		}
		return state;
	}

	async get(studentId: string): Promise<MinigranjaState> {
		const state = this.ensure(studentId);
		return { ...state, plots: state.plots.map((plot) => ({ ...plot })) };
	}

	async setPlot(studentId: string, plotId: number, animalId: string | null): Promise<MinigranjaState> {
		const state = this.ensure(studentId);
		const plots = state.plots.map((plot) =>
			plot.id === plotId ? { ...plot, animal_id: animalId } : plot
		);
		const completed = plots.every((plot) => plot.animal_id !== null);
		const updated: MinigranjaState = {
			...state,
			plots,
			completed,
			updated_at: new Date().toISOString()
		};
		this.states.set(studentId, updated);
		return { ...updated, plots: updated.plots.map((plot) => ({ ...plot })) };
	}

	async reset(studentId: string): Promise<MinigranjaState> {
		const state: MinigranjaState = {
			student_id: studentId,
			plots: emptyPlots(),
			completed: false,
			updated_at: new Date().toISOString()
		};
		this.states.set(studentId, state);
		return state;
	}
}

export const minigranjaService = new MinigranjaService();
