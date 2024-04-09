<script lang="ts">
	import { SettingsIcon } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
</script>

<button
	type="button"
	class="absolute inset-y-0 left-16 mt-2 focus:outline-none"
	transition:fade={{ duration: 200 }}
>
	<SettingsIcon class="h-8 w-8" />
</button>
