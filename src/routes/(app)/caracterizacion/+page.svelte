<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { BarChart } from 'layerchart';
	import { schoolsStore } from '$lib/features/schools';
	import { animalsStore } from '$lib/features/animals';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import SproutIcon from '@lucide/svelte/icons/sprout';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import DropletIcon from '@lucide/svelte/icons/droplet';
	import ThermometerIcon from '@lucide/svelte/icons/thermometer';
	import GitCompareIcon from '@lucide/svelte/icons/git-compare';

	type Requirement = { minSpace: number; needsWater: boolean; note: string };

	const ANIMAL_REQUIREMENTS: Record<string, Requirement> = {
		Gallina: { minSpace: 20, needsWater: true, note: 'Necesita gallinero y agua limpia diaria.' },
		Conejo: { minSpace: 10, needsWater: true, note: 'Jaula ventilada y control de temperatura.' },
		'Rana venenosa dorada': {
			minSpace: 5,
			needsWater: true,
			note: 'Terrario húmedo, manejo especializado.'
		}
	};
	const DEFAULT_REQUIREMENT: Requirement = { minSpace: 15, needsWater: true, note: 'Requiere espacio y agua disponible.' };

	let selectedSchoolId = $state('');
	let editOpen = $state(false);
	let animalDialogOpen = $state(false);
	let selectedAnimalId = $state<string | null>(null);

	let spaceM2 = $state('');
	let waterSource = $state('');
	let climate = $state('');
	let resources = $state('');
	let saving = $state(false);

	onMount(() => {
		schoolsStore.ensureLoaded();
		animalsStore.ensureLoaded();
	});

	$effect(() => {
		if (!selectedSchoolId && schoolsStore.items.length > 0) {
			selectedSchoolId = schoolsStore.items[0].id;
		}
	});

	const currentSchool = $derived(selectedSchoolId ? schoolsStore.byId(selectedSchoolId) : null);
	const characterization = $derived(
		(currentSchool?.characterization ?? {}) as Record<string, string>
	);
	const hasCharacterization = $derived(Boolean(currentSchool?.characterization));
	const spaceValue = $derived(Number(characterization.space_m2) || 0);

	function openEdit() {
		spaceM2 = characterization.space_m2 ?? '';
		waterSource = characterization.water_source ?? '';
		climate = characterization.climate ?? '';
		resources = characterization.resources ?? '';
		editOpen = true;
	}

	async function submit(event: Event) {
		event.preventDefault();
		if (!selectedSchoolId) return;
		saving = true;
		try {
			await schoolsStore.updateCharacterization(selectedSchoolId, {
				space_m2: spaceM2.trim(),
				water_source: waterSource.trim(),
				climate: climate.trim(),
				resources: resources.trim()
			});
			editOpen = false;
			toast.success('Caracterización guardada', { description: 'Se recalculó la compatibilidad con las especies.' });
		} finally {
			saving = false;
		}
	}

	function compatibility(animalName: string) {
		const req = ANIMAL_REQUIREMENTS[animalName] ?? DEFAULT_REQUIREMENT;
		const spaceScore = hasCharacterization
			? Math.min(100, Math.round((spaceValue / req.minSpace) * 100))
			: 50;
		const waterScore = hasCharacterization ? (waterSourceFilled() ? 100 : 40) : 50;
		const climateScore = hasCharacterization ? (climateFilled() ? 90 : 60) : 50;
		const overall = Math.round(spaceScore * 0.5 + waterScore * 0.3 + climateScore * 0.2);
		const level = overall >= 75 ? 'Alta' : overall >= 50 ? 'Media' : 'Baja';
		return { overall: Math.min(100, overall), spaceScore: Math.min(100, spaceScore), waterScore, climateScore, level, note: req.note };
	}

	function waterSourceFilled() {
		return Boolean(characterization.water_source?.trim());
	}
	function climateFilled() {
		return Boolean(characterization.climate?.trim());
	}

	const compatibilityChartData = $derived(
		animalsStore.items.map((animal) => ({
			name: animal.common_name ?? animal.name,
			score: compatibility(animal.common_name ?? animal.name).overall
		}))
	);
	const compatibilityChartConfig = { score: { label: 'Compatibilidad %', color: 'var(--chart-2)' } } satisfies Chart.ChartConfig;

	const selectedAnimal = $derived(
		selectedAnimalId ? animalsStore.byId(selectedAnimalId) : null
	);

	function levelVariant(level: string): 'default' | 'secondary' | 'outline' {
		if (level === 'Alta') return 'default';
		if (level === 'Media') return 'secondary';
		return 'outline';
	}

	function openAnimal(id: string) {
		selectedAnimalId = id;
		animalDialogOpen = true;
	}
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Caracterización y minigranja"
		description="Antes de construir, se caracteriza el espacio y los recursos disponibles para elegir qué animales cuidar."
	/>

	{#if schoolsStore.loading && schoolsStore.items.length === 0}
		<div class="flex flex-1 items-center justify-center py-12">
			<LoaderCircleIcon class="size-6 animate-spin text-muted-foreground" />
		</div>
	{:else if schoolsStore.items.length === 0}
		<EmptyState
			title="No hay colegios registrados"
			description="Registra un colegio en la vista Colegio antes de caracterizar su minigranja."
		>
			{#snippet icon()}
				<SproutIcon class="size-5" />
			{/snippet}
		</EmptyState>
	{:else}
		<Card.Root>
			<Card.Content class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col gap-1.5 sm:max-w-xs">
					<label class="text-sm font-medium" for="school-picker">Colegio</label>
					<NativeSelect id="school-picker" bind:value={selectedSchoolId}>
						{#each schoolsStore.items as school (school.id)}
							<option value={school.id}>{school.name}</option>
						{/each}
					</NativeSelect>
				</div>
				<Badge variant={hasCharacterization ? 'default' : 'outline'}>
					{hasCharacterization ? 'Caracterización completa' : 'Caracterización pendiente'}
				</Badge>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<div>
					<Card.Title>Caracterización del espacio</Card.Title>
					<Card.Description>Se cruza con el contenido disponible para decidir qué animales enseñar a cuidar.</Card.Description>
				</div>
				<Button size="sm" onclick={openEdit}>
					<PencilIcon />
					{hasCharacterization ? 'Editar' : 'Completar'}
				</Button>
			</Card.Header>
			<Card.Content>
				{#if !hasCharacterization}
					<p class="py-4 text-sm text-muted-foreground">
						Aún no se ha caracterizado el espacio de este colegio.
					</p>
				{:else}
					<div class="grid gap-4 sm:grid-cols-3">
						<div class="flex items-start gap-2">
							<MapPinIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="flex flex-col">
								<span class="text-xs text-muted-foreground">Espacio disponible</span>
								<span class="font-medium">{characterization.space_m2 || '—'} m²</span>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<DropletIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="flex flex-col">
								<span class="text-xs text-muted-foreground">Fuente de agua</span>
								<span class="font-medium">{characterization.water_source || '—'}</span>
							</div>
						</div>
						<div class="flex items-start gap-2">
							<ThermometerIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
							<div class="flex flex-col">
								<span class="text-xs text-muted-foreground">Clima / región</span>
								<span class="font-medium">{characterization.climate || '—'}</span>
							</div>
						</div>
					</div>
					{#if characterization.resources}
						<p class="mt-3 border-t pt-3 text-sm text-muted-foreground">{characterization.resources}</p>
					{/if}
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2"><GitCompareIcon class="size-4" /> Cruce de compatibilidad</Card.Title>
				<Card.Description>Qué tan compatible es cada especie con el espacio y recursos caracterizados.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Chart.Container config={compatibilityChartConfig} class="h-56 w-full">
					<BarChart
						data={compatibilityChartData}
						x="name"
						axis="x"
						yDomain={[0, 100]}
						series={[{ key: 'score', label: 'Compatibilidad %', color: compatibilityChartConfig.score.color }]}
						props={{ bars: { radius: 4, strokeWidth: 0 } }}
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
				<Card.Title>Animales sugeridos para {currentSchool?.name ?? 'la minigranja'}</Card.Title>
				<Card.Description>A partir de la caracterización, se enseña a los estudiantes a cuidar estas especies.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each animalsStore.items as animal (animal.id)}
					{@const compat = compatibility(animal.common_name ?? animal.name)}
					<button
						type="button"
						class="flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
						onclick={() => openAnimal(animal.id)}
					>
						<div class="flex items-start justify-between gap-2">
							<div class="flex flex-col gap-0.5">
								<span class="font-medium">{animal.common_name ?? animal.name}</span>
								<span class="text-xs text-muted-foreground italic">{animal.name}</span>
							</div>
							<Badge variant={levelVariant(compat.level)}>{compat.level}</Badge>
						</div>
						<Progress value={compat.overall} class="h-1.5" />
						<span class="text-xs text-muted-foreground">{compat.overall}% de compatibilidad · Ver ficha</span>
					</button>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<Dialog.Root bind:open={editOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Caracterización del espacio</Dialog.Title>
			<Dialog.Description>Estos datos determinan qué animales son compatibles.</Dialog.Description>
		</Dialog.Header>
		<form class="grid gap-3 sm:grid-cols-2" onsubmit={submit}>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="space">Espacio disponible (m²)</label>
				<Input id="space" bind:value={spaceM2} placeholder="120" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="water">Fuente de agua</label>
				<Input id="water" bind:value={waterSource} placeholder="Acueducto veredal" />
			</div>
			<div class="flex flex-col gap-1.5">
				<label class="text-sm font-medium" for="climate">Clima / región</label>
				<Input id="climate" bind:value={climate} placeholder="Templado, zona rural" />
			</div>
			<div class="flex flex-col gap-1.5 sm:col-span-2">
				<label class="text-sm font-medium" for="resources">Recursos disponibles</label>
				<Textarea id="resources" bind:value={resources} rows={3} placeholder="Materiales, apoyo de la comunidad, etc." />
			</div>
			<div class="flex justify-end gap-2 sm:col-span-2">
				<Button type="button" variant="outline" onclick={() => (editOpen = false)}>Cancelar</Button>
				<Button type="submit" disabled={saving}>Guardar caracterización</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={animalDialogOpen}>
	<Dialog.Content>
		{#if selectedAnimal}
			{@const compat = compatibility(selectedAnimal.common_name ?? selectedAnimal.name)}
			<Dialog.Header>
				<Dialog.Title>{selectedAnimal.common_name ?? selectedAnimal.name}</Dialog.Title>
				<Dialog.Description class="italic">{selectedAnimal.name}</Dialog.Description>
			</Dialog.Header>
			<div class="flex flex-col gap-3">
				<Badge variant={levelVariant(compat.level)} class="w-fit">Compatibilidad {compat.level} · {compat.overall}%</Badge>
				{#if selectedAnimal.care_info}
					<p class="text-sm text-muted-foreground">{selectedAnimal.care_info}</p>
				{/if}
				<div class="flex flex-col gap-2 rounded-lg border p-3">
					<div class="flex items-center justify-between text-xs">
						<span class="flex items-center gap-1.5"><MapPinIcon class="size-3.5" /> Espacio</span>
						<span class="text-muted-foreground">{compat.spaceScore}%</span>
					</div>
					<Progress value={compat.spaceScore} class="h-1.5" />
					<div class="flex items-center justify-between text-xs">
						<span class="flex items-center gap-1.5"><DropletIcon class="size-3.5" /> Agua</span>
						<span class="text-muted-foreground">{compat.waterScore}%</span>
					</div>
					<Progress value={compat.waterScore} class="h-1.5" />
					<div class="flex items-center justify-between text-xs">
						<span class="flex items-center gap-1.5"><ThermometerIcon class="size-3.5" /> Clima</span>
						<span class="text-muted-foreground">{compat.climateScore}%</span>
					</div>
					<Progress value={compat.climateScore} class="h-1.5" />
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
