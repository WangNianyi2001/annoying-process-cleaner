import * as Fs from 'fs/promises';
import * as Path from 'path';

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
	return await PathExists(path) && await Fs.stat(path).then(s => s.isFile());
}

export async function IsDirectory(path: string) {
	return await PathExists(path) && await Fs.stat(path).then(s => s.isDirectory());
}

export async function *ReadDirRecursive(root: string): AsyncGenerator<string> {
	if(!await IsDirectory(root))
		return;
	const children = await Fs.readdir(root);
	for(const child of children.map(child => Path.resolve(root, child))) {
		if(await IsFile(child)) {
			yield child;
			continue;
		}
		for await(const content of ReadDirRecursive(child))
			yield content;
	}
}