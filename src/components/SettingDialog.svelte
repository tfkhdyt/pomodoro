<script lang="ts">
	import * as Dialog from '@/components/ui/dialog';
	import SettingButton from './buttons/SettingButton.svelte';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { Switch } from '@/components/ui/switch';
	import { Button } from '@/components/ui/button';
	import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
	import { defaultConfig } from '@/constants';
	import type { LayoutData } from '../routes/$types';
	import { invalidateAll } from '$app/navigation';
	import { sendNotification } from '@tauri-apps/api/notification';
	import type { Config } from '@/types';
	import { RotateCcwIcon, SaveIcon } from 'lucide-svelte';

	export let data: LayoutData;

	async function saveConfig() {
		const newConfig: Config = {
			timer: {
				time: {
					pomodoro: Number(data.config.timer.time.pomodoro),
					shortBreak: Number(data.config.timer.time.shortBreak),
					longBreak: Number(data.config.timer.time.longBreak)
				},
				longBreakInterval: Number(data.config.timer.longBreakInterval),
				autoStart: data.config.timer.autoStart
			}
		};
		await writeTextFile('config.json', JSON.stringify(newConfig, null, 2), {
			dir: BaseDirectory.AppConfig
		});

		await invalidateAll();
		sendNotification({ title: 'Setting has been saved' });
	}

	async function restoreDefault() {
		await writeTextFile('config.json', JSON.stringify(defaultConfig, null, 2), {
			dir: BaseDirectory.AppConfig
		});

		await invalidateAll();
		sendNotification({ title: 'Setting has been restored to default' });
	}
</script>

<Dialog.Root>
	<Dialog.Trigger class="focus:outline-none"><SettingButton /></Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-lg">Settings</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-4">
			<h2 class="flex items-center font-medium text-slate-700">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6 mr-2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>
				Timer
			</h2>
			<div class="space-y-6">
				<div class="space-y-2">
					<p class="font-semibold text-slate-700">Time (minutes)</p>
					<div class="grid grid-cols-3 gap-6">
						<div>
							<Label for="pomodoro" class="font-medium text-slate-700">Pomodoro</Label>
							<Input
								type="text"
								id="pomodoro"
								placeholder="25"
								bind:value={data.config.timer.time.pomodoro}
							/>
						</div>
						<div>
							<Label for="short-break" class="font-medium text-slate-700">Short Break</Label>
							<Input
								type="number"
								id="short-break"
								placeholder="5"
								bind:value={data.config.timer.time.shortBreak}
							/>
						</div>
						<div>
							<Label for="long-break" class="font-medium text-slate-700">Long Break</Label>
							<Input
								type="number"
								id="long-break"
								placeholder="15"
								bind:value={data.config.timer.time.longBreak}
							/>
						</div>
					</div>
				</div>
				<div class="flex justify-between items-center">
					<Label for="auto-start-break" class="font-medium text-slate-700 w-full"
						>Auto Start Breaks</Label
					>
					<Switch id="auto-start-break" bind:checked={data.config.timer.autoStart.breaks} />
				</div>
				<div class="flex justify-between items-center">
					<Label for="auto-start-pomodoros" class="font-medium text-slate-700 w-full"
						>Auto Start Pomodoros</Label
					>
					<Switch id="auto-start-pomodoros" bind:checked={data.config.timer.autoStart.pomodoros} />
				</div>
				<div class="flex justify-between items-center">
					<Label for="long-break-interval" class="font-medium text-slate-700 w-full"
						>Long Break Interval</Label
					>
					<Input
						type="number"
						id="long-break-interval"
						placeholder="4"
						class="w-24"
						bind:value={data.config.timer.longBreakInterval}
					/>
				</div>
			</div>
		</div>
		<Dialog.Footer class="mt-4">
			<Button type="button" variant="destructive" on:click={restoreDefault}>
				<RotateCcwIcon class="h-4 w-4 mr-2" />
				Restore Default</Button
			>
			<Button type="button" on:click={saveConfig}>
				<SaveIcon class="h-4 w-4 mr-2" />
				Save changes</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
