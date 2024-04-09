<script lang="ts">
	import { fade } from 'svelte/transition';

	export let nextStep: () => Promise<void>;
</script>

<button
	type="button"
	on:click={nextStep}
	class="absolute inset-y-0 right-14 mt-2 focus:outline-none"
	transition:fade={{ duration: 200 }}
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		class="w-8 h-8 md:w-10 md:h-10"
	>
		<path
			d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v8.122c0 1.44 1.555 2.343 2.805 1.628L12 14.471v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.061C13.555 6.346 12 7.249 12 8.689v2.34L5.055 7.061Z"
		/>
	</svg>
</button>
