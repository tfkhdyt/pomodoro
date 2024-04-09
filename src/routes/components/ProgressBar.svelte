<script lang="ts">
	import clsx from 'clsx';
	import { match } from 'ts-pattern';
	import type { PomodoroType } from '../../types';

	export let pomodoroType: PomodoroType;
	export let progress: number;
</script>

<div class="mx-auto mb-4">
	<div
		class={clsx(
			'w-[450px] md:w-[500px] rounded-full transition-all duration-500',
			match(pomodoroType)
				.with('pomodoro', () => 'bg-[#c15c5c]')
				.with('short-break', () => 'bg-[#4c9196]')
				.with('long-break', () => 'bg-[#4d7fa2]')
				.exhaustive()
		)}
	>
		<div
			class={clsx('p-0.5 rounded-full', progress > 0 ? 'bg-white' : 'bg-transparent')}
			style="width: {progress}%"
		></div>
	</div>
</div>
