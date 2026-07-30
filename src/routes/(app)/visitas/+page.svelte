<script lang="ts">
	import { onMount } from 'svelte';
	import { visitsStore } from '$lib/features/visits';
	import { schoolsStore } from '$lib/features/schools';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import CalendarCheckIcon from '@lucide/svelte/icons/calendar-check';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import type { VisitStatus } from '$lib/types/domain/visit';

	const STATUS_LABELS: Record<VisitStatus, string> = {
		pending: 'Pendiente',
		approved: 'Aprobada',
		scheduled: 'Programada',
		completed: 'Completada',
		rejected: 'Rechazada'
	};

	const STATUS_VARIANTS: Record<VisitStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
		pending: 'secondary',
		approved: 'outline',
		scheduled: 'default',
		completed: 'default',
		rejected: 'destructive'
	};

	let showForm = $state(false);
	let schoolId = $state('');
	let requestedBy = $state('');
	let requestedDate = $state('');
	let notes = $state('');
	let submitting = $state(false);

	onMount(() => {
		visitsStore.ensureLoaded();
		schoolsStore.ensureLoaded();
	});

	function schoolName(schoolIdValue: string): string {
		return schoolsStore.byId(schoolIdValue)?.name ?? 'Colegio desconocido';
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
		} finally {
			submitting = false;
		}
	}

	async function advance(visitId: string, status: VisitStatus, scheduledDate?: string) {
		await visitsStore.update(visitId, scheduledDate ? { status, scheduled_date: scheduledDate } : { status });
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Visitas"
		description="Solicitud y seguimiento de visitas, disponibilidad, cronograma y a dónde va Unergy."
	>
		{#snippet actions()}
			<Button size="sm" onclick={() => (showForm = !showForm)} disabled={schoolsStore.items.length === 0}>
				<PlusIcon />
				Solicitar visita
			</Button>
		{/snippet}
	</PageHeader>

	{#if showForm}
		<Card.Root>
			<Card.Header>
				<Card.Title>Nueva solicitud de visita</Card.Title>
			</Card.Header>
			<Card.Content>
				<form class="grid gap-3 sm:grid-cols-2" onsubmit={submit}>
					<div class="flex flex-col gap-1.5 sm:col-span-2">
						<label class="text-sm font-medium" for="visit-school">Colegio</label>
						<NativeSelect id="visit-school" bind:value={schoolId} required>
							<option value="" disabled selected>Selecciona un colegio</option>
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
			</Card.Content>
		</Card.Root>
	{/if}

	{#if visitsStore.loading && visitsStore.items.length === 0}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else if visitsStore.error}
		<p class="text-sm text-destructive">{visitsStore.error}</p>
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
							<Table.Cell><Badge variant={STATUS_VARIANTS[visit.status]}>{STATUS_LABELS[visit.status]}</Badge></Table.Cell>
							<Table.Cell class="text-right">
								{#if visit.status === 'pending'}
									<Button size="sm" variant="outline" onclick={() => advance(visit.id, 'approved')}>Aprobar</Button>
								{:else if visit.status === 'approved'}
									<Button size="sm" variant="outline" onclick={() => advance(visit.id, 'scheduled', visit.requested_date ?? undefined)}>Programar</Button>
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
</div>
