<script lang="ts">
	import { onMount } from 'svelte';
	import { schoolsStore } from '$lib/features/schools';
	import { studentsStore } from '$lib/features/students';
	import { lessonsStore } from '$lib/features/lessons';
	import { animalsStore } from '$lib/features/animals';
	import { prospectsStore } from '$lib/features/prospects';
	import { visitsStore } from '$lib/features/visits';
	import { PageHeader } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import HandshakeIcon from '@lucide/svelte/icons/handshake';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { ProspectStatus } from '$lib/types/domain/prospect';

	const PROSPECT_LABELS: Record<ProspectStatus, string> = {
		new: 'Nuevo',
		contacted: 'Contactado',
		visit_scheduled: 'Visita agendada',
		won: 'Ganado',
		lost: 'Perdido'
	};

	const PROSPECT_NEXT: Partial<Record<ProspectStatus, ProspectStatus>> = {
		new: 'contacted',
		contacted: 'visit_scheduled',
		visit_scheduled: 'won'
	};

	let showLessonForm = $state(false);
	let lessonTitle = $state('');
	let lessonAnimalId = $state('');
	let lessonPoints = $state('10');
	let savingLesson = $state(false);

	let showProspectForm = $state(false);
	let prospectSchoolName = $state('');
	let prospectCity = $state('');
	let prospectContact = $state('');
	let savingProspect = $state(false);

	onMount(() => {
		schoolsStore.ensureLoaded();
		studentsStore.ensureLoaded();
		lessonsStore.ensureLoaded();
		animalsStore.ensureLoaded();
		prospectsStore.ensureLoaded();
		visitsStore.ensureLoaded();
	});

	const totalPoints = $derived(studentsStore.items.reduce((sum, s) => sum + s.points, 0));
	const pendingVisits = $derived(visitsStore.items.filter((v) => v.status === 'pending').length);
	const scoreboard = $derived([...studentsStore.items].sort((a, b) => b.points - a.points).slice(0, 5));

	async function submitLesson(event: Event) {
		event.preventDefault();
		if (!lessonTitle.trim()) return;
		savingLesson = true;
		try {
			await lessonsStore.create({
				title: lessonTitle.trim(),
				animal_id: lessonAnimalId || undefined,
				points_reward: Number(lessonPoints) || 10
			});
			lessonTitle = '';
			lessonAnimalId = '';
			lessonPoints = '10';
			showLessonForm = false;
		} finally {
			savingLesson = false;
		}
	}

	async function submitProspect(event: Event) {
		event.preventDefault();
		if (!prospectSchoolName.trim()) return;
		savingProspect = true;
		try {
			await prospectsStore.create({
				school_name: prospectSchoolName.trim(),
				city: prospectCity.trim() || undefined,
				contact_name: prospectContact.trim() || undefined
			});
			prospectSchoolName = '';
			prospectCity = '';
			prospectContact = '';
			showProspectForm = false;
		} finally {
			savingProspect = false;
		}
	}

	async function advanceProspect(prospectId: string, status: ProspectStatus) {
		await prospectsStore.update(prospectId, { status });
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Unergy"
		description="Escuelas, métricas, contenido y lecciones, scoreboard y prospectos de colegios."
	/>

	<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">Colegios</Card.Title>
				<Building2Icon class="size-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content><div class="text-2xl font-bold">{schoolsStore.items.length}</div></Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">Estudiantes</Card.Title>
				<UsersIcon class="size-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content><div class="text-2xl font-bold">{studentsStore.items.length}</div></Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">Puntos totales</Card.Title>
				<TrophyIcon class="size-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content><div class="text-2xl font-bold">{totalPoints}</div></Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between pb-2">
				<Card.Title class="text-sm font-medium">Visitas pendientes</Card.Title>
				<HandshakeIcon class="size-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content><div class="text-2xl font-bold">{pendingVisits}</div></Card.Content>
		</Card.Root>
	</section>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Colegios</Card.Title>
				<Card.Description>Vista general de escuelas registradas.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Colegio</Table.Head>
							<Table.Head>Ciudad</Table.Head>
							<Table.Head>Estudiantes</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each schoolsStore.items as school (school.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{school.name}</Table.Cell>
								<Table.Cell>{school.city ?? '—'}</Table.Cell>
								<Table.Cell>{studentsStore.bySchool(school.id).length}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><TrophyIcon class="size-4" /> Top estudiantes</Card.Title>
			</Card.Header>
			<Card.Content class="flex flex-col gap-2">
				{#each scoreboard as student, index (student.id)}
					<div class="flex items-center justify-between rounded-lg border p-2.5">
						<span class="text-sm font-medium">#{index + 1} {student.name}</span>
						<Badge>{student.points} pts</Badge>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title>Contenido y lecciones</Card.Title>
				<Card.Description>Agrega lecciones para que los estudiantes aprendan y ganen puntos.</Card.Description>
			</div>
			<Button size="sm" onclick={() => (showLessonForm = !showLessonForm)}>
				<PlusIcon />
				Agregar lección
			</Button>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			{#if showLessonForm}
				<form class="grid gap-3 rounded-lg border p-3 sm:grid-cols-3" onsubmit={submitLesson}>
					<div class="flex flex-col gap-1.5 sm:col-span-2">
						<label class="text-sm font-medium" for="lesson-title">Título</label>
						<Input id="lesson-title" bind:value={lessonTitle} placeholder="Cómo alimentar a las gallinas" required />
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" for="lesson-points">Puntos</label>
						<Input id="lesson-points" type="number" min="0" bind:value={lessonPoints} />
					</div>
					<div class="flex flex-col gap-1.5 sm:col-span-3">
						<label class="text-sm font-medium" for="lesson-animal">Especie relacionada</label>
						<NativeSelect id="lesson-animal" bind:value={lessonAnimalId}>
							<option value="">Sin especie asociada</option>
							{#each animalsStore.items as animal (animal.id)}
								<option value={animal.id}>{animal.common_name ?? animal.name}</option>
							{/each}
						</NativeSelect>
					</div>
					<div class="flex justify-end gap-2 sm:col-span-3">
						<Button type="button" variant="outline" onclick={() => (showLessonForm = false)}>Cancelar</Button>
						<Button type="submit" disabled={savingLesson}>Guardar</Button>
					</div>
				</form>
			{/if}
			<ul class="flex flex-col divide-y rounded-lg border">
				{#each lessonsStore.items as lesson (lesson.id)}
					<li class="flex items-center justify-between px-3 py-2 text-sm">
						<span>{lesson.title}</span>
						<Badge variant="secondary">{lesson.points_reward} pts</Badge>
					</li>
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title>Prospectos</Card.Title>
				<Card.Description>Colegios que Unergy está gestionando para vincular.</Card.Description>
			</div>
			<Button size="sm" onclick={() => (showProspectForm = !showProspectForm)}>
				<PlusIcon />
				Agregar prospecto
			</Button>
		</Card.Header>
		<Card.Content class="flex flex-col gap-3">
			{#if showProspectForm}
				<form class="grid gap-3 rounded-lg border p-3 sm:grid-cols-3" onsubmit={submitProspect}>
					<div class="flex flex-col gap-1.5 sm:col-span-2">
						<label class="text-sm font-medium" for="prospect-name">Colegio</label>
						<Input id="prospect-name" bind:value={prospectSchoolName} placeholder="Nombre del colegio" required />
					</div>
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium" for="prospect-city">Ciudad</label>
						<Input id="prospect-city" bind:value={prospectCity} placeholder="Palmira" />
					</div>
					<div class="flex flex-col gap-1.5 sm:col-span-3">
						<label class="text-sm font-medium" for="prospect-contact">Contacto</label>
						<Input id="prospect-contact" bind:value={prospectContact} placeholder="Nombre del contacto" />
					</div>
					<div class="flex justify-end gap-2 sm:col-span-3">
						<Button type="button" variant="outline" onclick={() => (showProspectForm = false)}>Cancelar</Button>
						<Button type="submit" disabled={savingProspect}>Guardar</Button>
					</div>
				</form>
			{/if}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Colegio</Table.Head>
						<Table.Head>Ciudad</Table.Head>
						<Table.Head>Estado</Table.Head>
						<Table.Head class="text-right">Acciones</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each prospectsStore.items as prospect (prospect.id)}
						<Table.Row>
							<Table.Cell class="font-medium">{prospect.school_name}</Table.Cell>
							<Table.Cell>{prospect.city ?? '—'}</Table.Cell>
							<Table.Cell><Badge variant="secondary">{PROSPECT_LABELS[prospect.status]}</Badge></Table.Cell>
							<Table.Cell class="text-right">
								{#if PROSPECT_NEXT[prospect.status]}
									<Button size="sm" variant="outline" onclick={() => advanceProspect(prospect.id, PROSPECT_NEXT[prospect.status]!)}>
										Avanzar
									</Button>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
