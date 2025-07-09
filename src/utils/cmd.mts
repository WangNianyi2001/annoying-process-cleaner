import { exec } from 'child_process';

export function Exec(command: string): Promise<string> {
	const options = {};
	return new Promise((res, rej) => exec(command, options, (error, stdout, stderr) => {
		if(error)
			return rej(error);
		if(typeof stderr === 'string' && stderr.length > 0)
			return rej(stderr);
		res(stdout.toString().replaceAll('\r\n', '\n').replaceAll('\r', '\n'));
	}))
}

export async function CheckForSudoPriviledge() {
	try {
		await Exec('net session');
		return true;
	}
	catch {
		return false;
	}
}