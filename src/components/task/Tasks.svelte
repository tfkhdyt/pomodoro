<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Task } from '@/types';
	import { confirm } from '@tauri-apps/api/dialog';
	import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
	import { sendNotification } from '@tauri-apps/api/notification';
	import { dndzone, type DndEvent } from 'svelte-dnd-action';
	import type { LayoutData } from '../../routes/$types';
	import AddTask from './AddTask.svelte';
	import TaskItem from './TaskItem.svelte';

	export let data: LayoutData;

	const flipDurationMs = 200;
	function handleDnsConsider(e: CustomEvent<DndEvent<Task>>) {
		data.appData.tasks = e.detail.items;
	}
	async function handleDndFinalize(e: CustomEvent<DndEvent<Task>>) {
		data.appData.tasks = e.detail.items;
		await save();
	}

	async function save() {
		await writeTextFile('data.json', JSON.stringify(data.appData, null, 2), {
			dir: BaseDirectory.AppData
		});

		await invalidateAll();
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

	async function deleteTask(id: number) {
		const item = data.appData.tasks.find((it) => it.id === id);

		if (item) {
			const confirmed = await confirm(`Are you sure you want to delete this task? (${item.title})`);

			if (confirmed) {
				data.appData.tasks = data.appData.tasks.filter((it) => it.id !== id);
				await save();
				await sendNotification('Task has been deleted');
			}
		}
	}
</script>

<section class="w-[450px] md:w-[500px] mx-auto text-left space-y-4">
	<h3 class="font-bold text-lg py-4 border-b border-b-white/75 select-none cursor-default">
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
			<!-- animate:flip={{ duration: flipDurationMs }} -->

			{#each data.appData.tasks as item (item.id)}
				<TaskItem appData={data.appData} {deleteTask} {item} {setActiveTask} {toggleMark} />
			{/each}
		</div>
	{/if}

	<AddTask {data} {save} />
</section>
