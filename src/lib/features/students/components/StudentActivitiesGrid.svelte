<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import SproutIcon from '@lucide/svelte/icons/sprout';
	import HandHeartIcon from '@lucide/svelte/icons/hand-heart';
	import GamepadIcon from '@lucide/svelte/icons/gamepad-2';

	const activities = [
		{
			icon: SproutIcon,
			title: 'Construye tu minigranja',
			description: 'Simulación para diseñar tu minigranja antes de que Unergy la construya.',
			badge: 'Próximamente'
		},
		{
			icon: HandHeartIcon,
			title: 'Cuida a los animales',
			description: 'Repasa las lecciones para aprender a alimentar y cuidar cada especie.',
			badge: 'Disponible en lecciones'
		},
		{
			icon: GamepadIcon,
			title: 'Trivia de la minigranja',
			description: 'Pon a prueba lo aprendido y gana puntos extra.',
			badge: 'Próximamente'
		}
	];
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each activities as activity (activity.title)}
		<Card.Root>
			<Card.Header>
				<activity.icon class="size-5 text-muted-foreground" />
				<Card.Title class="text-base">{activity.title}</Card.Title>
				<Card.Description>{activity.description}</Card.Description>
			</Card.Header>
			<Card.Content>
				<Badge variant="outline">{activity.badge}</Badge>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
