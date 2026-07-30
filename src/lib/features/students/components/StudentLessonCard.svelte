<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Lesson } from '$lib/types/domain/lesson';
	import type { Animal } from '$lib/types/domain/animal';
	import CircleCheckBigIcon from '@lucide/svelte/icons/circle-check-big';
	import CircleIcon from '@lucide/svelte/icons/circle';

	let {
		lesson,
		animal,
		completed,
		oncomplete
	}: {
		lesson: Lesson;
		animal: Animal | null;
		completed: boolean;
		oncomplete: () => void;
	} = $props();

	let completing = $state(false);

	async function handleComplete() {
		completing = true;
		try {
			oncomplete();
		} finally {
			completing = false;
		}
	}
</script>

<Card.Root class={completed ? 'border-primary/30 bg-primary/5' : ''}>
	<Card.Header>
		<div class="flex items-start justify-between gap-2">
			<div class="flex flex-col gap-1">
				<Card.Title class="text-base">{lesson.title}</Card.Title>
				{#if lesson.description}
					<Card.Description>{lesson.description}</Card.Description>
				{/if}
			</div>
			{#if completed}
				<CircleCheckBigIcon class="size-5 shrink-0 text-primary" />
			{:else}
				<CircleIcon class="size-5 shrink-0 text-muted-foreground" />
			{/if}
		</div>
	</Card.Header>
	<Card.Content class="flex flex-col gap-3">
		{#if lesson.content}
			<p class="text-sm text-muted-foreground">{lesson.content}</p>
		{/if}
		<div class="flex items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				{#if animal}
					<Badge variant="outline">{animal.common_name ?? animal.name}</Badge>
				{/if}
				<Badge variant="secondary">+{lesson.points_reward} pts</Badge>
			</div>
			<Button
				size="sm"
				variant={completed ? 'outline' : 'default'}
				disabled={completed || completing}
				onclick={handleComplete}
			>
				{completed ? 'Completada' : 'Completar'}
			</Button>
		</div>
	</Card.Content>
</Card.Root>
