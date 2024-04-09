<script lang="ts">
	import { match } from 'ts-pattern';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/api/notification';
	import { appWindow } from '@tauri-apps/api/window';
	import clsx from 'clsx';
	import { confirm } from '@tauri-apps/api/dialog';
	import type { KeyboardEventHandler } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import type { ButtonState, PomodoroType } from '@/types';
	import Card from '@/components/Card.svelte';
	import Count from '@/components/Count.svelte';
	import Progress from '@/components/ui/progress/progress.svelte';

	const time = {
		pomodoro: 25,
		'short-break': 5,
		'long-break': 15
	};

	let pomodoroType: PomodoroType = 'pomodoro';
	let buttonState: ButtonState = 'paused';

	let reps = 1;
	$: targetMinutes = time[pomodoroType];
	$: timeLeft = targetMinutes * 60;
	$: timer = `${Math.floor(timeLeft / 60)
		.toString()
		.padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;
	$: progress = 100 - (timeLeft / 60 / targetMinutes) * 100;

	let intervalId: number;

	let permissionGranted: boolean;
	(async () => {
		permissionGranted = await isPermissionGranted();
	})();

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
		if (pomodoroType === 'pomodoro' && reps % 4 !== 0) {
			sendNotification({ title: 'Time to take a short break!' });
			pomodoroType = 'short-break';
		} else if (pomodoroType === 'pomodoro' && reps % 4 === 0) {
			sendNotification({ title: 'Time to take a long break!' });
			pomodoroType = 'long-break';
		} else {
			reps++;
			sendNotification({ title: 'Time to focus!' });
			pomodoroType = 'pomodoro';
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

	let keysPressed: Record<string, boolean | undefined> = {};
	const onKeyDown: KeyboardEventHandler<Window> = (e) => {
		keysPressed[e.key] = true;

		if (keysPressed['Control'] && e.code === 'Space' && buttonState === 'playing') {
			return nextStep();
		}
		if (e.code === 'Space') {
			return handleClick();
		}
		if (e.code === 'Backspace') {
			return resetReps();
		}
	};

	const onKeyUp: KeyboardEventHandler<Window> = (e) => {
		keysPressed[e.key] = undefined;
	};

	onDestroy(() => clearInterval(intervalId));
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} on:keyup|preventDefault={onKeyUp} />

<main
	class={clsx(
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
		class={clsx(
			'w-[450px] md:w-[500px] mx-auto mb-4 h-2 dark',
			match(pomodoroType)
				.with('pomodoro', () => 'bg-[#c15c5c]')
				.with('short-break', () => 'bg-[#4c9196]')
				.with('long-break', () => 'bg-[#4d7fa2]')
				.exhaustive()
		)}
	/>
	<Card {buttonState} {handleClick} {nextStep} {timer} {pomodoroType} />
	<Count {pomodoroType} {reps} {resetReps} />
</main>
