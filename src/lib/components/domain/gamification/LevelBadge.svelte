<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils';
	import type { GamificationLevel } from '$lib/config';

	let {
		level,
		class: className
	}: {
		level: GamificationLevel;
		class?: string;
	} = $props();
</script>

<Badge class={cn('gap-1.5 border-transparent font-medium', level.badgeClass, className)}>
	<level.icon class="size-3.5" />
	{level.name}
</Badge>
