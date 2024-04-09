<script lang="ts">
	import clsx from 'clsx';
	import { match } from 'ts-pattern';
	import { type PomodoroType, type ButtonState } from '@/types';
	import ToggleButton from './buttons/ToggleButton.svelte';
	import SkipButton from './buttons/SkipButton.svelte';
	import SettingButton from './buttons/SettingButton.svelte';

	export let pomodoroType: PomodoroType;
	export let timer: string;
	export let handleClick: () => void;
	export let buttonState: ButtonState;
	export let nextStep: () => Promise<void>;
</script>

<div
	class={clsx(
		'w-[450px] md:w-[500px] mx-auto py-8 md:py-10 rounded-xl space-y-4 md:space-y-6 transition duration-500',
		match(pomodoroType)
			.with('pomodoro', () => 'bg-[#c15c5c]')
			.with('short-break', () => 'bg-[#4c9196]')
			.with('long-break', () => 'bg-[#4d7fa2]')
			.exhaustive()
	)}
>
	<h1 class="mx-auto font-bold text-2xl md:text-3xl select-none cursor-default">
		{match(pomodoroType)
			.with('pomodoro', () => 'Pomodoro')
			.with('short-break', () => 'Short Break')
			.with('long-break', () => 'Long Break')
			.exhaustive()}
	</h1>
	<h2 class="font-bold font-rounded text-8xl md:text-9xl tracking-wide select-none cursor-default">
		{timer}
	</h2>

	<div class="relative flex">
		<SettingButton />
		<ToggleButton {buttonState} {handleClick} {pomodoroType} />
		{#if buttonState === 'playing'}
			<SkipButton {nextStep} />
		{/if}
	</div>
</div>
