import type { Config } from '@/types';

export const defaultConfig: Config = {
	timer: {
		time: {
			pomodoro: 25,
			shortBreak: 5,
			longBreak: 15
		},
		autoStart: {
			breaks: false,
			pomodoros: false
		},
		longBreakInterval: 4
	},
	task: {
		autoCheckTasks: false,
		autoSwitchTasks: true
	}
};
