type ScheduledTaskInfo = {
	name: string;
	path: string[];
	nextRunTime: string;
	status: 'Ready' | 'Disabled';
};

let scheduledTasks: ScheduledTaskInfo[] | null = null;

export const api: SystemResourceApi<ScheduledTaskDescriptor, ScheduledTaskInfo> = {
	async Query(descriptor: ScheduledTaskDescriptor) {
		if(scheduledTasks === null)
			scheduledTasks = await FetchScheduledTasks();
		return scheduledTasks!.find(task => task.name == descriptor.name) ?? null;
	},
	async Delete(info: ScheduledTaskInfo) {
		await Exec(`schtasks /Delete /TN "${info.name}" /F`);
	},
	async Suspend(info: ScheduledTaskInfo) {
		await Exec(`schtasks /End /TN "${info.name}"`);
	},
};

import * as Csv from 'csv';
import { Exec } from '../utils/cmd.mjs';
async function FetchScheduledTasks(): Promise<ScheduledTaskInfo[]> {
	const csv = await Exec('schtasks -query -fo csv');

	const table = await new Promise<string[][]>((res, rej) => Csv.parse(csv, {
		delimiter: ',',
		quote: '"',
	}, (err, records) => {
		if(err)
			return rej(err);
		res(records);
	}));
	table.shift();

	const results: ScheduledTaskInfo[] = [];
	for(const row of table) {
		const path = row[0];
		if(!path.includes('\\'))
			continue;
		const pathSteps = path.split('\\');
		pathSteps.shift();  // Skip the first \\.

		results.push({
			name: pathSteps.pop()!,
			path: pathSteps,
			nextRunTime: row[1],
			status: row[2] as any,
		});
	}
	return results;
}