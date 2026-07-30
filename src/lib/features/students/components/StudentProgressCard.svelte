<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import type { Student } from '$lib/types/domain/student';
	import { GAMIFICATION } from '$lib/config';
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
	const progressPercent = $derived(Math.min(100, Math.round((student.points / goal) * 100)));
	const pointsToGoal = $derived(Math.max(goal - student.points, 0));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2 text-muted-foreground">
			<SparklesIcon class="size-4" />
			<Card.Description>Tu progreso</Card.Description>
		</div>
		<Card.Title class="text-lg">{student.points} puntos</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<div class="flex items-center justify-between text-xs text-muted-foreground">
				<span>Puntos para la visita</span>
				<span>{student.points} / {goal}</span>
			</div>
			<Progress value={progressPercent} />
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
			Lecciones completadas: <span class="font-medium text-foreground"
				>{lessonsCompleted} / {lessonsTotal}</span
			>
		</p>
	</Card.Content>
</Card.Root>
