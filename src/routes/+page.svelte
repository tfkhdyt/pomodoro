<script lang="ts">
	import { match } from 'ts-pattern';

	const time = {
		pomodoro: 25,
		'short-break': 5,
		'long-break': 15
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

	function nextStep() {
		clearInterval(intervalId);
		buttonState = 'paused';
		if (type === 'pomodoro' && reps % 4 !== 0) {
			type = 'short-break';
		} else if (type === 'pomodoro' && reps % 4 === 0) {
			type = 'long-break';
		} else {
			reps++;
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
