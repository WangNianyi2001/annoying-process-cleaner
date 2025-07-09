import * as Process from './system-resources/process.mjs';
import * as Service from './system-resources/services.mjs';
import * as ScheduledTask from './system-resources/scheduled-task.mjs';
import * as Registry from './system-resources/registry.mjs';

import { Log, SetStatusBarText, LogNonExistingWarning, LogFailingError } from './utils/log.mjs';
function StandardClean<Descriptor, Info>(
	api: SystemResourceApi<Descriptor, Info>,
	config: Optional<{
		mode: 'delete' | 'suspend';
		notFoundMessage: (descriptor: Descriptor) => string;
		filter?: (info: Info) => boolean,
		statusText: (info: Info) => string;
		succeedMessage: (info: Info) => string;
		failedMessage: (info: Info, err?: any) => string;
	}> = {}
): (descriptor: Descriptor) => Promise<boolean> {
	return async descriptor => {
		try {
			const info = await api.Query(descriptor);
			if(!info || !(config.filter?.(info) ?? true)) {
				LogNonExistingWarning(config.notFoundMessage?.(descriptor));
				return false;
			}
			SetStatusBarText(config?.statusText?.(info));
			try {
				await (config.mode === 'suspend' ? api.Suspend : api.Delete)!.call(null, info);
			}
			catch(e) {
				Log(config.failedMessage?.(info), 'error');
				throw e;
			}
			Log(config.succeedMessage?.(info));

			return true;
		}
		catch(e) {
			LogFailingError(e);
			return false;
		}
	};
}

// Export

export const cleaners: {
	[type: string]: ((descriptor: any) => Promise<boolean>)
} = {
	'process': StandardClean(Process.api, {
		mode: 'delete',
		notFoundMessage: descriptor => `Cannot find process "${descriptor.name}".`,
		statusText: info => `Killing process ${info.name}.`,
		succeedMessage: info => `Killed process "${info.name}".`,
		failedMessage: info => `Failed to kill process "${info.name}".`,
	}),
	'service': StandardClean(Service.api, {
		mode: 'suspend',
		notFoundMessage: descriptor => `Cannot find service "${descriptor.name || descriptor.displayName}".`,
		filter: info => info.state === 'RUNNING',
		statusText: info => `Suspending service ${info.name}.`,
		succeedMessage: info => `Suspended service "${info.name}".`,
		failedMessage: info => `Failed to suspend service "${info.name}".`,
	}),
	'scheduled-task': StandardClean(ScheduledTask.api, {
		mode: 'suspend',
		notFoundMessage: descriptor => `Cannot find scheduled task "${descriptor.name}".`,
		filter: info => info.status === 'Ready',
		statusText: info => `Suspending scheduled task ${info.name}.`,
		succeedMessage: info => `Suspended scheduled task "${info.name}".`,
		failedMessage: info => `Failed to suspend scheduled task "${info.name}".`,
	}),
	'registry': StandardClean(Registry.api, {
		mode: 'delete',
		notFoundMessage: descriptor => `Cannot find registry "${descriptor.path.replaceAll('/', '\\')}\\${descriptor.name}".`,
		statusText: info => `Suspending registry ${info.fullPath}.`,
		succeedMessage: info => `Suspended registry "${info.fullPath}".`,
		failedMessage: info => `Failed to suspend registry "${info.fullPath}".`,
	}),
	async 'registry/run'(descriptor: RegistryRunDescriptor) {
		const paths = [
			'HKCU/Software/Microsoft/Windows/CurrentVersion/RunNotification',
			'HKLM/Software/Microsoft/Windows/CurrentVersion/RunNotification',
		];
		let success = false;
		for(const path of paths) {
			success ||= await StandardClean(Registry.api, {
				mode: 'delete',
				notFoundMessage: descriptor => `Cannot find registry "${descriptor.path.replaceAll('/', '\\')}\\${descriptor.name}".`,
				statusText: info => `Suspending registry ${info.fullPath}.`,
				succeedMessage: info => `Suspended registry "${info.fullPath}".`,
				failedMessage: info => `Failed to suspend registry "${info.fullPath}".`,
			})({
				type: 'registry',
				path: path,
				name: descriptor.name,
				action: 'delete',
			});
		}
		return success;
	},
	async 'registry/run-notification'(descriptor: RegistryRunNotificationDescriptor) {
		const paths = [
			'HKCU/Software/Microsoft/Windows/CurrentVersion/Run',
			'HKLM/Software/Microsoft/Windows/CurrentVersion/Run',
		];
		let success = false;
		for(const path of paths) {
			success ||= await StandardClean(Registry.api, {
				mode: 'delete',
				notFoundMessage: descriptor => `Cannot find registry "${descriptor.path.replaceAll('/', '\\')}\\${descriptor.name}".`,
				statusText: info => `Suspending registry ${info.fullPath}.`,
				succeedMessage: info => `Suspended registry "${info.fullPath}".`,
				failedMessage: info => `Failed to suspend registry "${info.fullPath}".`,
			})({
				type: 'registry',
				path: path,
				name: descriptor.name,
				action: 'delete',
			});
		}
		return success;
	},
};