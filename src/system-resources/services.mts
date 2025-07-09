type ServiceInfo = {
	name: string;
	displayName: string;
	type: 'WIN32_SHARE_PROCESS' | 'WIN32_OWN_PROCESS' | 'WIN32' | 'ERROR' | 'USER_SHARE_PROCESS INSTANCE' | 'USER_OWN_PROCESS INSTANCE' | 'WIN32_PACKAGED_PROCESS';
	state: 'STOPPED' | 'RUNNING';
	tags: ('STOPPABLE' | 'NOT_PAUSABLE' | 'IGNORES_SHUTDOWN' | 'ACCEPTS_PRESHUTDOWN')[];
};

let services: ServiceInfo[] | null = null;

export const api: SystemResourceApi<ServiceDescriptor, ServiceInfo> = {
	async Query(descriptor: ServiceDescriptor) {
		if(services === null)
			services = await FetchServices();

		return services!.find(service => {
			if(descriptor.name)
				return service.name === descriptor.name;
			if(descriptor.displayName)
				return service.displayName == descriptor.displayName;
			return false;
		}) ?? null;
	},
	async Suspend(serviceInfo: ServiceInfo) {
		await Exec(`sc stop "${serviceInfo.name}"`);
		await Exec(`sc config "${serviceInfo.name}" start=manual`);
	},
};

import { Exec } from '../utils/cmd.mjs';

async function FetchServices(): Promise<ServiceInfo[]> {
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