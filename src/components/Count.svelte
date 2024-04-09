<script lang="ts">
	import { match } from 'ts-pattern';
	import type { PomodoroType } from '@/types';

	export let resetReps: () => Promise<void>;
	export let reps: number;
	export let pomodoroType: PomodoroType;
</script>

<div class="md:text-lg mt-4">
	<button
		type="button"
		on:click={resetReps}
		class="text-gray-300 hover:text-white focus:outline-none"
	>
		#{reps}
	</button>
	<h3 class="font-medium select-none cursor-default">
		{match(pomodoroType)
			.with('pomodoro', () => 'Time to focus!')
			.otherwise(() => 'Time for a break!')}
	</h3>
</div>
