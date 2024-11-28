<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Card from '@/components/Card.svelte';
	import Count from '@/components/Count.svelte';
	import Tasks from '@/components/task/Tasks.svelte';
	import Progress from '@/components/ui/progress/progress.svelte';
	import type { ButtonState } from '@/types';
	import { cn } from '@/utils';
	import { webviewWindow } from '@tauri-apps/api';
	import { invoke } from '@tauri-apps/api/core';
	import { TauriEvent } from '@tauri-apps/api/event';
	import { confirm } from '@tauri-apps/plugin-dialog';
	import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/plugin-notification';
	import { exit } from '@tauri-apps/plugin-process';
	import { onDestroy, onMount } from 'svelte';
	import { match } from 'ts-pattern';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	$: longBreakInterval = data.config.timer.longBreakInterval;

	let buttonState: ButtonState = 'paused';

	$: targetMinutes = match(data.appData.pomodoroState)
		.with('pomodoro', () => data.config.timer.time.pomodoro)
		.with('short-break', () => data.config.timer.time.shortBreak)
		.with('long-break', () => data.config.timer.time.longBreak)
		.exhaustive();
	$: timeLeft = targetMinutes * 60;
	$: timer = `${Math.floor(timeLeft / 60)
		.toString()
		.padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
	$: progress = 100 - (timeLeft / 60 / targetMinutes) * 100;

	let lastTimeInterval: number;
	onMount(async () => {
		timeLeft = data.appData.lastTime ?? targetMinutes * 60;

		lastTimeInterval = setInterval(async () => {
			data.appData.lastTime = timeLeft;
			await save();
		}, 5000);
	});

	let intervalId: number;

	let permissionGranted: boolean;
	(async () => {
		permissionGranted = await isPermissionGranted();
	})();

	$: if (!permissionGranted) {
		askNotifPermission();
	}

	webviewWindow
		.getCurrentWebviewWindow()
		.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
			data.appData.lastTime = timeLeft;
			await save();
			await exit();
		});

	async function askNotifPermission() {
		const permission = await requestPermission();
		permissionGranted = permission === 'granted';
	}

	async function updateTimer() {
		timeLeft--;
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;

		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = seconds.toString().padStart(2, '0');

		timer = `${formattedMinutes}:${formattedSeconds}`;

		if (timeLeft < 0) {
			await nextStep();
			await invoke('play_transition_audio');
		}
	}

	async function incrementActiveTaskAct() {
		if (data.appData.activeTask) {
			data.appData.tasks = data.appData.tasks.map((task) => {
				if (task.id === data.appData.activeTask) {
					return {
						...task,
						act: task.act + 1
					};
				}
				return task;
			});
			await save();
		}
	}

	async function autoCheckTask() {
		const activeTask = data.appData.tasks.find(
			(t) => t.id === data.appData.activeTask
		);

		if (
			data.config.task.autoCheckTasks &&
			activeTask &&
			activeTask.act >= activeTask.est
		) {
			data.appData.tasks = data.appData.tasks.map((t) => {
				if (t.id === data.appData.activeTask) {
					return {
						...t,
						done: true
					};
				}
				return t;
			});

			await save();

			if (data.config.task.autoSwitchTasks) {
				await switchTask(activeTask.id);
			}
		}
	}

	async function switchTask(id: number) {
		const task = data.appData.tasks.find((task) => task.id === id);

		if (task && task.done) {
			data.appData.tasks = [
				...data.appData.tasks.filter((it) => it.id !== id),
				task
			];

			const lastUndone = data.appData.tasks.findLast((it) => it.done === false);
			if (lastUndone) {
				data.appData.activeTask = lastUndone.id;
			}

			await save();
		}
	}

	async function nextStep() {
		clearInterval(intervalId);

		if (!permissionGranted) {
			await askNotifPermission();
		}

		pause();

		if (
			data.appData.pomodoroState === 'pomodoro' &&
			data.appData.reps % longBreakInterval !== 0
		) {
			sendNotification({ title: 'Time to take a short break!' });
			data.appData.pomodoroState = 'short-break';
			data.appData.lastTime = null;
			await save();
			timeLeft = targetMinutes * 60;

			await incrementActiveTaskAct();
			await autoCheckTask();

			if (data.config.timer.autoStart.breaks) {
				startInterval();
			}
		} else if (
			data.appData.pomodoroState === 'pomodoro' &&
			data.appData.reps % longBreakInterval === 0
		) {
			sendNotification({ title: 'Time to take a long break!' });
			data.appData.pomodoroState = 'long-break';
			data.appData.lastTime = null;
			await save();
			timeLeft = targetMinutes * 60;

			await incrementActiveTaskAct();
			await autoCheckTask();

			if (data.config.timer.autoStart.breaks) {
				startInterval();
			}
		} else {
			data.appData.reps = data.appData.reps + 1;
			sendNotification({ title: 'Time to focus!' });
			data.appData.pomodoroState = 'pomodoro';
			data.appData.lastTime = null;
			await save();
			timeLeft = targetMinutes * 60;

			if (data.config.timer.autoStart.pomodoros) {
				startInterval();
			}
		}
	}

	function startInterval() {
		buttonState = 'playing';

		clearInterval(intervalId);
		intervalId = setInterval(updateTimer, 1000);
	}

	function pause() {
		clearInterval(intervalId);
		buttonState = 'paused';
	}

	async function resetReps() {
		const confirmed = await confirm(
			'Do you want to reset the pomodoro count?',
			{
				kind: 'warning'
			}
		);

		if (confirmed) {
			pause();
			data.appData.reps = 1;
			data.appData.lastTime = null;
			data.appData.pomodoroState = 'pomodoro';
			await save();
			timeLeft = targetMinutes * 60;
		}
	}

	async function handleClick() {
		if (buttonState === 'paused') {
			startInterval();
		} else {
			pause();
		}
		await invoke('play_button_press');
	}

	async function save() {
		await writeTextFile('data.json', JSON.stringify(data.appData, null, 2), {
			baseDir: BaseDirectory.AppData
		});

		await invalidateAll();
	}

	onDestroy(() => {
		clearInterval(intervalId);
		clearInterval(lastTimeInterval);
	});
</script>

<main
	class={cn(
		'mx-auto flex min-h-[100svh] py-4 flex-col text-center text-white transition duration-500',
		match(data.appData.pomodoroState)
			.with('pomodoro', () => 'bg-[#BA4949]')
			.with('short-break', () => 'bg-[#38858a]')
			.with('long-break', () => 'bg-[#397097]')
			.exhaustive(),
		data.appData.tasks.length === 0 && 'justify-center'
	)}>
	<Progress
		value={progress}
		class={cn(
			'w-[450px] md:w-[500px] mx-auto mb-4 h-2 dark',
			match(data.appData.pomodoroState)
				.with('pomodoro', () => 'bg-[#c15c5c]')
				.with('short-break', () => 'bg-[#4c9196]')
				.with('long-break', () => 'bg-[#4d7fa2]')
				.exhaustive()
		)} />
	<Card {buttonState} {handleClick} {nextStep} {timer} {data} />
	<Count {data} reps={data.appData.reps} {resetReps} />
	<Tasks {data} {save} {switchTask} reps={data.appData.reps} {buttonState} />
</main>
