type TaskInfo = {
	name: string;
	pid: string;
	sessionName: string;
	sessionNo: number;
	memUsage: string;
};

let taskList: TaskInfo[] | null = null;

export async function GetTaskList() {
	if(taskList === null)
		taskList = await FetchTaskList();
	return taskList;
}

import * as Csv from 'csv';
import { Exec } from './cmd.mjs';
async function FetchTaskList(): Promise<TaskInfo[]> {
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

	const results: TaskInfo[] = [];
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