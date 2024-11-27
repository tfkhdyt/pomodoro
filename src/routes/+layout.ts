export const prerender = true;
export const ssr = false;

import {
	BaseDirectory,
	exists,
	mkdir,
	readTextFile,
	writeTextFile
} from '@tauri-apps/plugin-fs';
import type { LayoutLoad } from './$types';
import type { Config, Data } from '@/types';
import { defaultConfig } from '@/constants';

export const load: LayoutLoad = async () => {
	const isConfigDirExists = await exists('', {
		baseDir: BaseDirectory.AppConfig
	});
	if (!isConfigDirExists) {
		await mkdir('', { baseDir: BaseDirectory.AppConfig });
	}

	const isConfigFileExists = await exists('config.json', {
		baseDir: BaseDirectory.AppConfig
	});
	if (!isConfigFileExists) {
		await writeTextFile('config.json', JSON.stringify(defaultConfig, null, 2), {
			baseDir: BaseDirectory.AppConfig
		});
	}

	const contents = await readTextFile('config.json', {
		baseDir: BaseDirectory.AppConfig
	});
	const currentConfig = JSON.parse(contents) as Config;

	const isDataDirExists = await exists('', {
		baseDir: BaseDirectory.AppData
	});
	if (!isDataDirExists) {
		await mkdir('', { baseDir: BaseDirectory.AppData });
	}

	const isDataFileExists = await exists('data.json', {
		baseDir: BaseDirectory.AppData
	});
	if (!isDataFileExists) {
		await writeTextFile(
			'data.json',
			JSON.stringify(
				{
					activeTask: null,
					tasks: [],
					reps: 1,
					pomodoroState: 'pomodoro',
					lastTime: null
				},
				null,
				2
			),
			{
				baseDir: BaseDirectory.AppData
			}
		);
	}

	const data = await readTextFile('data.json', {
		baseDir: BaseDirectory.AppData
	});
	const currentData = JSON.parse(data) as Data;
	currentData.reps ??= 1;
	currentData.pomodoroState ??= 'pomodoro';
	currentData.activeTask ??= null;
	currentData.tasks ??= [];
	currentData.lastTime ??= null;

	return { config: currentConfig, appData: currentData };
};
