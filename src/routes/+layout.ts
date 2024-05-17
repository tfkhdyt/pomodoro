export const prerender = true;
export const ssr = false;

import {
	BaseDirectory,
	createDir,
	exists,
	readTextFile,
	writeTextFile
} from '@tauri-apps/api/fs';
import type { LayoutLoad } from './$types';
import type { Config, Data } from '@/types';
import { defaultConfig } from '@/constants';

export const load: LayoutLoad = async () => {
	const isConfigDirExists = await exists('', { dir: BaseDirectory.AppConfig });
	if (!isConfigDirExists) {
		await createDir('', { dir: BaseDirectory.AppConfig });
	}

	const isConfigFileExists = await exists('config.json', {
		dir: BaseDirectory.AppConfig
	});
	if (!isConfigFileExists) {
		await writeTextFile('config.json', JSON.stringify(defaultConfig, null, 2), {
			dir: BaseDirectory.AppConfig
		});
	}

	const contents = await readTextFile('config.json', {
		dir: BaseDirectory.AppConfig
	});
	const currentConfig = JSON.parse(contents) as Config;

	const isDataDirExists = await exists('', { dir: BaseDirectory.AppData });
	if (!isDataDirExists) {
		await createDir('', { dir: BaseDirectory.AppData });
	}

	const isDataFileExists = await exists('data.json', {
		dir: BaseDirectory.AppData
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
				dir: BaseDirectory.AppData
			}
		);
	}

	const data = await readTextFile('data.json', { dir: BaseDirectory.AppData });
	const currentData = JSON.parse(data) as Data;
	currentData.reps ??= 1;
	currentData.pomodoroState ??= 'pomodoro';
	currentData.activeTask ??= null;
	currentData.tasks ??= [];
	currentData.lastTime ??= null;

	return { config: currentConfig, appData: currentData };
};
