<script lang="ts">
	import { minigranjaStore } from '$lib/features/minigranja';
	import { animalsStore } from '$lib/features/animals';
	import { MINIGRANJA_GAME } from '$lib/config';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import PartyPopperIcon from '@lucide/svelte/icons/party-popper';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

	let { studentId }: { studentId: string } = $props();

	let plotDialogOpen = $state(false);
	let activePlotId = $state<number | null>(null);

	$effect(() => {
		minigranjaStore.ensureLoaded(studentId);
	});

	const gameState = $derived(minigranjaStore.forStudent(studentId));
	const filledCount = $derived(gameState ? gameState.plots.filter((p) => p.animal_id !== null).length : 0);
	const percent = $derived(Math.round((filledCount / MINIGRANJA_GAME.plotCount) * 100));

	function animalName(animalId: string | null) {
		if (!animalId) return null;
		return animalsStore.byId(animalId)?.common_name ?? null;
	}

	function openPlot(plotId: number) {
		activePlotId = plotId;
		plotDialogOpen = true;
	}

	async function assign(animalId: string | null) {
		if (activePlotId === null) return;
		const result = await minigranjaStore.setPlot(studentId, activePlotId, animalId);
		plotDialogOpen = false;
		activePlotId = null;
		if (result.justCompleted) {
			toast.success('¡Minigranja terminada!', {
				description: `Ganaste ${MINIGRANJA_GAME.bonusPoints} puntos extra.`
			});
		}
	}

	async function reset() {
		await minigranjaStore.reset(studentId);
		toast.info('Minigranja reiniciada');
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between gap-2">
		<div class="flex flex-col gap-1">
			<span class="text-sm text-muted-foreground">Lotes construidos</span>
			<Progress value={percent} class="h-1.5 w-40" />
		</div>
		{#if gameState?.completed}
			<Badge class="gap-1"><PartyPopperIcon class="size-3.5" /> ¡Completa!</Badge>
		{:else}
			<span class="text-sm font-medium">{filledCount} / {MINIGRANJA_GAME.plotCount}</span>
		{/if}
	</div>

	{#if state}
		<div class="grid grid-cols-3 gap-3">
			{#each state.plots as plot (plot.id)}
				{@const name = animalName(plot.animal_id)}
				<button
					type="button"
					onclick={() => openPlot(plot.id)}
					class={cn(
						'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition-colors hover:border-primary/50 hover:bg-primary/5',
						name !== null && 'border-primary/40 bg-primary/5'
					)}
				>
					{#if name}
						<span class="text-2xl">🐾</span>
						<span class="text-xs font-medium">{name}</span>
					{:else}
						<PlusIcon class="size-5 text-muted-foreground" />
						<span class="text-xs text-muted-foreground">Lote {plot.id + 1}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if filledCount > 0}
		<Button variant="ghost" size="sm" class="w-fit" onclick={reset}>
			<RotateCcwIcon />
			Reiniciar minigranja
		</Button>
	{/if}
</div>

<Dialog.Root bind:open={plotDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				{activePlotId !== null ? `¿Qué construyes en el lote ${activePlotId + 1}?` : 'Elige una especie'}
			</Dialog.Title>
			<Dialog.Description>Elige la especie que va en este lote de tu minigranja.</Dialog.Description>
		</Dialog.Header>
		<div class="grid grid-cols-2 gap-2">
			{#each animalsStore.items as animal (animal.id)}
				<Button variant="outline" class="justify-start" onclick={() => assign(animal.id)}>
					🐾 {animal.common_name ?? animal.name}
				</Button>
			{/each}
		</div>
		<Button variant="ghost" size="sm" onclick={() => assign(null)}>Dejar vacío</Button>
	</Dialog.Content>
</Dialog.Root>
