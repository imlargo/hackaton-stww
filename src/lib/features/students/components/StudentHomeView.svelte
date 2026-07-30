<script lang="ts">
	import { PageHeader, EmptyState } from '$lib/components/common';
	import { studentsStore } from '$lib/features/students';
	import { schoolsStore } from '$lib/features/schools';
	import { lessonsStore } from '$lib/features/lessons';
	import { animalsStore } from '$lib/features/animals';
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

	$effect(() => {
		studentsStore.ensureLoaded();
		schoolsStore.ensureLoaded();
		lessonsStore.ensureLoaded();
		animalsStore.ensureLoaded();
	});

	$effect(() => {
		if (student) lessonsStore.loadProgressForStudent(student.id);
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
			<StudentActivitiesGrid />
		</div>

		<StudentScoreboard students={schoolmates} currentStudentId={student.id} />
	{/if}
</div>
