import type { Task } from '@/types';
import { writable } from 'svelte/store';

export const showEditTaskModal = writable(false);
export const editTaskData = writable<Task>({
	id: 0,
	act: 0,
	est: 0,
	done: false,
	note: '',
	title: ''
});
