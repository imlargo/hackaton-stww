<script lang="ts">
	import { onMount } from 'svelte';
	import { schoolsStore } from '$lib/features/schools';
	import { animalsStore } from '$lib/features/animals';
	import { PageHeader, EmptyState } from '$lib/components/common';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { NativeSelect } from '$lib/components/ui/native-select/index.js';
	import SproutIcon from '@lucide/svelte/icons/sprout';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';

	let selectedSchoolId = $state('');
	let spaceM2 = $state('');
	let waterSource = $state('');
	let climate = $state('');
	let resources = $state('');
	let saving = $state(false);
	let saved = $state(false);

	onMount(() => {
		schoolsStore.ensureLoaded();
		animalsStore.ensureLoaded();
	});

	$effect(() => {
		if (!selectedSchoolId && schoolsStore.items.length > 0) {
			selectedSchoolId = schoolsStore.items[0].id;
		}
	});

	$effect(() => {
		const school = selectedSchoolId ? schoolsStore.byId(selectedSchoolId) : null;
		const characterization = (school?.characterization ?? {}) as Record<string, string>;
		spaceM2 = characterization.space_m2 ?? '';
		waterSource = characterization.water_source ?? '';
		climate = characterization.climate ?? '';
		resources = characterization.resources ?? '';
		saved = false;
	});

	const currentSchool = $derived(selectedSchoolId ? schoolsStore.byId(selectedSchoolId) : null);

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
			saved = true;
		} finally {
			saving = false;
		}
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
		<EmptyState title="No hay colegios registrados" description="Registra un colegio en la vista Colegio antes de caracterizar su minigranja.">
			{#snippet icon()}
				<SproutIcon class="size-5" />
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

		<Card.Root>
			<Card.Header>
				<Card.Title>Caracterización del espacio</Card.Title>
				<Card.Description>Se cruza con el contenido disponible para decidir qué animales enseñar a cuidar.</Card.Description>
			</Card.Header>
			<Card.Content>
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
					<div class="flex items-center justify-end gap-2 sm:col-span-2">
						{#if saved}
							<span class="text-sm text-muted-foreground">Guardado</span>
						{/if}
						<Button type="submit" disabled={saving}>Guardar caracterización</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Animales sugeridos para {currentSchool?.name ?? 'la minigranja'}</Card.Title>
				<Card.Description>A partir de la caracterización, se enseña a los estudiantes a cuidar estas especies.</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each animalsStore.items as animal (animal.id)}
					<div class="flex flex-col gap-1 rounded-lg border p-3">
						<span class="font-medium">{animal.common_name ?? animal.name}</span>
						<span class="text-xs text-muted-foreground italic">{animal.name}</span>
						{#if animal.care_info}
							<p class="mt-1 text-sm text-muted-foreground">{animal.care_info}</p>
						{/if}
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
