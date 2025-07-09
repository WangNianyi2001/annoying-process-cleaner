type ServiceInfo = {
	name: string;
	displayName: string;
	type: 'WIN32_SHARE_PROCESS' | 'WIN32_OWN_PROCESS' | 'WIN32' | 'ERROR' | 'USER_SHARE_PROCESS INSTANCE' | 'USER_OWN_PROCESS INSTANCE' | 'WIN32_PACKAGED_PROCESS';
	state: 'STOPPED' | 'RUNNING';
	tags: ('STOPPABLE' | 'NOT_PAUSABLE' | 'IGNORES_SHUTDOWN' | 'ACCEPTS_PRESHUTDOWN')[];
};

let serviceList: ServiceInfo[] | null = null;

export async function GetServiceList() {
	if(serviceList === null)
		serviceList = await FetchServiceList();
	return serviceList;
}

import { Exec } from './cmd.mjs';

async function FetchServiceList(): Promise<ServiceInfo[]> {
	const results: ServiceInfo[] = [];

	const text = await Exec('sc query state=all');
	const blocks = text.split('\n\n')
		.filter(block => /\S/.test(block));
	for(const block of blocks) {
		const lines = block.split('\n')
			.filter(line => /\S/.test(line))
			.map(line => /^\s*(.*?)\s*$/.exec(line)![0]);

		let info: {
			[key in keyof ServiceInfo]?: ServiceInfo[key];
		} = {};
		for(let i = 0; i < lines.length; ++i) {
			const line = lines[i];
			const execResult = /^\s*(.*?)\s*:\s*(.*?)\s*$/.exec(line);
			if(!execResult)
				continue;
			const [key, value] = [execResult[1], execResult[2]];
			switch(key) {
			case 'SERVICE_NAME':
				info.name = value;
				break;
			case 'DISPLAY_NAME':
				info.displayName = value;
				break;
			case 'TYPE':
				info.type = value.split(/\s+/).slice(1).join(' ') as any;
				break;
			case 'STATE':
				info.state = value.split(/\s+/).slice(1).join(' ') as any;
				if(!lines[i + 1].includes(':')) {
					const content = lines[i + 1].match(/\((.+)\)/)![0];
					info.tags = content.split(/,\s*/) as any;
					++i;
				}
				break;
			}
		}
		results.push(info as ServiceInfo);
	}

	return results;
}