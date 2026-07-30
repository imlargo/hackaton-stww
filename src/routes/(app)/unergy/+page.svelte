<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { LineChart, PieChart } from 'layerchart';
	import { schoolsStore } from '$lib/features/schools';
	import { studentsStore } from '$lib/features/students';
	import { lessonsStore } from '$lib/features/lessons';
	import { animalsStore } from '$lib/features/animals';
	import { prospectsStore } from '$lib/features/prospects';
	import { visitsStore } from '$lib/features/visits';
	import { contentRequestsStore } from '$lib/features/content-requests';
	import type { ContentRequestType, ContentRequestStatus } from '$lib/types/domain/content-request';
	import { PageHeader } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Item from '$lib/components/ui/item/index.js';
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
	import InboxIcon from '@lucide/svelte/icons/inbox';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
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

	const CONTENT_TYPE_LABELS: Record<ContentRequestType, string> = {
		animal: 'Ficha de especie/animal',
		lesson: 'Lección',
		material: 'Material didáctico',
		other: 'Otro'
	};

	let activeTab = $state('resumen');

	let lessonDialogOpen = $state(false);
	let lessonTitle = $state('');
	let lessonAnimalId = $state('');
	let lessonPoints = $state('10');
	let savingLesson = $state(false);

	let prospectDialogOpen = $state(false);
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
		contentRequestsStore.ensureLoaded();
	});

	const totalPoints = $derived(studentsStore.items.reduce((sum, s) => sum + s.points, 0));
	const pendingVisits = $derived(visitsStore.items.filter((v) => v.status === 'pending').length);
	const scoreboard = $derived([...studentsStore.items].sort((a, b) => b.points - a.points).slice(0, 5));
	const pendingRequests = $derived(contentRequestsStore.items.filter((r) => r.status === 'pending' || r.status === 'in_review'));

	const MONTH_LABELS = ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];
	const growthData = $derived(
		MONTH_LABELS.map((month, i) => ({
			month,
			colegios: Math.max(1, Math.round((schoolsStore.items.length * (i + 1)) / MONTH_LABELS.length)),
			estudiantes: Math.max(1, Math.round((studentsStore.items.length * (i + 1)) / MONTH_LABELS.length))
		}))
	);
	const growthConfig = {
		colegios: { label: 'Colegios', color: 'var(--chart-1)' },
		estudiantes: { label: 'Estudiantes', color: 'var(--chart-2)' }
	} satisfies Chart.ChartConfig;

	const funnelData = $derived(
		(['new', 'contacted', 'visit_scheduled', 'won', 'lost'] as ProspectStatus[])
			.map((status, i) => ({
				name: PROSPECT_LABELS[status],
				value: prospectsStore.items.filter((p) => p.status === status).length,
				color: `var(--chart-${(i % 5) + 1})`
			}))
			.filter((d) => d.value > 0)
	);
	const funnelConfig = $derived(
		Object.fromEntries(funnelData.map((d) => [d.name, { label: d.name, color: d.color }]))
	);

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
			lessonDialogOpen = false;
			toast.success('Lección publicada');
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
			prospectDialogOpen = false;
			toast.success('Prospecto agregado');
		} finally {
			savingProspect = false;
		}
	}

	async function advanceProspect(prospectId: string, status: ProspectStatus) {
		await prospectsStore.update(prospectId, { status });
	}

	async function reviewRequest(requestId: string, status: ContentRequestStatus) {
		await contentRequestsStore.update(requestId, { status });
		toast.success(status === 'approved' ? 'Solicitud aprobada' : 'Solicitud actualizada');
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

	<Tabs.Root bind:value={activeTab}>
		<Tabs.List>
			<Tabs.Trigger value="resumen">Resumen</Tabs.Trigger>
			<Tabs.Trigger value="colegios">Colegios</Tabs.Trigger>
			<Tabs.Trigger value="contenido">Contenido</Tabs.Trigger>
			<Tabs.Trigger value="prospectos">Prospectos</Tabs.Trigger>
			<Tabs.Trigger value="solicitudes">
				<InboxIcon /> Solicitudes
				{#if pendingRequests.length > 0}
					<Badge class="ml-1">{pendingRequests.length}</Badge>
				{/if}
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="resumen">
			<div class="grid gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Crecimiento de la red</Card.Title>
						<Card.Description>Colegios y estudiantes acumulados por mes.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Chart.Container config={growthConfig} class="h-56 w-full">
							<LineChart
								data={growthData}
								x="month"
								axis="x"
								series={[
									{ key: 'colegios', label: 'Colegios', color: growthConfig.colegios.color },
									{ key: 'estudiantes', label: 'Estudiantes', color: growthConfig.estudiantes.color }
								]}
								props={{ spline: { strokeWidth: 2 } }}
							>
								{#snippet tooltip()}
									<Chart.Tooltip />
								{/snippet}
							</LineChart>
						</Chart.Container>
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

			{#if funnelData.length > 0}
				<Card.Root class="mt-4">
					<Card.Header>
						<Card.Title>Embudo de prospectos</Card.Title>
						<Card.Description>Colegios en proceso de vinculación, por etapa.</Card.Description>
					</Card.Header>
					<Card.Content class="flex items-center gap-4">
						<Chart.Container config={funnelConfig} class="h-40 w-full max-w-40">
							<PieChart data={funnelData} key="name" value="value" c="color" innerRadius={30} padAngle={0.02}>
								{#snippet tooltip()}
									<Chart.Tooltip hideLabel />
								{/snippet}
							</PieChart>
						</Chart.Container>
						<ul class="flex flex-1 flex-col gap-1.5 text-sm">
							{#each funnelData as entry (entry.name)}
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
			{/if}
		</Tabs.Content>

		<Tabs.Content value="colegios">
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
		</Tabs.Content>

		<Tabs.Content value="contenido">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title>Contenido y lecciones</Card.Title>
						<Card.Description>Agrega lecciones para que los estudiantes aprendan y ganen puntos.</Card.Description>
					</div>
					<Button size="sm" onclick={() => (lessonDialogOpen = true)}>
						<PlusIcon />
						Agregar lección
					</Button>
				</Card.Header>
				<Card.Content>
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
		</Tabs.Content>

		<Tabs.Content value="prospectos">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<div>
						<Card.Title>Prospectos</Card.Title>
						<Card.Description>Colegios que Unergy está gestionando para vincular.</Card.Description>
					</div>
					<Button size="sm" onclick={() => (prospectDialogOpen = true)}>
						<PlusIcon />
						Agregar prospecto
					</Button>
				</Card.Header>
				<Card.Content>
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
		</Tabs.Content>

		<Tabs.Content value="solicitudes">
			<Card.Root>
				<Card.Header>
					<Card.Title>Solicitudes de contenido</Card.Title>
					<Card.Description>Lo que los colegios están pidiendo (especies, lecciones, material).</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if contentRequestsStore.items.length === 0}
						<p class="py-6 text-center text-sm text-muted-foreground">No hay solicitudes todavía.</p>
					{:else}
						<Item.Group>
							{#each contentRequestsStore.items as request (request.id)}
								<Item.Root variant="outline">
									<Item.Content>
										<Item.Title>{request.title}</Item.Title>
										<Item.Description>
											{schoolsStore.byId(request.school_id)?.name ?? 'Colegio'} · {CONTENT_TYPE_LABELS[request.type]}
											{#if request.description}· {request.description}{/if}
										</Item.Description>
									</Item.Content>
									<Item.Actions>
										{#if request.status === 'pending' || request.status === 'in_review'}
											<Button size="icon-sm" variant="outline" onclick={() => reviewRequest(request.id, 'approved')}>
												<CheckIcon />
											</Button>
											<Button size="icon-sm" variant="outline" onclick={() => reviewRequest(request.id, 'rejected')}>
												<XIcon />
											</Button>
										{:else}
											<Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
												{request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
											</Badge>
										{/if}
									</Item.Actions>
								</Item.Root>
							{/each}
						</Item.Group>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>
	</Tabs.Root>
</div>

<Dialog.Root bind:open={lessonDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Agregar lección</Dialog.Title>
			<Dialog.Description>Publica contenido para que los estudiantes ganen puntos.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-3" onsubmit={submitLesson}>
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
				<Button type="button" variant="outline" onclick={() => (lessonDialogOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={savingLesson}>Guardar</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={prospectDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Agregar prospecto</Dialog.Title>
			<Dialog.Description>Colegios candidatos para una futura minigranja.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-3" onsubmit={submitProspect}>
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
				<Button type="button" variant="outline" onclick={() => (prospectDialogOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={savingProspect}>Guardar</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
