export const processors: { [type: string]: Function } = {
	'process': KillProcess,
	'service': SuppressService,
	'scheduled-task': DeleteScheduledTask,
	'registry': ProcessRegistry,
	'registry/run': DeleteRegistryRun,
	'registry/run-notification': DeleteRegistryRunNotification,
};

import { Exec } from './utils/cmd.mjs';
import { Log, SetStatusBarText } from './utils/log.mjs';

import { GetTaskList } from './utils/task-list.mjs';
export async function KillProcess(descriptor: ProcessDescriptor) {
	if(!descriptor.name)
		return;
	const processName = `${descriptor.name}.exe`;

	SetStatusBarText(`Fetching task list`);
	const taskList = await GetTaskList();

	const taskInfo = taskList.find(task => task.name == processName);
	if(!taskInfo) {
		Log(`Process "${processName}" not running.`);
		return;
	}

	SetStatusBarText(`Killing process "${processName}"`);

	try {
		await Exec(`taskkill /F /IM ${processName}`);
	} catch {
		Log(`Failed to kill process "${processName}".`, 'warn');
		return;
	}
	Log(`Killed process "${processName}".`);
}

import { GetServiceList } from './utils/service-list.mjs';
export async function SuppressService(descriptor: ServiceDescriptor) {
	const serviceName = descriptor.name || descriptor.displayName;
	if(!serviceName)
		return;

	SetStatusBarText(`Fetching service list`);
	const serviceList = await GetServiceList();

	const serviceInfo = serviceList.find(service => {
		if(descriptor.name)
			return service.name === descriptor.name;
		if(descriptor.displayName)
			return service.displayName == descriptor.displayName;
		return false;
	});
	if(!serviceInfo) {
		Log(`Service "${serviceName}" does not exist.`);
		return;
	}

	if(serviceInfo.state === 'RUNNING') {
		try {
			SetStatusBarText(`Stopping service "${serviceName}"`);
			await Exec(`sc stop "${serviceInfo.name}"`);
		} catch (err) {
			Log(`Failed to stop "${serviceName}".`, 'warn');
		}
		try {
			SetStatusBarText(`Setting service "${serviceName}"'s triggering method to manual`);
			await Exec(`sc config "${serviceInfo.name}" start=manual`);
			Log(`Set service "${serviceName}"'s triggering method to manual`);
		} catch (err) {
			Log(`Failed to set "${serviceName}"'s triggering method.`, 'warn');
		}
	}
	Log(`Suppressed service "${serviceName}".`);
}

export async function DeleteScheduledTask(descriptor: ScheduledTaskDescriptor) {
	const taskName = descriptor.name;
	if(!taskName)
		return;

	try {
		SetStatusBarText(`Deleting scheduled task "${taskName}"`);
		await Exec(`schtasks /Delete /TN "${taskName}" /F`);
		Log(`Deleted scheduled task "${taskName}".`);
	} catch (err) {
		Log(`Failed to delete task "${taskName}".`, 'warn');
	}
}

export async function ProcessRegistry(descriptor: RegistryDescriptor) {
	if(!descriptor.path)
		return;
	const path = descriptor.path.replaceAll('/', '\\');
	const name = descriptor.name;
	const fullName = `${path}\\${name}`;

	try {
		SetStatusBarText(`Processing registry at ${fullName}`);
		switch(descriptor.action) {
		case 'delete':
			try {
				await Exec(`reg delete "${path}" /v "${descriptor.name}" /f`);
				Log(`Deleted registry at ${fullName}.`);
			}
			catch(e) {
				if(typeof e !== 'object')
					throw e;
				const err = e as import("child_process").ExecException;
				if(!(err.message + '').includes('ERROR: The system was unable to find the specified registry key or value.'))
					throw e;
				Log(`Registry at ${fullName} does not exist.`);
			}
			finally {
				break;
			}
		default:
			throw `Registry processing method "${descriptor.action}" is not supported.`;
		}
	}
	catch(err) {
		Log(`Failed to process registry at ${fullName}.`, 'warn');
		Log(err, 'error');
	}
}

export async function DeleteRegistryRun(descriptor: RegistryRunDescriptor) {
	const paths = [
		'HKCU/Software/Microsoft/Windows/CurrentVersion/RunNotification',
		'HKLM/Software/Microsoft/Windows/CurrentVersion/RunNotification',
	];
	for(const path of paths) {
		await ProcessRegistry({
			type: 'registry',
			path: path,
			name: descriptor.name,
			action: 'delete',
		});
	}
}

export async function DeleteRegistryRunNotification(descriptor: RegistryRunNotificationDescriptor) {
	const paths = [
		'HKCU/Software/Microsoft/Windows/CurrentVersion/Run',
		'HKLM/Software/Microsoft/Windows/CurrentVersion/Run',
	];
	for(const path of paths) {
		await ProcessRegistry({
			type: 'registry',
			path: path,
			name: descriptor.name,
			action: 'delete',
		});
	}
}