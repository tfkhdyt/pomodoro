<script lang="ts">
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import {
		EllipsisVerticalIcon,
		ListChecksIcon,
		RotateCcwIcon,
		Trash2Icon
	} from 'lucide-svelte';
	import { Button } from '../ui/button';
	import type { Task } from '@/types';
	import { confirm } from '@tauri-apps/api/dialog';
	import { sendNotification } from '@tauri-apps/api/notification';

	export let tasks: Task[];
	export let save: () => Promise<void>;

	async function clearFinishedTasks() {
		const confirmed = await confirm(
			'Are you sure want to clear all finished tasks?'
		);

		if (confirmed) {
			tasks = tasks.filter((task) => task.done === false);
			await save();

			sendNotification('Finished tasks has been cleared');
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button size="icon" variant="ghost" class="hover:bg-white">
			<EllipsisVerticalIcon />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Item on:click={clearFinishedTasks} class="cursor-pointer">
				<ListChecksIcon class="w-4 h-4 mr-2" />
				Clear finished tasks
			</DropdownMenu.Item>
			<DropdownMenu.Item>
				<RotateCcwIcon class="w-4 h-4 mr-2" />
				Reset act pomodoros
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				<Trash2Icon class="w-4 h-4 mr-2" />
				Clear all tasks
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
