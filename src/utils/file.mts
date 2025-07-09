import * as Fs from 'fs/promises';

export async function PathExists(path: string) {
	try {
		await Fs.access(path, Fs.constants.F_OK);
		return true;
	}
	catch {
		return false;
	}
}

export async function IsFile(path: string) {
	return await PathExists(path) && await Fs.stat(path).then(s => s.isFile);
}

export async function IsDirectory(path: string) {
	return await PathExists(path) && await Fs.stat(path).then(s => s.isDirectory);
}