<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { visitsStore, AVAILABILITY_SLOTS } from '$lib/features/visits';
	import { schoolsStore } from '$lib/features/schools';
	import { studentsStore } from '$lib/features/students';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { GAMIFICATION } from '$lib/config';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import LockIcon from '@lucide/svelte/icons/lock';
	import MapIcon from '@lucide/svelte/icons/map';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import type { VisitStatus } from '$lib/types/domain/visit';

	const STATUS_LABELS: Record<VisitStatus, string> = {
		pending: 'Pendiente',
		approved: 'Aprobada',
		scheduled: 'Programada',
		completed: 'Completada',
		rejected: 'Rechazada'
	};

	const STATUS_VARIANTS: Record<VisitStatus, 'secondary' | 'default' | 'outline' | 'destructive'> =
		{
			pending: 'secondary',
			approved: 'outline',
			scheduled: 'default',
			completed: 'default',
			rejected: 'destructive'
		};

	let activeTab = $state('solicitudes');
	let showForm = $state(false);
	let gateSchoolId = $state('');
	let schoolId = $state('');
	let requestedBy = $state('');
	let requestedDate = $state('');
	let notes = $state('');
	let submitting = $state(false);

	onMount(() => {
		visitsStore.ensureLoaded();
		schoolsStore.ensureLoaded();
		studentsStore.ensureLoaded();
	});

	$effect(() => {
		if (!gateSchoolId && schoolsStore.items.length > 0) {
			gateSchoolId = schoolsStore.items[0].id;
		}
	});

	function schoolName(schoolIdValue: string): string {
		return schoolsStore.byId(schoolIdValue)?.name ?? 'Colegio desconocido';
	}

	const gateRoster = $derived(gateSchoolId ? studentsStore.bySchool(gateSchoolId) : []);
	const gateTopPoints = $derived(gateRoster.reduce((max, s) => Math.max(max, s.points), 0));
	const gateUnlocked = $derived(gateTopPoints >= GAMIFICATION.visitPointsGoal);
	const gatePercent = $derived(Math.min(100, Math.round((gateTopPoints / GAMIFICATION.visitPointsGoal) * 100)));

	function openRequestDialog() {
		schoolId = gateSchoolId;
		showForm = true;
	}

	async function submit(event: Event) {
		event.preventDefault();
		if (!schoolId) return;
		submitting = true;
		try {
			await visitsStore.create({
				school_id: schoolId,
				requested_by: requestedBy.trim() || undefined,
				requested_date: requestedDate || undefined,
				notes: notes.trim() || undefined
			});
			requestedBy = '';
			requestedDate = '';
			notes = '';
			showForm = false;
			toast.success('Solicitud de visita enviada');
		} finally {
			submitting = false;
		}
	}

	async function advance(visitId: string, status: VisitStatus, scheduledDate?: string) {
		await visitsStore.update(
			visitId,
			scheduledDate ? { status, scheduled_date: scheduledDate } : { status }
		);
		toast.success(`Visita marcada como ${STATUS_LABELS[status].toLowerCase()}`);
	}

	const upcomingDestinations = $derived(
		visitsStore.upcoming.map((visit) => ({ visit, school: schoolsStore.byId(visit.school_id) }))
	);

	function slotBooked(date: string) {
		return visitsStore.items.filter(
			(v) => v.scheduled_date === date && v.status !== 'rejected'
		).length;
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Visitas"
		description="Solicitud y seguimiento de visitas, disponibilidad, cronograma y a dónde va Unergy."
	/>

	{#if schoolsStore.loading && schoolsStore.items.length === 0}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else}
		<Card.Root>
			<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col gap-1.5 sm:max-w-xs">
					<label class="text-sm font-medium" for="gate-school">Colegio</label>
					<NativeSelect id="gate-school" bind:value={gateSchoolId}>
						{#each schoolsStore.items as school (school.id)}
							<option value={school.id}>{school.name}</option>
						{/each}
					</NativeSelect>
				</div>
				<div class="flex flex-1 flex-col gap-1.5">
					<div class="flex items-center justify-between text-xs text-muted-foreground">
						<span>Puntos para desbloquear la visita</span>
						<span>{gateTopPoints} / {GAMIFICATION.visitPointsGoal}</span>
					</div>
					<Progress value={gatePercent} class="h-1.5" />
				</div>
				{#if gateUnlocked}
					<Button size="sm" onclick={openRequestDialog}>
						<PlusIcon />
						Solicitar visita
					</Button>
				{:else}
					<Button size="sm" disabled title="El colegio aún no alcanza los puntos necesarios">
						<LockIcon />
						Bloqueada
					</Button>
				{/if}
			</Card.Content>
		</Card.Root>

		<Tabs.Root bind:value={activeTab}>
			<Tabs.List>
				<Tabs.Trigger value="solicitudes"><CalendarCheckIcon /> Solicitudes</Tabs.Trigger>
				<Tabs.Trigger value="cronograma"><MapIcon /> A dónde va Unergy</Tabs.Trigger>
				<Tabs.Trigger value="disponibilidad"><CalendarDaysIcon /> Disponibilidad</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="solicitudes">
				{#if visitsStore.loading && visitsStore.items.length === 0}
					<div class="flex flex-1 items-center justify-center py-12">
						<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
					</div>
				{:else if visitsStore.items.length === 0}
					<EmptyState title="No hay visitas solicitadas" description="Solicita la primera visita a la minigranja.">
						{#snippet icon()}
							<CalendarCheckIcon class="size-5" />
						{/snippet}
					</EmptyState>
				{:else}
					<Card.Root>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Colegio</Table.Head>
									<Table.Head>Solicitada por</Table.Head>
									<Table.Head>Fecha</Table.Head>
									<Table.Head>Estado</Table.Head>
									<Table.Head class="text-right">Acciones</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each visitsStore.items as visit (visit.id)}
									<Table.Row>
										<Table.Cell class="font-medium">{schoolName(visit.school_id)}</Table.Cell>
										<Table.Cell>{visit.requested_by ?? '—'}</Table.Cell>
										<Table.Cell>{visit.scheduled_date ?? visit.requested_date ?? '—'}</Table.Cell>
										<Table.Cell>
											<Badge variant={STATUS_VARIANTS[visit.status]}>{STATUS_LABELS[visit.status]}</Badge>
										</Table.Cell>
										<Table.Cell class="text-right">
											{#if visit.status === 'pending'}
												<Button size="sm" variant="outline" onclick={() => advance(visit.id, 'approved')}>Aprobar</Button>
											{:else if visit.status === 'approved'}
												<Button
													size="sm"
													variant="outline"
													onclick={() => advance(visit.id, 'scheduled', visit.requested_date ?? undefined)}
												>
													Programar
												</Button>
											{:else if visit.status === 'scheduled'}
												<Button size="sm" variant="outline" onclick={() => advance(visit.id, 'completed')}>Completar</Button>
											{/if}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Root>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="cronograma">
				<Card.Root>
					<Card.Header>
						<Card.Title>Próximos destinos de Unergy</Card.Title>
						<Card.Description>Visitas ya programadas, en orden de fecha.</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if upcomingDestinations.length === 0}
							<p class="py-6 text-center text-sm text-muted-foreground">Aún no hay visitas programadas.</p>
						{:else}
							<Item.Group>
								{#each upcomingDestinations as { visit, school } (visit.id)}
									<Item.Root variant="outline">
										<Item.Content>
											<Item.Title>{school?.name ?? 'Colegio'}</Item.Title>
											<Item.Description class="flex items-center gap-1.5">
												<MapPinIcon class="size-3.5" />
												{[school?.address, school?.city].filter(Boolean).join(', ') || 'Ubicación por confirmar'}
											</Item.Description>
										</Item.Content>
										<Item.Actions>
											<Badge>{visit.scheduled_date}</Badge>
										</Item.Actions>
									</Item.Root>
								{/each}
							</Item.Group>
						{/if}
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="disponibilidad">
				<Card.Root>
					<Card.Header>
						<Card.Title>Disponibilidad de brigadas Unergy</Card.Title>
						<Card.Description>Fechas y cupos disponibles para agendar visitas.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Fecha</Table.Head>
									<Table.Head>Región</Table.Head>
									<Table.Head class="text-right">Cupos</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each AVAILABILITY_SLOTS as slot (slot.date)}
									{@const booked = slotBooked(slot.date)}
									<Table.Row>
										<Table.Cell class="font-medium">{slot.date}</Table.Cell>
										<Table.Cell>{slot.region}</Table.Cell>
										<Table.Cell class="text-right">
											<Badge variant={booked >= slot.capacityTotal ? 'destructive' : 'outline'}>
												{booked} / {slot.capacityTotal}
											</Badge>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</div>

<Dialog.Root bind:open={showForm}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Nueva solicitud de visita</Dialog.Title>
			<Dialog.Description>El colegio ya alcanzó los puntos necesarios para desbloquear la visita.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-2" onsubmit={submit}>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="visit-school">Colegio</label>
				<NativeSelect id="visit-school" bind:value={schoolId} required>
					{#each schoolsStore.items as school (school.id)}
						<option value={school.id}>{school.name}</option>
					{/each}
				</NativeSelect>
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="visit-requester">Solicitado por</label>
				<Input id="visit-requester" bind:value={requestedBy} placeholder="Nombre" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="visit-date">Fecha deseada</label>
				<Input id="visit-date" type="date" bind:value={requestedDate} />
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="visit-notes">Notas</label>
				<Input id="visit-notes" bind:value={notes} placeholder="Detalles adicionales" />
			</div>
			<div class="flex justify-end gap-2 sm:col-span-2">
				<Button type="button" variant="outline" onclick={() => (showForm = false)}>Cancelar</Button>
				<Button type="submit" disabled={submitting}>Enviar solicitud</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
