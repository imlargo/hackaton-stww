<script lang="ts">
	import { PageHeader, EmptyState } from '$lib/components/common';
	import ConstructionIcon from '@lucide/svelte/icons/construction';
</script>

<div class="flex flex-col gap-6">
	<PageHeader
		title="Unergy"
		description="Vista de Unergy: escuelas, métricas, contenido y lecciones, scoreboard y prospectos de colegios."
	/>

	<EmptyState
		title="Vista en construcción"
		description="Aquí vivirá la vista de gestión de Unergy."
	>
		{#snippet icon()}
			<ConstructionIcon class="size-5" />
		{/snippet}
	</EmptyState>
</div>
