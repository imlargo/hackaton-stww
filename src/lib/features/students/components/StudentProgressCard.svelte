<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { LevelBadge } from '$lib/components/domain';
	import type { Student } from '$lib/types/domain/student';
	import { GAMIFICATION, getLevelProgress } from '$lib/config';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';

	let {
		student,
		lessonsCompleted,
		lessonsTotal
	}: {
		student: Student;
		lessonsCompleted: number;
		lessonsTotal: number;
	} = $props();

	const goal = GAMIFICATION.visitPointsGoal;
	const levelProgress = $derived(getLevelProgress(student.points));
	const pointsToGoal = $derived(Math.max(goal - student.points, 0));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2 text-muted-foreground">
				<SparklesIcon class="size-4" />
				<Card.Description>Tu progreso</Card.Description>
			</div>
			<LevelBadge level={levelProgress.level} />
		</div>
		<Card.Title class="text-lg">{student.points} puntos</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between text-xs text-muted-foreground">
				<span>Nivel {levelProgress.level.name}</span>
				<span>{levelProgress.next ? `Faltan ${levelProgress.pointsToNext} pts para ${levelProgress.next.name}` : 'Nivel máximo'}</span>
			</div>
			<Progress value={levelProgress.percent} />
		</div>
		<div class="flex flex-col gap-1.5 rounded-lg border p-2.5">
			<div class="flex items-center justify-between text-xs text-muted-foreground">
				<span>Puntos para la visita</span>
				<span>{student.points} / {goal}</span>
			</div>
			<Progress value={Math.min(100, Math.round((student.points / goal) * 100))} />
			{#if pointsToGoal > 0}
				<p class="text-xs text-muted-foreground">
					Te faltan {pointsToGoal} puntos para desbloquear la visita a la minigranja.
				</p>
			{:else}
				<p class="flex items-center gap-1 text-xs font-medium text-primary">
					<CalendarCheckIcon class="size-3.5" />
					¡Ya puedes solicitar la visita!
				</p>
			{/if}
		</div>
		<p class="text-sm text-muted-foreground">
			Lecciones completadas: <span class="font-medium text-foreground">{lessonsCompleted} / {lessonsTotal}</span>
		</p>
	</Card.Content>
</Card.Root>
