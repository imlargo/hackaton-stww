<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { BarChart, PieChart } from 'layerchart';
	import { schoolsStore } from '$lib/features/schools';
	import { studentsStore } from '$lib/features/students';
	import { lessonsStore } from '$lib/features/lessons';
	import { contentRequestsStore } from '$lib/features/content-requests';
	import type { ContentRequestType, ContentRequestStatus } from '$lib/types/domain/content-request';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import { LevelBadge, BadgeGrid } from '$lib/components/domain';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { getLevel, getLevelProgress, LEVELS, getBadgeStates } from '$lib/config';
	import { getInitials } from '$lib/utils/string';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import MailIcon from '@lucide/svelte/icons/mail';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	const CONTENT_TYPE_LABELS: Record<ContentRequestType, string> = {
		animal: 'Ficha de especie/animal',
		lesson: 'Lección',
		material: 'Material didáctico',
		other: 'Otro'
	};

	const REQUEST_STATUS_LABELS: Record<ContentRequestStatus, string> = {
		pending: 'Pendiente',
		in_review: 'En revisión',
		approved: 'Aprobado',
		rejected: 'Rechazado'
	};

	const REQUEST_STATUS_VARIANTS: Record<
		ContentRequestStatus,
		'secondary' | 'default' | 'outline' | 'destructive'
	> = {
		pending: 'secondary',
		in_review: 'outline',
		approved: 'default',
		rejected: 'destructive'
	};

	let selectedSchoolId = $state('');

	// Dialog visibility
	let schoolDialogOpen = $state(false);
	let studentDialogOpen = $state(false);
	let contentDialogOpen = $state(false);

	// Registrar colegio
	let schoolName = $state('');
	let schoolCity = $state('');
	let schoolAddress = $state('');
	let contactName = $state('');
	let contactEmail = $state('');
	let socialNotes = $state('');
	let savingSchool = $state(false);

	// Inscribir estudiante
	let studentName = $state('');
	let studentGrade = $state('');
	let savingStudent = $state(false);

	// Solicitar contenido
	let requestType = $state<string>('animal');
	let requestTitle = $state('');
	let requestDescription = $state('');
	let requestBy = $state('');
	let savingRequest = $state(false);

	onMount(() => {
		schoolsStore.ensureLoaded();
		studentsStore.ensureLoaded();
		lessonsStore.ensureLoaded();
		contentRequestsStore.ensureLoaded();
	});

	$effect(() => {
		if (!selectedSchoolId && schoolsStore.items.length > 0) {
			selectedSchoolId = schoolsStore.items[0].id;
		}
	});

	const currentSchool = $derived(selectedSchoolId ? schoolsStore.byId(selectedSchoolId) : null);
	const roster = $derived(selectedSchoolId ? studentsStore.bySchool(selectedSchoolId) : []);
	const rankedRoster = $derived([...roster].sort((a, b) => b.points - a.points));
	const totalPoints = $derived(roster.reduce((sum, s) => sum + s.points, 0));
	const lessonsTotal = $derived(lessonsStore.items.length);

	$effect(() => {
		for (const student of roster) {
			lessonsStore.loadProgressForStudent(student.id);
		}
	});

	const completedTotal = $derived(
		roster.reduce((sum, s) => sum + (lessonsStore.progressByStudent[s.id]?.length ?? 0), 0)
	);
	const completionRate = $derived(
		roster.length && lessonsTotal
			? Math.round((completedTotal / (roster.length * lessonsTotal)) * 100)
			: 0
	);

	const pointsChartData = $derived(rankedRoster.slice(0, 8).map((s) => ({ name: s.name, points: s.points })));
	const pointsChartConfig = { points: { label: 'Puntos', color: 'var(--chart-1)' } } satisfies Chart.ChartConfig;

	const levelChartData = $derived(
		LEVELS.map((level, index) => ({
			name: level.name,
			value: rankedRoster.filter((s) => getLevel(s.points).id === level.id).length,
			color: `var(--chart-${(index % 5) + 1})`
		})).filter((entry) => entry.value > 0)
	);
	const levelChartConfig = $derived(
		Object.fromEntries(levelChartData.map((entry) => [entry.name, { label: entry.name, color: entry.color }]))
	);

	const requests = $derived(selectedSchoolId ? contentRequestsStore.bySchool(selectedSchoolId) : []);

	async function submitSchool(event: Event) {
		event.preventDefault();
		if (!schoolName.trim()) return;
		savingSchool = true;
		try {
			const created = await schoolsStore.create({
				name: schoolName.trim(),
				city: schoolCity.trim() || undefined,
				address: schoolAddress.trim() || undefined,
				contact_name: contactName.trim() || undefined,
				contact_email: contactEmail.trim() || undefined,
				social_notes: socialNotes.trim() || undefined
			});
			selectedSchoolId = created.id;
			schoolName = '';
			schoolCity = '';
			schoolAddress = '';
			contactName = '';
			contactEmail = '';
			socialNotes = '';
			schoolDialogOpen = false;
			toast.success('Colegio registrado', { description: `${created.name} ya está en la plataforma.` });
		} finally {
			savingSchool = false;
		}
	}

	async function submitStudent(event: Event) {
		event.preventDefault();
		if (!studentName.trim() || !selectedSchoolId) return;
		savingStudent = true;
		try {
			const created = await studentsStore.create({
				school_id: selectedSchoolId,
				name: studentName.trim(),
				grade: studentGrade.trim() || undefined
			});
			studentName = '';
			studentGrade = '';
			studentDialogOpen = false;
			toast.success('Estudiante inscrito', { description: `${created.name} ya puede empezar a aprender.` });
		} finally {
			savingStudent = false;
		}
	}

	async function submitContentRequest(event: Event) {
		event.preventDefault();
		if (!requestTitle.trim() || !selectedSchoolId) return;
		savingRequest = true;
		try {
			await contentRequestsStore.create({
				school_id: selectedSchoolId,
				type: requestType as ContentRequestType,
				title: requestTitle.trim(),
				description: requestDescription.trim() || undefined,
				requested_by: requestBy.trim() || undefined
			});
			requestTitle = '';
			requestDescription = '';
			requestBy = '';
			requestType = 'animal';
			contentDialogOpen = false;
			toast.success('Solicitud enviada', { description: 'Unergy la revisará pronto.' });
		} finally {
			savingRequest = false;
		}
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Colegio"
		description="Registra el colegio, inscribe estudiantes y sigue su progreso y gamificación."
	>
		{#snippet actions()}
			<Button size="sm" variant="outline" onclick={() => (schoolDialogOpen = true)}>
				<PlusIcon />
				Registrar colegio
			</Button>
		{/snippet}
	</PageHeader>

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
			<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex flex-col gap-1.5 sm:max-w-xs">
					<label class="text-sm font-medium" for="school-picker">Colegio</label>
					<NativeSelect id="school-picker" bind:value={selectedSchoolId}>
						{#each schoolsStore.items as school (school.id)}
							<option value={school.id}>{school.name}</option>
						{/each}
					</NativeSelect>
				</div>
				{#if currentSchool}
					<div class="flex flex-col gap-1 text-sm text-muted-foreground sm:items-end sm:text-right">
						{#if currentSchool.address || currentSchool.city}
							<span class="flex items-center gap-1.5 sm:justify-end">
								<MapPinIcon class="size-3.5 shrink-0" />
								{[currentSchool.address, currentSchool.city].filter(Boolean).join(', ')}
							</span>
						{/if}
						{#if currentSchool.contact_name}
							<span class="flex items-center gap-1.5 sm:justify-end">
								<MailIcon class="size-3.5 shrink-0" />
								{currentSchool.contact_name}
								{#if currentSchool.contact_email}· {currentSchool.contact_email}{/if}
							</span>
						{/if}
					</div>
				{/if}
			</Card.Content>
			{#if currentSchool?.social_notes}
				<Card.Footer class="border-t text-sm text-muted-foreground">
					<span class="font-medium text-foreground">Contexto social:</span>&nbsp;{currentSchool.social_notes}
				</Card.Footer>
			{/if}
		</Card.Root>

		<section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">Estudiantes inscritos</Card.Title>
					<UsersIcon class="size-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content><div class="text-2xl font-bold">{roster.length}</div></Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">Puntos acumulados</Card.Title>
					<TrophyIcon class="size-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content><div class="text-2xl font-bold">{totalPoints}</div></Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">Promedio por estudiante</Card.Title>
					<GaugeIcon class="size-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{roster.length ? Math.round(totalPoints / roster.length) : 0}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between pb-2">
					<Card.Title class="text-sm font-medium">Lecciones completadas</Card.Title>
					<BookOpenCheckIcon class="size-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{completionRate}%</div>
					<p class="text-xs text-muted-foreground">{completedTotal} de {roster.length * lessonsTotal} posibles</p>
				</Card.Content>
			</Card.Root>
		</section>

		{#if roster.length > 0}
			<section class="grid gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Puntos por estudiante</Card.Title>
						<Card.Description>Los 8 estudiantes con más puntos del colegio.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Chart.Container config={pointsChartConfig} class="h-56 w-full">
							<BarChart
								data={pointsChartData}
								x="name"
								axis="x"
								series={[{ key: 'points', label: 'Puntos', color: pointsChartConfig.points.color }]}
								props={{ bars: { radius: 4, strokeWidth: 0 }, xAxis: { format: (v: string) => v.split(' ')[0] } }}
							>
								{#snippet tooltip()}
									<Chart.Tooltip />
								{/snippet}
							</BarChart>
						</Chart.Container>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2"><SparklesIcon class="size-4" /> Estudiantes por nivel</Card.Title>
						<Card.Description>Distribución de niveles de gamificación.</Card.Description>
					</Card.Header>
					<Card.Content class="flex items-center gap-4">
						<Chart.Container config={levelChartConfig} class="h-40 w-full max-w-40">
							<PieChart data={levelChartData} key="name" value="value" c="color" innerRadius={30} padAngle={0.02}>
								{#snippet tooltip()}
									<Chart.Tooltip hideLabel />
								{/snippet}
							</PieChart>
						</Chart.Container>
						<ul class="flex flex-1 flex-col gap-1.5 text-sm">
							{#each levelChartData as entry (entry.name)}
								<li class="flex items-center justify-between gap-2">
									<span class="flex items-center gap-1.5">
										<span class="size-2.5 shrink-0 rounded-full" style="background-color:{entry.color}"></span>
										{entry.name}
									</span>
									<span class="text-muted-foreground">{entry.value}</span>
								</li>
							{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			</section>
		{/if}

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title>Estudiantes</Card.Title>
					<Card.Description>Progreso, nivel y puntos del colegio seleccionado.</Card.Description>
				</div>
				<Button size="sm" onclick={() => (studentDialogOpen = true)}>
					<PlusIcon />
					Inscribir estudiante
				</Button>
			</Card.Header>
			<Card.Content>
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
								<Table.Head>Nivel</Table.Head>
								<Table.Head>Progreso al siguiente nivel</Table.Head>
								<Table.Head class="text-right">Puntos</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each rankedRoster as student (student.id)}
								{@const progress = getLevelProgress(student.points)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-2">
											<Avatar.Root size="sm">
												<Avatar.Fallback>{getInitials(student.name)}</Avatar.Fallback>
											</Avatar.Root>
											{student.name}
										</div>
									</Table.Cell>
									<Table.Cell>{student.grade ?? '—'}</Table.Cell>
									<Table.Cell><LevelBadge level={progress.level} /></Table.Cell>
									<Table.Cell class="w-40">
										{#if progress.next}
											<div class="flex flex-col gap-1">
												<Progress value={progress.percent} class="h-1.5" />
												<span class="text-xs text-muted-foreground">Faltan {progress.pointsToNext} pts para {progress.next.name}</span>
											</div>
										{:else}
											<span class="text-xs font-medium text-primary">Nivel máximo</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right"><Badge>{student.points} pts</Badge></Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title class="flex items-center gap-2"><InboxIcon class="size-4" /> Solicitudes de contenido</Card.Title>
					<Card.Description>Pide a Unergy nuevas especies, lecciones o material de apoyo.</Card.Description>
				</div>
				<Button size="sm" variant="outline" onclick={() => (contentDialogOpen = true)} disabled={!selectedSchoolId}>
					<PlusIcon />
					Solicitar contenido
				</Button>
			</Card.Header>
			<Card.Content>
				{#if requests.length === 0}
					<p class="py-6 text-center text-sm text-muted-foreground">
						Aún no has solicitado contenido a Unergy.
					</p>
				{:else}
					<Item.Group class="gap-2">
						{#each requests as request (request.id)}
							<Item.Root variant="outline">
								<Item.Content>
									<Item.Title>{request.title}</Item.Title>
									<Item.Description>
										{CONTENT_TYPE_LABELS[request.type]}
										{#if request.description}· {request.description}{/if}
									</Item.Description>
								</Item.Content>
								<Item.Actions>
									<Badge variant={REQUEST_STATUS_VARIANTS[request.status]}>
										{REQUEST_STATUS_LABELS[request.status]}
									</Badge>
								</Item.Actions>
							</Item.Root>
						{/each}
					</Item.Group>
				{/if}
			</Card.Content>
		</Card.Root>

		{#if roster.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2"><TrophyIcon class="size-4" /> Insignias del colegio</Card.Title>
					<Card.Description>Logros desbloqueados por el estudiante líder del colegio.</Card.Description>
				</Card.Header>
				<Card.Content>
					<BadgeGrid
						stats={{
							points: rankedRoster[0]?.points ?? 0,
							lessonsCompleted: lessonsStore.progressByStudent[rankedRoster[0]?.id]?.length ?? 0,
							lessonsTotal,
							animalsMastered: 0,
							animalsTotal: 0,
							minigranjaCompleted: false,
							schoolRank: rankedRoster.length ? 1 : null
						}}
					/>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>

<Dialog.Root bind:open={schoolDialogOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Registrar colegio</Dialog.Title>
			<Dialog.Description>Ubicación y contexto social del colegio.</Dialog.Description>
		</Dialog.Header>
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
				<label class="text-sm font-medium" for="school-address">Dirección / vereda</label>
				<Input id="school-address" bind:value={schoolAddress} placeholder="Vereda El Roble, km 3" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="school-contact">Contacto</label>
				<Input id="school-contact" bind:value={contactName} placeholder="Nombre del rector/a" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="school-email">Correo de contacto</label>
				<Input id="school-email" type="email" bind:value={contactEmail} placeholder="contacto@colegio.edu.co" />
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="school-social">Información social de la comunidad</label>
				<Textarea
					id="school-social"
					bind:value={socialNotes}
					rows={2}
					placeholder="Contexto de la comunidad, población, necesidades..."
				/>
			</div>
			<div class="flex justify-end gap-2 sm:col-span-2">
				<Button type="button" variant="outline" onclick={() => (schoolDialogOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={savingSchool}>Guardar</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={studentDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Inscribir estudiante</Dialog.Title>
			<Dialog.Description>Se agregará al colegio seleccionado, con 0 puntos.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-3" onsubmit={submitStudent}>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="student-name">Nombre</label>
				<Input id="student-name" bind:value={studentName} placeholder="Nombre del estudiante" required />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="student-grade">Grado</label>
				<Input id="student-grade" bind:value={studentGrade} placeholder="5°" />
			</div>
			<div class="flex justify-end gap-2 sm:col-span-3">
				<Button type="button" variant="outline" onclick={() => (studentDialogOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={savingStudent}>Guardar</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={contentDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Solicitar contenido</Dialog.Title>
			<Dialog.Description>Pide especies, lecciones o material a Unergy.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-2" onsubmit={submitContentRequest}>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="request-type">Tipo de contenido</label>
				<NativeSelect id="request-type" bind:value={requestType}>
					{#each Object.entries(CONTENT_TYPE_LABELS) as [value, label] (value)}
						<option {value}>{label}</option>
					{/each}
				</NativeSelect>
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="request-title">Título</label>
				<Input id="request-title" bind:value={requestTitle} placeholder="Ej. Ficha de la cabra" required />
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="request-description">Descripción</label>
				<Textarea id="request-description" bind:value={requestDescription} rows={3} placeholder="Cuéntanos por qué lo necesitas" />
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="request-by">Solicitado por</label>
				<Input id="request-by" bind:value={requestBy} placeholder="Nombre" />
			</div>
			<div class="flex justify-end gap-2 sm:col-span-2">
				<Button type="button" variant="outline" onclick={() => (contentDialogOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={savingRequest}>Enviar solicitud</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
