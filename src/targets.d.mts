type TargetSet = {
	name: string;
	contributors?: string[];
	enabled?: boolean;
	targets: TargetDescriptor<any>[];
}

interface TargetDescriptor<TypeName extends string> {
	type: TypeName;
	enabled?: boolean;
}

interface ProcessDescriptor extends TargetDescriptor<'process'> {
	displayName?: string;
	name?: string;
}

interface ServiceDescriptor extends TargetDescriptor<'service'> {
	displayName?: string;
	name?: string;
}

interface ScheduledTaskDescriptor extends TargetDescriptor<'scheduled-task'> {
	name: string;
}

interface RegistryDescriptor extends TargetDescriptor<'registry'> {
	path: string;
	name: string;
	action?: 'delete' | 'modify';
	value?: string | number;
}

interface RegistryRunDescriptor extends TargetDescriptor<'registry/run'> {
	name: string;
}

interface RegistryRunNotificationDescriptor extends TargetDescriptor<'registry/run-notification'> {
	name: string;
}