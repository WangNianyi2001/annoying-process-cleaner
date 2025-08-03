type ProcessInfo = {
	name: string;
	pid: string;
	sessionName: string;
	sessionNo: number;
	memUsage: string;
};

let processes: ProcessInfo[] | null = null;

export const api: SystemResourceApi<ProcessDescriptor, ProcessInfo> = {
	async Query(descriptor: ProcessDescriptor) {
		if(!descriptor.name)
			return null;

		if(processes === null)
			processes = await FetchProcesses();

		return processes.find(process => process.name == `${descriptor.name}.exe`) ?? null;
	},
	async Delete(processInfo: ProcessInfo) {
		await Exec(`taskkill /F /IM "${processInfo.name}"`);
	},
};

import * as Csv from 'csv';
import { Exec } from '../utils/cmd.mjs';
import { SetStatusBarText } from '../utils/log.mjs';
async function FetchProcesses(): Promise<ProcessInfo[]> {
	SetStatusBarText(`Fetching processes`);
	const csv = await Exec('tasklist /fo csv');

	const table = await new Promise<string[][]>((res, rej) => Csv.parse(csv, {
		delimiter: ',',
		quote: '"',
	}, (err, records) => {
		if(err)
			return rej(err);
		res(records);
	}));
	table.shift();

	const results: ProcessInfo[] = [];
	for(const row of table) {
		results.push({
			name: row[0],
			pid: row[1],
			sessionName: row[2],
			sessionNo: +row[3],
			memUsage: row[4],
		});
	}
	return results;
}