<script lang="ts">
	import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
	import { match } from 'ts-pattern';
	import type { LayoutData } from '../routes/$types';
	const appWindow = getCurrentWebviewWindow();

	export let data: LayoutData;
	export let resetReps: () => Promise<void>;
	export let reps: number;

	$: currentTaskTitle = data.appData.tasks.find(
		(it) => it.id === data.appData.activeTask
	)?.title;

	$: (async () => {
		switch (data.appData.pomodoroState) {
			case 'pomodoro':
				await appWindow.setTitle(
					`${currentTaskTitle ?? 'Time to focus!'} — Pomodoro`
				);
				break;
			case 'short-break':
			case 'long-break':
				await appWindow.setTitle(
					`${currentTaskTitle ?? 'Time for a break!'} — Pomodoro`
				);
				break;
		}
	})();
</script>

<div class="md:text-lg mt-4">
	<button
		type="button"
		on:click={resetReps}
		class="text-gray-300 hover:text-white focus:outline-none">
		#{reps}
	</button>
	<h3 class="font-medium select-none cursor-default">
		{currentTaskTitle ??
			match(data.appData.pomodoroState)
				.with('pomodoro', () => 'Time to focus!')
				.otherwise(() => 'Time for a break!')}
	</h3>
</div>
