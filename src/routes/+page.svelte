<script lang="ts">
	import Card from '@/components/Card.svelte';
	import Count from '@/components/Count.svelte';
	import Progress from '@/components/ui/progress/progress.svelte';
	import type { ButtonState, PomodoroType } from '@/types';
	import { cn } from '@/utils';
	import { confirm } from '@tauri-apps/api/dialog';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/api/notification';
	import { appWindow } from '@tauri-apps/api/window';
	import { onDestroy } from 'svelte';
	import { match } from 'ts-pattern';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let permissionGranted: boolean;
	(async () => {
		permissionGranted = await isPermissionGranted();
	})();

	$: longBreakInterval = data.config.timer.longBreakInterval;

	let pomodoroType: PomodoroType = 'pomodoro';
	let buttonState: ButtonState = 'paused';

	let reps = 1;
	$: targetMinutes = match(pomodoroType)
		.with('pomodoro', () => data.config.timer.time.pomodoro)
		.with('short-break', () => data.config.timer.time.shortBreak)
		.with('long-break', () => data.config.timer.time.longBreak)
		.exhaustive();
	$: timeLeft = targetMinutes * 60;
	$: timer = `${Math.floor(timeLeft / 60)
		.toString()
		.padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
	$: progress = 100 - (timeLeft / 60 / targetMinutes) * 100;

	let intervalId: number;

	$: if (!permissionGranted) {
		askNotifPermission();
	}

	$: (async () => {
		switch (pomodoroType) {
			case 'pomodoro':
				await appWindow.setTitle('Time to focus! — Pomodoro');
				break;
			case 'short-break':
			case 'long-break':
				await appWindow.setTitle('Time for a break! — Pomodoro');
				break;
		}
	})();

	async function askNotifPermission() {
		const permission = await requestPermission();
		permissionGranted = permission === 'granted';
	}

	function updateTimer() {
		timeLeft--;
		const minutes = Math.floor(timeLeft / 60);
		const seconds = timeLeft % 60;

		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = seconds.toString().padStart(2, '0');

		timer = `${formattedMinutes}:${formattedSeconds}`;

		if (timeLeft < 0) {
			nextStep();
		}
	}

	async function nextStep() {
		clearInterval(intervalId);

		if (!permissionGranted) {
			await askNotifPermission();
		}

		pause();
		if (pomodoroType === 'pomodoro' && reps % longBreakInterval !== 0) {
			sendNotification({ title: 'Time to take a short break!' });
			pomodoroType = 'short-break';
			// if (data.config.timer.autoStart.breaks) {
			// 	startInterval();
			// }
		} else if (pomodoroType === 'pomodoro' && reps % longBreakInterval === 0) {
			sendNotification({ title: 'Time to take a long break!' });
			pomodoroType = 'long-break';
			// if (data.config.timer.autoStart.breaks) {
			// 	startInterval();
			// }
		} else {
			reps++;
			sendNotification({ title: 'Time to focus!' });
			pomodoroType = 'pomodoro';
			// if (data.config.timer.autoStart.pomodoros) {
			// 	startInterval();
			// }
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
		const confirmed = await confirm('Do you want to reset the pomodoro count?', {
			type: 'warning'
		});

		if (confirmed) {
			pause();
			reps = 1;
			pomodoroType = 'pomodoro';
			timeLeft = targetMinutes * 60;
		}
	}

	function handleClick() {
		if (buttonState === 'paused') {
			startInterval();
		} else {
			pause();
		}
	}

	onDestroy(() => clearInterval(intervalId));
</script>

<main
	class={cn(
		'mx-auto flex min-h-[100svh] flex-col justify-center text-center text-white transition duration-500',
		match(pomodoroType)
			.with('pomodoro', () => 'bg-[#BA4949]')
			.with('short-break', () => 'bg-[#38858a]')
			.with('long-break', () => 'bg-[#397097]')
			.exhaustive()
	)}
>
	<Progress
		value={progress}
		class={cn(
			'w-[450px] md:w-[500px] mx-auto mb-4 h-2 dark',
			match(pomodoroType)
				.with('pomodoro', () => 'bg-[#c15c5c]')
				.with('short-break', () => 'bg-[#4c9196]')
				.with('long-break', () => 'bg-[#4d7fa2]')
				.exhaustive()
		)}
	/>
	<Card {buttonState} {handleClick} {nextStep} {timer} {pomodoroType} {data} />
	<Count {pomodoroType} {reps} {resetReps} />
</main>
