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

	const time = {
		pomodoro: 0.3,
		'short-break': 0.1,
		'long-break': 0.2
	};

	let type: 'pomodoro' | 'short-break' | 'long-break' = 'pomodoro';
	let buttonState: 'playing' | 'paused' = 'paused';

	let reps = 1;
	$: targetMinutes = time[type];
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
		switch (type) {
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
		if (!permissionGranted) {
			await askNotifPermission();
		}

		pause();
		if (type === 'pomodoro' && reps % 4 !== 0) {
			sendNotification({ title: 'Time to take a short break!' });
			type = 'short-break';
		} else if (type === 'pomodoro' && reps % 4 === 0) {
			sendNotification({ title: 'Time to take a long break!' });
			type = 'long-break';
		} else {
			reps++;
			sendNotification({ title: 'Time to focus!' });
			type = 'pomodoro';
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
			reps = 1;
			type = 'pomodoro';
			timeLeft = targetMinutes * 60;
			buttonState = 'paused';
		}
	}
</script>

<main
	class={clsx(
		'mx-auto flex min-h-[100svh] flex-col justify-center text-center text-white transition duration-500',
		match(type)
			.with('pomodoro', () => 'bg-[#BA4949]')
			.with('short-break', () => 'bg-[#38858a]')
			.with('long-break', () => 'bg-[#397097]')
			.exhaustive()
	)}
>
	<div class="mx-auto mb-4">
		<div
			class={clsx(
				'w-[500px] rounded-full',
				match(type)
					.with('pomodoro', () => 'bg-[#c15c5c]')
					.with('short-break', () => 'bg-[#4c9196]')
					.with('long-break', () => 'bg-[#4d7fa2]')
					.exhaustive()
			)}
		>
			<div
				class={clsx(
					'text-xs font-medium text-center p-0.5 leading-none rounded-full transition-all ease-linear',
					progress > 0 ? 'bg-white' : 'bg-transparent',
					match(type)
						.with('pomodoro', () => 'text-[#BA4949]')
						.with('short-break', () => 'text-[#38858a]')
						.with('long-break', () => 'text-[#397097]')
						.exhaustive()
				)}
				style="width: {progress}%"
			></div>
		</div>
	</div>
	<div
		class={clsx(
			'w-[500px] mx-auto py-10 rounded-xl space-y-6 transition duration-500',
			match(type)
				.with('pomodoro', () => 'bg-[#c15c5c]')
				.with('short-break', () => 'bg-[#4c9196]')
				.with('long-break', () => 'bg-[#4d7fa2]')
				.exhaustive()
		)}
	>
		<h1 class={clsx('mx-auto font-bold text-3xl')}>
			{match(type)
				.with('pomodoro', () => 'Pomodoro')
				.with('short-break', () => 'Short Break')
				.with('long-break', () => 'Long Break')
				.exhaustive()}
		</h1>
		<h2 class="font-bold text-9xl">{timer}</h2>

		<div class="w-56 mx-auto pt-3">
			<div class="relative h-16 w-full bg-[#ebebeb] rounded-md">
				<button
					type="button"
					on:click={buttonState === 'paused' ? startInterval : pause}
					class={clsx(
						'w-full absolute flex h-full w-full items-center justify-center gap-3 rounded-md border border-[#ebebeb] p-2 text-2xl transition-all duration-200 lg:cursor-pointer uppercase font-bold',
						buttonState === 'paused'
							? 'left-0 -top-1.5 bg-slate-50'
							: '-left-0 -top-0 bg-slate-100',
						match(type)
							.with('pomodoro', () => 'text-[#BA4949]')
							.with('short-break', () => 'text-[#38858a]')
							.with('long-break', () => 'text-[#397097]')
							.exhaustive()
					)}>{buttonState === 'paused' ? 'Start' : 'Pause'}</button
				>
			</div>
		</div>
	</div>
	<div class="text-lg mt-4">
		<button type="button" on:click={resetReps} class="text-gray-300 hover:text-white">
			#{reps}
		</button>
		<h3 class="font-medium">
			{match(type)
				.with('pomodoro', () => 'Time to focus!')
				.otherwise(() => 'Time for a break!')}
		</h3>
	</div>
</main>
