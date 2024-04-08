<script lang="ts">
	import { match } from 'ts-pattern';
	import {
		isPermissionGranted,
		requestPermission,
		sendNotification
	} from '@tauri-apps/api/notification';
	import { appWindow } from '@tauri-apps/api/window';

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
				await appWindow.setTitle('Time to focus!');
				break;
			case 'short-break':
			case 'long-break':
				await appWindow.setTitle('Time for a break!');
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

		clearInterval(intervalId);
		buttonState = 'paused';
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
</script>

<h1>
	{match(type)
		.with('pomodoro', () => 'Pomodoro')
		.with('short-break', () => 'Short Break')
		.with('long-break', () => 'Long Break')
		.exhaustive()}
</h1>
<h2>{timer}</h2>
<h2>#{reps}</h2>

{#if buttonState === 'paused'}
	<button type="button" on:click={startInterval}>Start</button>
{:else}
	<button
		type="button"
		on:click={() => {
			clearInterval(intervalId);
			buttonState = 'paused';
		}}>Pause</button
	>
	<button type="button" on:click={nextStep}>Skip</button>
{/if}
