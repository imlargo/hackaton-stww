<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { cn } from '$lib/utils';
	import type { Student } from '$lib/types/domain/student';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import MedalIcon from '@lucide/svelte/icons/medal';

	let {
		students,
		currentStudentId
	}: {
		students: Student[];
		currentStudentId: string | null;
	} = $props();

	const ranked = $derived([...students].sort((a, b) => b.points - a.points));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2 text-muted-foreground">
			<TrophyIcon class="size-4" />
			<Card.Description>Scoreboard del colegio</Card.Description>
		</div>
		<Card.Title class="text-lg">Ranking de estudiantes</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col gap-1">
		{#each ranked as student, index (student.id)}
			<div
				class={cn(
					'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm',
					student.id === currentStudentId && 'bg-primary/10 font-medium'
				)}
			>
				<div class="flex items-center gap-2">
					{#if index < 3}
						<MedalIcon
							class={cn(
								'size-4',
								index === 0 && 'text-yellow-500',
								index === 1 && 'text-zinc-400',
								index === 2 && 'text-amber-700'
							)}
						/>
					{:else}
						<span class="w-4 text-center text-xs text-muted-foreground">{index + 1}</span>
					{/if}
					<span>{student.name}</span>
				</div>
				<span class="text-muted-foreground">{student.points} pts</span>
			</div>
		{/each}
	</Card.Content>
</Card.Root>
