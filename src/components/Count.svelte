<script lang="ts">
	import { match } from 'ts-pattern';
	import type { PomodoroType } from '@/types';
	import type { LayoutData } from '../routes/$types';

	export let data: LayoutData;
	export let resetReps: () => Promise<void>;
	export let reps: number;
	export let pomodoroType: PomodoroType;

	$: currentTaskTitle = data.appData.tasks.find((it) => it.id === data.appData.activeTask)?.title;
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
		{currentTaskTitle ??
			match(pomodoroType)
				.with('pomodoro', () => 'Time to focus!')
				.otherwise(() => 'Time for a break!')}
	</h3>
</div>
