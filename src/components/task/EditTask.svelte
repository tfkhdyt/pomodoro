<script lang="ts">
	import * as Dialog from '@/components/ui/dialog';
	import { Input } from '../ui/input';
	import { Label } from '../ui/label';
	import { Textarea } from '../ui/textarea';
	import { Button } from '../ui/button';
	import { SaveIcon } from 'lucide-svelte';
	import { showEditTaskModal, editTaskData } from '@/stores/edit-task';
	import { sendNotification } from '@tauri-apps/api/notification';
	import type { Data } from '@/types';

	export let appData: Data;
	export let save: () => Promise<void>;

	$: addNote = !!$editTaskData.note;

	async function handleSave() {
		if (!$editTaskData.title) {
			return sendNotification({ title: 'Title should not be empty' });
		}

		appData.tasks = appData.tasks.map((task) => {
			if (task.id === $editTaskData.id) {
				return {
					...task,
					title: $editTaskData.title,
					note: $editTaskData.note,
					est: $editTaskData.est
				};
			}
			return task;
		});

		await save();

		sendNotification('Task has been updated');
		$showEditTaskModal = false;
	}
</script>

<Dialog.Root bind:open={$showEditTaskModal}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Task</Dialog.Title>
		</Dialog.Header>
		<div class="space-y-4">
			<Input
				required
				bind:value={$editTaskData.title}
				type="text"
				placeholder="What are you working on?"
				class="border-none ring-0 outline-none focus-visible:ring-0 rounded-none placeholder:text-lg placeholder:italic placeholder:text-gray-200 placeholder:font-semibold -ml-3 text-lg text-gray-700 font-semibold" />
			<div class="flex flex-col gap-3 mt-4">
				<Label for="est-pomodoros">Est Pomodoros</Label>
				<Input
					required
					type="number"
					id="est-pomodoros"
					placeholder="4"
					bind:value={$editTaskData.est}
					min={1}
					class="w-[80px]" />
			</div>
			{#if addNote}
				<Textarea bind:value={$editTaskData.note} placeholder="Some notes..." />
			{:else}
				<button
					class="underline font-medium text-sm"
					on:click={() => (addNote = true)}>+ Add Note</button>
			{/if}
		</div>
		<Dialog.Footer>
			<Button type="button" on:click={handleSave}>
				<SaveIcon class="w-4 h-4 mr-2" />
				Save
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
