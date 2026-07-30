<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import MinigranjaGame from './MinigranjaGame.svelte';
	import SproutIcon from '@lucide/svelte/icons/sprout';
	import HandHeartIcon from '@lucide/svelte/icons/hand-heart';
	import GamepadIcon from '@lucide/svelte/icons/gamepad-2';

	let { studentId }: { studentId: string } = $props();

	let minigranjaOpen = $state(false);
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	<button type="button" class="text-left" onclick={() => (minigranjaOpen = true)}>
		<Card.Root class="h-full transition-colors hover:border-primary/40 hover:bg-primary/5">
			<Card.Header>
				<SproutIcon class="size-5 text-muted-foreground" />
				<Card.Title class="text-base">Construye tu minigranja</Card.Title>
				<Card.Description>Elige qué especie va en cada lote antes de que Unergy la construya.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Badge>Jugar ahora</Badge>
			</Card.Content>
		</Card.Root>
	</button>

	<Card.Root>
		<Card.Header>
			<HandHeartIcon class="size-5 text-muted-foreground" />
			<Card.Title class="text-base">Cuida a los animales</Card.Title>
			<Card.Description>Repasa las lecciones para aprender a alimentar y cuidar cada especie.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Badge variant="outline">Disponible en lecciones</Badge>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<GamepadIcon class="size-5 text-muted-foreground" />
			<Card.Title class="text-base">Trivia de la minigranja</Card.Title>
			<Card.Description>Pon a prueba lo aprendido y gana puntos extra.</Card.Description>
		</Card.Header>
		<Card.Content>
			<Badge variant="outline">Próximamente</Badge>
		</Card.Content>
	</Card.Root>
</div>

<Dialog.Root bind:open={minigranjaOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Construye tu minigranja</Dialog.Title>
			<Dialog.Description>Completa los 6 lotes para ganar puntos extra.</Dialog.Description>
		</Dialog.Header>
		<MinigranjaGame {studentId} />
	</Dialog.Content>
</Dialog.Root>
