import * as Fs from 'fs/promises';
import * as Path from 'path';
import * as Url from 'url';
const __dirname = Path.dirname(Url.fileURLToPath(import.meta.url));

// Entry

import { IsDirectory, IsFile } from './utils/file.mjs';
import { Log, ShowStatusBar, SetStatusBarText, HideStatusBar, LogFailingError } from './utils/log.mjs';
import { CheckForSudoPriviledge } from './utils/cmd.mjs';

async function Main() {
	// Get sudo priviledge
	if(!await CheckForSudoPriviledge())
		Log('Not running with admin priviledge.', 'warn');

	// Check for targets dir
	const targetsDir = Path.resolve(__dirname, '../targets');
	if(!await IsDirectory(targetsDir)) {
		Log('The targets directory does not exist, aborting.');
		return;
	}

	// Main logic
	Log('Starting cleaning annoying processes.');
	for(const target of await Fs.readdir(targetsDir)) {
		if(!/\.json(c?)$/i.test(target))
			continue;
		await ProcessTargetFile(Path.join(targetsDir, target));
	}
	Log('\nFinished cleaning annoying processes.');
}
Main();

// Logic

import { jsonc as Jsonc } from 'jsonc';
async function ProcessTargetFile(path: string) {
	if(!await IsFile(path)) {
		Log(`Target file at ${path} does not exist, skipping.`, 'warn');
		return;
	}
	const content = Jsonc.parse(await Fs.readFile(path).then(r => r.toString())) as TargetFile;
	if(!CheckTargetFileFormat(content))
		throw `Content is in the wrong format.`;

	if(content.enabled === false)
		return;

	Log(`\n${'='.repeat(16)} ${content.name} ${'='.repeat(16)}`);

	let successCount = 0;
	for(const target of content.targets) {
		if(!(target instanceof Object))
			continue;
		if(target.enabled === false)
			continue;
		const success = await ProcessTarget(target);
		if(success)
			++successCount;
	}
	if(!successCount)
		Log('(none processed)');
}

function CheckTargetFileFormat(content: TargetFile): boolean {
	if(typeof content !== 'object')
		return false;
	if(typeof content.name !== 'string')
		return false;
	if(!(content.targets instanceof Array))
		return false;
	return true;
}

import { processors } from './processors.mjs';
async function ProcessTarget(descriptor: TargetDescriptor<any>) {
	if(!(descriptor.type in processors)) {
		Log(`Cannot handle target of type "${descriptor.type}".`, 'error');
		return false;
	}

	ShowStatusBar();
	const name = (descriptor as any).displayName || (descriptor as any).name;
	SetStatusBarText(`${descriptor.type}: ${name}`);

	let success = false;
	try {
		success = await processors[descriptor.type](descriptor);
	}
	catch(e) {
		Log(`Error when processing ${descriptor.type}: ${name}`);
		LogFailingError(e);
		success = false;
	}

	HideStatusBar();
	return success;
}