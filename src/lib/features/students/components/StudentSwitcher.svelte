<script lang="ts">
	import Select from '$lib/components/base/select/Select.svelte';
	import type { Student } from '$lib/types/domain/student';

	let {
		students,
		value = $bindable(null)
	}: {
		students: Student[];
		value: string | null;
	} = $props();

	const options = $derived(
		students.map((student) => ({
			value: student.id,
			label: student.grade ? `${student.name} — ${student.grade}` : student.name
		}))
	);
</script>

<div class="flex items-center gap-2">
	<span class="text-sm text-muted-foreground whitespace-nowrap">Modo demo, ver como:</span>
	<Select {options} value={value ?? undefined} onchange={(v: string) => (value = v || null)} />
</div>
