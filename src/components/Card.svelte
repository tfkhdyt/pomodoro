<script lang="ts">
	import { match } from 'ts-pattern';
	import { type ButtonState } from '@/types';
	import ToggleButton from './buttons/ToggleButton.svelte';
	import SkipButton from './buttons/SkipButton.svelte';
	import SettingDialog from './SettingDialog.svelte';
	import type { LayoutData } from '../routes/$types';
	import { cn } from '@/utils';

	export let data: LayoutData;

	export let timer: string;
	export let handleClick: () => void;
	export let buttonState: ButtonState;
	export let nextStep: () => Promise<void>;
</script>

<div
	class={cn(
		'w-[450px] md:w-[500px] mx-auto py-8 md:py-10 rounded-xl space-y-4 md:space-y-6 transition duration-500',
		match(data.appData.pomodoroState)
			.with('pomodoro', () => 'bg-[#c15c5c]')
			.with('short-break', () => 'bg-[#4c9196]')
			.with('long-break', () => 'bg-[#4d7fa2]')
			.exhaustive()
	)}>
	<h1 class="mx-auto font-bold text-2xl md:text-3xl select-none cursor-default">
		{match(data.appData.pomodoroState)
			.with('pomodoro', () => 'Pomodoro')
			.with('short-break', () => 'Short Break')
			.with('long-break', () => 'Long Break')
			.exhaustive()}
	</h1>
	<h2
		class="font-bold font-rounded text-8xl md:text-9xl tracking-wide select-none cursor-default text-center mx-auto">
		{timer}
	</h2>

	<div class="relative flex">
		<SettingDialog {data} />
		<ToggleButton
			{buttonState}
			{handleClick}
			pomodoroType={data.appData.pomodoroState} />
		{#if buttonState === 'playing'}
			<SkipButton {nextStep} />
		{/if}
	</div>
</div>
