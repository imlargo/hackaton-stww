<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils';
	import { getBadgeStates, type GamificationStats } from '$lib/config';
	import LockIcon from '@lucide/svelte/icons/lock';

	let {
		stats,
		class: className
	}: {
		stats: GamificationStats;
		class?: string;
	} = $props();

	const states = $derived(getBadgeStates(stats));
</script>

<div class={cn('grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7', className)}>
	{#each states as { badge, unlocked } (badge.id)}
		<Tooltip.Root delayDuration={150}>
			<Tooltip.Trigger class="w-full">
				{#snippet child({ props })}
					<div
						{...props}
						class={cn(
							'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:-translate-y-0.5',
							unlocked
								? 'border-primary/30 bg-primary/5 shadow-sm'
								: 'border-dashed border-border text-muted-foreground'
						)}
					>
						<div
							class={cn(
								'relative flex size-10 items-center justify-center rounded-full',
								unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
							)}
						>
							{#if unlocked}
								<badge.icon class="size-5" />
							{:else}
								<LockIcon class="size-4" />
							{/if}
						</div>
						<span class="text-xs leading-tight font-medium">{badge.name}</span>
					</div>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content class="max-w-48 text-center">
				<p class="font-medium">{badge.name}</p>
				<p class="text-background/80">{badge.description}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{/each}
</div>
