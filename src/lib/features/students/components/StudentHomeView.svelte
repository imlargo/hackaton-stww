<script lang="ts">
	import { LineChart } from 'layerchart';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import { BadgeGrid } from '$lib/components/domain';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { studentsStore } from '$lib/features/students';
	import { schoolsStore } from '$lib/features/schools';
	import { lessonsStore } from '$lib/features/lessons';
	import { animalsStore } from '$lib/features/animals';
	import { minigranjaStore } from '$lib/features/minigranja';
	import StudentSwitcher from './StudentSwitcher.svelte';
	import StudentOnboardingCard from './StudentOnboardingCard.svelte';
	import StudentProgressCard from './StudentProgressCard.svelte';
	import StudentLessonCard from './StudentLessonCard.svelte';
	import StudentActivitiesGrid from './StudentActivitiesGrid.svelte';
	import StudentScoreboard from './StudentScoreboard.svelte';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import UsersIcon from '@lucide/svelte/icons/users';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import GamepadIcon from '@lucide/svelte/icons/gamepad-2';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';

	let selectedStudentId = $state<string | null>(null);

	const isLoading = $derived(
		!studentsStore.loaded || !schoolsStore.loaded || !lessonsStore.loaded || !animalsStore.loaded
	);

	/** Explicit selection wins; otherwise default to the first student once loaded. */
	const effectiveStudentId = $derived(selectedStudentId ?? studentsStore.items[0]?.id ?? null);
	const student = $derived(effectiveStudentId ? studentsStore.byId(effectiveStudentId) : null);
	const school = $derived(student ? schoolsStore.byId(student.school_id) : null);
	const schoolmates = $derived(student ? studentsStore.bySchool(student.school_id) : []);
	const completedProgress = $derived(
		student ? (lessonsStore.progressByStudent[student.id] ?? []) : []
	);
	const completedLessonIds = $derived(new Set(completedProgress.map((p) => p.lesson_id)));
	const lessonsWithAnimal = $derived(
		lessonsStore.items.map((lesson) => ({
			lesson,
			animal: lesson.animal_id ? animalsStore.byId(lesson.animal_id) : null,
			completed: completedLessonIds.has(lesson.id)
		}))
	);

	const masteredAnimalIds = $derived(
		new Set(
			completedProgress
				.map((p) => lessonsStore.items.find((l) => l.id === p.lesson_id)?.animal_id)
				.filter((id): id is string => Boolean(id))
		)
	);

	const schoolRank = $derived(
		student
			? [...schoolmates].sort((a, b) => b.points - a.points).findIndex((s) => s.id === student.id) + 1
			: null
	);

	const gamificationStats = $derived({
		points: student?.points ?? 0,
		lessonsCompleted: completedLessonIds.size,
		lessonsTotal: lessonsStore.items.length,
		animalsMastered: masteredAnimalIds.size,
		animalsTotal: animalsStore.items.length,
		minigranjaCompleted: student ? (minigranjaStore.forStudent(student.id)?.completed ?? false) : false,
		schoolRank
	});

	const pointsTrend = $derived.by(() => {
		const points = student?.points ?? 0;
		const step = points / 5;
		return Array.from({ length: 5 }, (_, i) => ({
			week: `Semana ${i + 1}`,
			puntos: Math.round(step * (i + 1))
		}));
	});
	const pointsTrendConfig = { puntos: { label: 'Puntos', color: 'var(--chart-1)' } } satisfies Chart.ChartConfig;

	$effect(() => {
		studentsStore.ensureLoaded();
		schoolsStore.ensureLoaded();
		lessonsStore.ensureLoaded();
		animalsStore.ensureLoaded();
	});

	$effect(() => {
		if (student) {
			lessonsStore.loadProgressForStudent(student.id);
			minigranjaStore.ensureLoaded(student.id);
		}
	});

	function completeLesson(lessonId: string) {
		if (!student) return;
		const lesson = lessonsStore.items.find((l) => l.id === lessonId);
		if (!lesson) return;
		lessonsStore.completeForStudent(student.id, lesson);
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title={student ? `¡Hola, ${student.name}!` : 'Estudiante'}
		description="Tu progreso, tus lecciones y el scoreboard de tu colegio."
	>
		{#snippet actions()}
			{#if studentsStore.items.length > 0}
				<StudentSwitcher
					students={studentsStore.items}
					value={effectiveStudentId}
					onchange={(id) => (selectedStudentId = id)}
				/>
			{/if}
		{/snippet}
	</PageHeader>

	{#if isLoading}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else if !student || !school}
		<EmptyState
			title="Aún no hay estudiantes registrados"
			description="Inscribe estudiantes desde el dashboard del colegio."
		>
			{#snippet icon()}
				<UsersIcon class="size-5" />
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			<StudentOnboardingCard {school} />
			<StudentProgressCard
				{student}
				lessonsCompleted={completedLessonIds.size}
				lessonsTotal={lessonsStore.items.length}
			/>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><TrophyIcon class="size-4" /> Tus insignias</Card.Title>
				<Card.Description>Logros desbloqueados jugando y aprendiendo.</Card.Description>
			</Card.Header>
			<Card.Content>
				<BadgeGrid stats={gamificationStats} />
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><TrendingUpIcon class="size-4" /> Tu avance de puntos</Card.Title>
				<Card.Description>Cómo has ido acumulando puntos.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={pointsTrendConfig} class="h-48 w-full">
					<LineChart
						data={pointsTrend}
						x="week"
						axis="x"
						series={[{ key: 'puntos', label: 'Puntos', color: pointsTrendConfig.puntos.color }]}
						props={{ spline: { strokeWidth: 2 } }}
					>
						{#snippet tooltip()}
							<Chart.Tooltip />
						{/snippet}
					</LineChart>
				</Chart.Container>
			</Card.Content>
		</Card.Root>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<BookOpenIcon class="size-4 text-muted-foreground" />
				<h2 class="text-lg font-semibold tracking-tight">Lecciones</h2>
			</div>
			{#if lessonsWithAnimal.length === 0}
				<EmptyState
					title="Aún no hay lecciones"
					description="Unergy todavía no ha publicado contenido."
				>
					{#snippet icon()}
						<BookOpenIcon class="size-5" />
					{/snippet}
				</EmptyState>
			{:else}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each lessonsWithAnimal as { lesson, animal, completed } (lesson.id)}
						<StudentLessonCard
							{lesson}
							{animal}
							{completed}
							oncomplete={() => completeLesson(lesson.id)}
						/>
					{/each}
				</div>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-2">
				<GamepadIcon class="size-4 text-muted-foreground" />
				<h2 class="text-lg font-semibold tracking-tight">Juegos y actividades</h2>
			</div>
			<StudentActivitiesGrid studentId={student.id} />
		</div>

		<StudentScoreboard students={schoolmates} currentStudentId={student.id} />
	{/if}
</div>
