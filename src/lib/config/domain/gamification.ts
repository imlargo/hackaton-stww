// GAMIFICACIÓN — niveles, insignias y reglas de puntos del home del estudiante.
// Ver requerimientos.md: "ganar puntos para acceder a la visita" y "Gamificación"
// en el dashboard del colegio. Todo es contenido/reglas de negocio, sin datos mockeados.
import SproutIcon from '@lucide/svelte/icons/sprout';
import LeafIcon from '@lucide/svelte/icons/leaf';
import ShieldIcon from '@lucide/svelte/icons/shield';
import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
import CrownIcon from '@lucide/svelte/icons/crown';
import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';
import HammerIcon from '@lucide/svelte/icons/hammer';
import MedalIcon from '@lucide/svelte/icons/medal';
import FlameIcon from '@lucide/svelte/icons/flame';
import PawPrintIcon from '@lucide/svelte/icons/paw-print';
import StarIcon from '@lucide/svelte/icons/star';
import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';

export const GAMIFICATION = {
	/** Puntos requeridos para desbloquear la solicitud de visita a la minigranja. */
	visitPointsGoal: 150
} as const;

export interface GamificationLevel {
	id: string;
	name: string;
	minPoints: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	colorClass: string;
	badgeClass: string;
}

// ─── Niveles ────────────────────────────────────────────────────────────────
// El nivel "Guardián de la Granja" coincide con la meta de puntos para la visita.
export const LEVELS: GamificationLevel[] = [
	{
		id: 'semilla',
		name: 'Semilla',
		minPoints: 0,
		icon: SproutIcon,
		colorClass: 'text-emerald-600 dark:text-emerald-400',
		badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
	},
	{
		id: 'brote',
		name: 'Brote',
		minPoints: 50,
		icon: LeafIcon,
		colorClass: 'text-lime-600 dark:text-lime-400',
		badgeClass: 'bg-lime-500/10 text-lime-700 dark:text-lime-300'
	},
	{
		id: 'guardian-junior',
		name: 'Guardián Junior',
		minPoints: 100,
		icon: ShieldIcon,
		colorClass: 'text-sky-600 dark:text-sky-400',
		badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
	},
	{
		id: 'guardian-granja',
		name: 'Guardián de la Granja',
		minPoints: GAMIFICATION.visitPointsGoal,
		icon: ShieldCheckIcon,
		colorClass: 'text-violet-600 dark:text-violet-400',
		badgeClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
	},
	{
		id: 'guardian-estrella',
		name: 'Guardián Estrella',
		minPoints: 250,
		icon: StarIcon,
		colorClass: 'text-amber-600 dark:text-amber-400',
		badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
	},
	{
		id: 'leyenda',
		name: 'Leyenda Unergy',
		minPoints: 400,
		icon: CrownIcon,
		colorClass: 'text-rose-600 dark:text-rose-400',
		badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
	}
];

export function getLevel(points: number): GamificationLevel {
	let current = LEVELS[0];
	for (const level of LEVELS) {
		if (points >= level.minPoints) current = level;
	}
	return current;
}

export function getNextLevel(points: number): GamificationLevel | null {
	return LEVELS.find((level) => level.minPoints > points) ?? null;
}

export interface LevelProgress {
	level: GamificationLevel;
	next: GamificationLevel | null;
	percent: number;
	pointsToNext: number;
}

export function getLevelProgress(points: number): LevelProgress {
	const level = getLevel(points);
	const next = getNextLevel(points);
	if (!next) return { level, next: null, percent: 100, pointsToNext: 0 };
	const span = next.minPoints - level.minPoints;
	const percent = span > 0 ? Math.min(100, Math.round(((points - level.minPoints) / span) * 100)) : 100;
	return { level, next, percent, pointsToNext: Math.max(0, next.minPoints - points) };
}

// ─── Insignias ──────────────────────────────────────────────────────────────
export interface GamificationStats {
	points: number;
	lessonsCompleted: number;
	lessonsTotal: number;
	animalsMastered: number;
	animalsTotal: number;
	minigranjaCompleted: boolean;
	schoolRank: number | null;
}

export interface GamificationBadge {
	id: string;
	name: string;
	description: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon: any;
	isUnlocked: (stats: GamificationStats) => boolean;
}

export const BADGES: GamificationBadge[] = [
	{
		id: 'primeros-pasos',
		name: 'Primeros pasos',
		description: 'Completa tu primera lección.',
		icon: BookOpenCheckIcon,
		isUnlocked: (s) => s.lessonsCompleted >= 1
	},
	{
		id: 'estudioso',
		name: 'Estudioso',
		description: 'Completa todas las lecciones disponibles.',
		icon: MedalIcon,
		isUnlocked: (s) => s.lessonsTotal > 0 && s.lessonsCompleted >= s.lessonsTotal
	},
	{
		id: 'coleccionista',
		name: 'Coleccionista de especies',
		description: 'Aprende a cuidar todas las especies de la minigranja.',
		icon: PawPrintIcon,
		isUnlocked: (s) => s.animalsTotal > 0 && s.animalsMastered >= s.animalsTotal
	},
	{
		id: 'racha',
		name: 'En racha',
		description: 'Acumula 100 puntos o más.',
		icon: FlameIcon,
		isUnlocked: (s) => s.points >= 100
	},
	{
		id: 'arquitecto',
		name: 'Arquitecto de la minigranja',
		description: 'Termina de construir tu minigranja en el juego.',
		icon: HammerIcon,
		isUnlocked: (s) => s.minigranjaCompleted
	},
	{
		id: 'meta-visita',
		name: 'Meta cumplida',
		description: `Llega a ${GAMIFICATION.visitPointsGoal} puntos y desbloquea la visita.`,
		icon: CalendarCheckIcon,
		isUnlocked: (s) => s.points >= GAMIFICATION.visitPointsGoal
	},
	{
		id: 'top-3',
		name: 'Top 3 del colegio',
		description: 'Ubícate entre los 3 mejores de tu colegio.',
		icon: CrownIcon,
		isUnlocked: (s) => s.schoolRank !== null && s.schoolRank <= 3
	}
];

export function getBadgeStates(stats: GamificationStats) {
	return BADGES.map((badge) => ({ badge, unlocked: badge.isUnlocked(stats) }));
}
