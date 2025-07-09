import { Exec } from "../utils/cmd.mjs";

type RegistryInfo = {
	key: string;
	path: string;
	fullPath: string;
};

export const api: SystemResourceApi<RegistryDescriptor, RegistryInfo> = {
	async Query(descriptor: RegistryDescriptor) {
		const path = descriptor.path.replaceAll('/', '\\');
		const info: RegistryInfo = {
			key: descriptor.name,
			path: path,
			fullPath: `${path}\\${descriptor.name}`,
		};

		try {
			await Exec(`reg query "${info.fullPath}"`);
			return info;
		}
		catch {
			return null;
		}
	},
	async Delete(info: RegistryInfo) {
		await Exec(`reg delete "${info.path}" /v "${info.key}" /f`);
	}
};