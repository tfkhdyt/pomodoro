export type PomodoroType = 'pomodoro' | 'short-break' | 'long-break';
export type ButtonState = 'playing' | 'paused';

export type Config = {
	timer: {
		time: {
			pomodoro: number;
			shortBreak: number;
			longBreak: number;
		};
		autoStart: {
			breaks: boolean;
			pomodoros: boolean;
		};
		longBreakInterval: number;
	};
};
