<script lang="ts">
	import { onMount } from 'svelte';
	import { schoolsStore } from '$lib/features/schools';
	import { studentsStore } from '$lib/features/students';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	let showSchoolForm = $state(false);
	let schoolName = $state('');
	let schoolCity = $state('');
	let contactName = $state('');
	let contactEmail = $state('');
	let savingSchool = $state(false);

	let selectedSchoolId = $state('');
	let showStudentForm = $state(false);
	let studentName = $state('');
	let studentGrade = $state('');
	let savingStudent = $state(false);

	onMount(() => {
		schoolsStore.ensureLoaded();
		studentsStore.ensureLoaded();
	});

	$effect(() => {
		if (!selectedSchoolId && schoolsStore.items.length > 0) {
			selectedSchoolId = schoolsStore.items[0].id;
		}
	});

	const roster = $derived(selectedSchoolId ? studentsStore.bySchool(selectedSchoolId) : []);
	const totalPoints = $derived(roster.reduce((sum, s) => sum + s.points, 0));

	async function submitSchool(event: Event) {
		event.preventDefault();
		if (!schoolName.trim()) return;
		savingSchool = true;
		try {
			const created = await schoolsStore.create({
				name: schoolName.trim(),
				city: schoolCity.trim() || undefined,
				contact_name: contactName.trim() || undefined,
				contact_email: contactEmail.trim() || undefined
			});
			selectedSchoolId = created.id;
			schoolName = '';
			schoolCity = '';
			contactName = '';
			contactEmail = '';
			showSchoolForm = false;
		} finally {
			savingSchool = false;
		}
	}

	async function submitStudent(event: Event) {
		event.preventDefault();
		if (!studentName.trim() || !selectedSchoolId) return;
		savingStudent = true;
		try {
			await studentsStore.create({
				school_id: selectedSchoolId,
				name: studentName.trim(),
				grade: studentGrade.trim() || undefined
			});
			studentName = '';
			studentGrade = '';
			showStudentForm = false;
		} finally {
			savingStudent = false;
		}
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Colegio"
		description="Registra el colegio, inscribe estudiantes y sigue su progreso y gamificación."
	>
		{#snippet actions()}
			<Button size="sm" variant="outline" onclick={() => (showSchoolForm = !showSchoolForm)}>
				<PlusIcon />
				Registrar colegio
			</Button>
		{/snippet}
	</PageHeader>

	{#if showSchoolForm}
		<Card.Root>
			<Card.Header>
				<Card.Title>Nuevo colegio</Card.Title>
			</Card.Header>
			<Card.Content>
				<form class="grid gap-3 sm:grid-cols-2" onsubmit={submitSchool}>
					<div class="flex flex-col gap-1.5 sm:col-span-2">
						<label class="text-sm font-medium" for="school-name">Nombre del colegio</label>
						<Input id="school-name" bind:value={schoolName} placeholder="Institución Educativa..." required />
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" for="school-city">Ciudad</label>
						<Input id="school-city" bind:value={schoolCity} placeholder="Cali" />
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" for="school-contact">Contacto</label>
						<Input id="school-contact" bind:value={contactName} placeholder="Nombre del rector/a" />
					</div>
					<div class="flex flex-col gap-1.5 sm:col-span-2">
						<label class="text-sm font-medium" for="school-email">Correo de contacto</label>
						<Input id="school-email" type="email" bind:value={contactEmail} placeholder="contacto@colegio.edu.co" />
					</div>
					<div class="flex justify-end gap-2 sm:col-span-2">
						<Button type="button" variant="outline" onclick={() => (showSchoolForm = false)}>Cancelar</Button>
						<Button type="submit" disabled={savingSchool}>Guardar</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if schoolsStore.loading && schoolsStore.items.length === 0}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else if schoolsStore.items.length === 0}
		<EmptyState title="No hay colegios registrados" description="Registra tu colegio para empezar.">
			{#snippet icon()}
				<SchoolIcon class="size-5" />
			{/snippet}
		</EmptyState>
	{:else}
		<Card.Root>
			<Card.Content class="flex flex-col gap-1.5 sm:max-w-xs">
				<label class="text-sm font-medium" for="school-picker">Colegio</label>
				<NativeSelect id="school-picker" bind:value={selectedSchoolId}>
					{#each schoolsStore.items as school (school.id)}
						<option value={school.id}>{school.name}</option>
					{/each}
				</NativeSelect>
			</Card.Content>
		</Card.Root>

		<section class="grid gap-4 sm:grid-cols-3">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Estudiantes inscritos</Card.Title>
				</Card.Header>
				<Card.Content><div class="text-2xl font-bold">{roster.length}</div></Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Puntos acumulados</Card.Title>
				</Card.Header>
				<Card.Content><div class="text-2xl font-bold">{totalPoints}</div></Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Promedio por estudiante</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{roster.length ? Math.round(totalPoints / roster.length) : 0}</div>
				</Card.Content>
			</Card.Root>
		</section>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title>Estudiantes</Card.Title>
					<Card.Description>Progreso y gamificación del colegio seleccionado.</Card.Description>
				</div>
				<Button size="sm" onclick={() => (showStudentForm = !showStudentForm)}>
					<PlusIcon />
					Inscribir estudiante
				</Button>
			</Card.Header>
			<Card.Content class="flex flex-col gap-4">
				{#if showStudentForm}
					<form class="grid gap-3 rounded-lg border p-3 sm:grid-cols-3" onsubmit={submitStudent}>
						<div class="flex flex-col gap-1.5 sm:col-span-2">
							<label class="text-sm font-medium" for="student-name">Nombre</label>
							<Input id="student-name" bind:value={studentName} placeholder="Nombre del estudiante" required />
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-sm font-medium" for="student-grade">Grado</label>
							<Input id="student-grade" bind:value={studentGrade} placeholder="5°" />
						</div>
						<div class="flex justify-end gap-2 sm:col-span-3">
							<Button type="button" variant="outline" onclick={() => (showStudentForm = false)}>Cancelar</Button>
							<Button type="submit" disabled={savingStudent}>Guardar</Button>
						</div>
					</form>
				{/if}

				{#if roster.length === 0}
					<p class="py-8 text-center text-sm text-muted-foreground">
						Este colegio todavía no tiene estudiantes inscritos.
					</p>
				{:else}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Estudiante</Table.Head>
								<Table.Head>Grado</Table.Head>
								<Table.Head>Puntos</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each [...roster].sort((a, b) => b.points - a.points) as student (student.id)}
								<Table.Row>
									<Table.Cell class="font-medium">{student.name}</Table.Cell>
									<Table.Cell>{student.grade ?? '—'}</Table.Cell>
									<Table.Cell><Badge>{student.points} pts</Badge></Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
