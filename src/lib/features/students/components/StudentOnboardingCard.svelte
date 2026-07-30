<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { School } from '$lib/types/domain/school';
	import SchoolIcon from '@lucide/svelte/icons/school';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';

	let { school }: { school: School } = $props();

	const hasCharacterization = $derived(school.characterization != null);
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2 text-muted-foreground">
			<SchoolIcon class="size-4" />
			<Card.Description>Tu colegio</Card.Description>
		</div>
		<Card.Title class="text-lg">{school.name}</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2 text-sm text-muted-foreground">
		{#if school.city || school.address}
			<div class="flex items-center gap-1.5">
				<MapPinIcon class="size-3.5 shrink-0" />
				<span>{[school.address, school.city].filter(Boolean).join(', ')}</span>
			</div>
		{/if}
		<Badge variant={hasCharacterization ? 'secondary' : 'outline'}>
			{hasCharacterization ? 'Caracterización completa' : 'Caracterización pendiente'}
		</Badge>
	</Card.Content>
</Card.Root>
