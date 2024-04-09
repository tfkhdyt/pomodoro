<script lang="ts">
	import { SkipForwardIcon } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	export let nextStep: () => Promise<void>;
</script>

<button
	type="button"
	on:click={nextStep}
	class="absolute inset-y-0 right-16 mt-2 focus:outline-none"
	transition:fade={{ duration: 200 }}
>
	<SkipForwardIcon class="h-8 w-8" />
</button>
