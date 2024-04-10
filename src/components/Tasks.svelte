<script lang="ts">
	import { cn } from '@/utils';
	import { CircleCheckIcon, SaveIcon } from 'lucide-svelte';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { match } from 'ts-pattern';
	import * as Dialog from '@/components/ui/dialog';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import { Textarea } from './ui/textarea';
	import { Button } from './ui/button';
	import type { LayoutData } from '../routes/$types';
	import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
	import { invalidateAll } from '$app/navigation';
	import { sendNotification } from '@tauri-apps/api/notification';
	import type { Task } from '@/types';
	import * as Alert from './ui/alert';

	export let data: LayoutData;

	const flipDurationMs = 200;
	function handleDnsConsider(e: CustomEvent<DndEvent<Task>>) {
		data.appData.tasks = e.detail.items;
	}
	async function handleDndFinalize(e: CustomEvent<DndEvent<Task>>) {
		data.appData.tasks = e.detail.items;
		await save();
	}

	let title: string | null = null;
	let estPomodoros = 1;
	let addNote = false;
	let note: string | null = null;

	let open = false;
	function onOpenChange() {
		open = !open;
		addNote = false;
	}

	async function save() {
		await writeTextFile('data.json', JSON.stringify(data.appData, null, 2), {
			dir: BaseDirectory.AppData
		});

		await invalidateAll();
	}

	async function handleSave() {
		if (!title) {
			return sendNotification({ title: 'Title should not be empty' });
		}

		data.appData.tasks.unshift({
			id: Date.now(),
			act: 0,
			done: false,
			est: estPomodoros,
			title,
			note
		});
		await save();

		sendNotification('New task has been added');
		open = false;
		estPomodoros = 1;
		title = null;
		addNote = false;
		note = null;
	}

	async function toggleMark(id: number) {
		data.appData.tasks = data.appData.tasks.map((it) => {
			if (it.id === id) {
				it.done = !it.done;
			}
			return it;
		});

		const index = data.appData.tasks.findIndex((task) => task.id === id);

		if (index !== -1 && data.appData.tasks[index].done) {
			// Update tasks array directly (assuming prop is writable)
			const [movedTask] = data.appData.tasks.splice(index, 1);
			data.appData.tasks = [...data.appData.tasks.filter((it) => it.id !== id), movedTask];
		}

		await save();
	}

	async function setActiveTask(id: number) {
		data.appData.activeTask = id;
		await save();
	}
</script>

<section class="w-[450px] md:w-[500px] mx-auto text-left">
	<h3 class="font-bold text-lg py-4 border-b border-b-white/75 mb-4 select-none cursor-default">
		Tasks
	</h3>
	{#if data.appData.tasks.length > 0}
		<div
			use:dndzone={{
				items: data.appData.tasks,
				flipDurationMs,
				dropTargetStyle: {
					outline: 'rgba(255, 255, 255, 0.25) solid 2.5px',
					borderRadius: '0.375rem'
				}
			}}
			on:consider={handleDnsConsider}
			on:finalize={handleDndFinalize}
			class="space-y-2 overflow-scroll"
		>
			{#each data.appData.tasks as item (item.id)}
				<button
					animate:flip={{ duration: flipDurationMs }}
					class={cn(
						'w-full bg-white rounded-md py-3 pl-3 pr-5 text-slate-700 font-semibold border-l-[6px] focus:outline-none space-y-2',
						item.id === data.appData.activeTask
							? 'border-l-black'
							: 'border-l-transparent hover:border-l-slate-300'
					)}
					on:click={async () => await setActiveTask(item.id)}
				>
					<div class="flex justify-between items-center">
						<div class="flex items-center decoration-4">
							<button
								class="focus:outline-none"
								on:click|stopPropagation={async () => await toggleMark(item.id)}
							>
								<CircleCheckIcon
									class="w-10 h-10 mr-2 hover:opacity-75"
									fill={match(item.done)
										.with(false, () => '#dfdfdf')
										.with(true, () => '#BA4949')
										.exhaustive()}
									color="white"
								/>
							</button>
							<span class={cn(item.done && 'line-through opacity-50')}>
								{item.title}
							</span>
						</div>
						<div class="flex space-x-0.5 text-slate-400 items-baseline text-sm">
							<span class="text-xl font-semibold">{item.act}</span>
							<span>/</span>
							<span class="text-sm">{item.est}</span>
						</div>
					</div>

					{#if item.note}
						<Alert.Root class="block">
							<Alert.Description class="font-medium">
								{item.note}
							</Alert.Description>
						</Alert.Root>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<Dialog.Root {open} {onOpenChange}>
		<Dialog.Trigger class="w-full focus:outline-none">
			<button
				class={cn(
					'w-full bg-black/10 rounded-md p-5 text-white/55 hover:text-white/70 font-bold focus:outline-none border-white/55 hover:border-white/70 border-2 border-dashed mt-3'
				)}
			>
				Add Task
			</button></Dialog.Trigger
		>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Add New Task</Dialog.Title>
			</Dialog.Header>
			<div class="space-y-4">
				<Input
					required
					bind:value={title}
					type="text"
					placeholder="What are you working on?"
					class="border-none ring-0 outline-none focus-visible:ring-0 rounded-none placeholder:text-lg placeholder:italic placeholder:text-gray-200 placeholder:font-semibold -ml-3 text-lg text-gray-700 font-semibold"
				/>
				<div class="flex flex-col gap-3 mt-4">
					<Label for="est-pomodoros">Est Pomodoros</Label>
					<Input
						required
						type="number"
						id="est-pomodoros"
						placeholder="4"
						bind:value={estPomodoros}
						min={1}
						class="w-[80px]"
					/>
				</div>
				{#if addNote}
					<Textarea bind:value={note} placeholder="Some notes..." />
				{:else}
					<button class="underline font-medium text-sm" on:click={() => (addNote = true)}
						>+ Add Note</button
					>
				{/if}
			</div>
			<Dialog.Footer>
				<Button type="button" on:click={handleSave}>
					<SaveIcon class="w-4 h-4 mr-2" />
					Save</Button
				>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</section>
