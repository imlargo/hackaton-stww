<script lang="ts">
	import { onMount } from 'svelte';
	import { studentsStore } from '$lib/features/students';
	import { schoolsStore } from '$lib/features/schools';
	import { lessonsStore } from '$lib/features/lessons';
	import { animalsStore } from '$lib/features/animals';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import CheckIcon from '@lucide/svelte/icons/check';
	import TrophyIcon from '@lucide/svelte/icons/trophy';

	let selectedStudentId = $state('');
	let completing = $state<string | null>(null);

	onMount(() => {
		studentsStore.ensureLoaded();
		schoolsStore.ensureLoaded();
		lessonsStore.ensureLoaded();
		animalsStore.ensureLoaded();
	});

	$effect(() => {
		if (!selectedStudentId && studentsStore.items.length > 0) {
			selectedStudentId = studentsStore.items[0].id;
		}
	});

	$effect(() => {
		if (selectedStudentId) lessonsStore.loadProgressForStudent(selectedStudentId);
	});

	const student = $derived(selectedStudentId ? studentsStore.byId(selectedStudentId) : null);
	const school = $derived(student ? schoolsStore.byId(student.school_id) : null);
	const classmates = $derived(student ? studentsStore.bySchool(student.school_id) : []);
	const scoreboard = $derived([...classmates].sort((a, b) => b.points - a.points));
	const completedCount = $derived(
		selectedStudentId ? lessonsStore.items.filter((l) => lessonsStore.isCompleted(selectedStudentId, l.id)).length : 0
	);

	function animalName(animalId: string | null): string | null {
		if (!animalId) return null;
		return animalsStore.byId(animalId)?.common_name ?? null;
	}

	async function markComplete(lessonId: string) {
		if (!selectedStudentId) return;
		const lesson = lessonsStore.items.find((l) => l.id === lessonId);
		if (!lesson) return;
		completing = lessonId;
		try {
			await lessonsStore.completeForStudent(selectedStudentId, lesson);
		} finally {
			completing = null;
		}
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Estudiante"
		description="Onboarding, progreso, lecciones, juegos y el scoreboard de tu colegio."
	/>

	{#if studentsStore.loading && studentsStore.items.length === 0}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else if studentsStore.items.length === 0}
		<EmptyState title="No hay estudiantes inscritos" description="Inscribe estudiantes desde la vista Colegio.">
			{#snippet icon()}
				<GraduationCapIcon class="size-5" />
			{/snippet}
		</EmptyState>
	{:else}
		<Card.Root>
			<Card.Content class="flex flex-col gap-1.5 sm:max-w-xs">
				<label class="text-sm font-medium" for="student-picker">Estás conectado como</label>
				<NativeSelect id="student-picker" bind:value={selectedStudentId}>
					{#each studentsStore.items as s (s.id)}
						<option value={s.id}>{s.name}</option>
					{/each}
				</NativeSelect>
			</Card.Content>
		</Card.Root>

		{#if student}
			<Card.Root>
				<Card.Header>
					<Card.Title>¡Hola, {student.name}!</Card.Title>
					<Card.Description>
						{student.grade ? `Grado ${student.grade} · ` : ''}{school?.name ?? 'Tu colegio'}
					</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4 sm:grid-cols-3">
					<div class="flex flex-col gap-1 rounded-lg border p-3">
						<span class="text-xs text-muted-foreground">Puntos</span>
						<span class="text-2xl font-bold">{student.points}</span>
					</div>
					<div class="flex flex-col gap-1 rounded-lg border p-3">
						<span class="text-xs text-muted-foreground">Lecciones completadas</span>
						<span class="text-2xl font-bold">{completedCount}/{lessonsStore.items.length}</span>
					</div>
					<div class="flex flex-col gap-1 rounded-lg border p-3">
						<span class="text-xs text-muted-foreground">Puesto en tu colegio</span>
						<span class="text-2xl font-bold">
							#{scoreboard.findIndex((s) => s.id === student.id) + 1}
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Lecciones</Card.Title>
					<Card.Description>Aprende y gana puntos para desbloquear la visita a la minigranja.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-3 sm:grid-cols-2">
					{#each lessonsStore.items as lesson (lesson.id)}
						{@const done = lessonsStore.isCompleted(student.id, lesson.id)}
						<div class="flex flex-col gap-2 rounded-lg border p-3">
							<div class="flex items-start justify-between gap-2">
								<span class="font-medium">{lesson.title}</span>
								<Badge variant="secondary">{lesson.points_reward} pts</Badge>
							</div>
							{#if lesson.description}
								<p class="text-sm text-muted-foreground">{lesson.description}</p>
							{/if}
							{#if animalName(lesson.animal_id)}
								<Badge variant="outline" class="w-fit">{animalName(lesson.animal_id)}</Badge>
							{/if}
							<Button
								size="sm"
								class="mt-1 w-fit"
								variant={done ? 'outline' : 'default'}
								disabled={done || completing === lesson.id}
								onclick={() => markComplete(lesson.id)}
							>
								{#if done}
									<CheckIcon />
									Completada
								{:else}
									Marcar completada
								{/if}
							</Button>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2"><TrophyIcon class="size-4" /> Scoreboard de {school?.name ?? 'tu colegio'}</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">
					{#each scoreboard as s, index (s.id)}
						<div class="flex items-center justify-between rounded-lg border p-2.5 {s.id === student.id ? 'border-primary bg-primary/5' : ''}">
							<span class="text-sm font-medium">#{index + 1} {s.name}</span>
							<Badge>{s.points} pts</Badge>
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
