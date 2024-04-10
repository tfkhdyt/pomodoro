<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Task } from '@/types';
	import { BaseDirectory, writeTextFile } from '@tauri-apps/api/fs';
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
				<TaskItem appData={data.appData} {item} {save} />
			{/each}
		</div>
	{/if}

	<AddTask {data} {save} />
</section>
