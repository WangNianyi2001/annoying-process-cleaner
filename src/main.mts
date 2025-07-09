import * as Fs from 'fs/promises';
import * as Path from 'path';
import * as Url from 'url';
const __dirname = Path.dirname(Url.fileURLToPath(import.meta.url));
const targetsDir = Path.resolve(__dirname, '../targets');

import { IsDirectory, IsFile, ReadDirRecursive } from './utils/file.mjs';
import { Log, ShowStatusBar, SetStatusBarText, HideStatusBar, LogFailingError } from './utils/log.mjs';
import { CheckForSudoPriviledge } from './utils/cmd.mjs';

async function Main() {
	// Print header.
	Log(await Fs.readFile(Path.resolve(__dirname, 'header.txt')).then(r => r.toString()));

	// Check for sudo priviledge.
	if(!await CheckForSudoPriviledge())
		Log('Not running with admin priviledge.', 'warn');
	Log('');

	// Check for targets dir.
	if(!await IsDirectory(targetsDir)) {
		Log('The targets directory does not exist, aborting.');
		return;
	}

	// Main logic.
	Log('Starting cleaning annoying processes.');
	for await(const targetFilePath of ReadDirRecursive(targetsDir)) {
		const targetSet = await TryParseTargetFile(targetFilePath);
		if(!targetSet)
			continue;
		if(targetSet.enabled === false)
			continue;
		await CleanTargetSet(targetSet);
	}
	Log('\nFinished cleaning annoying processes.');
}
Main();

async function TryParseTargetFile(path: string): Promise<TargetSet | null> {
	if(!await IsFile(path))
		return null;
	const parser = GetObjectParserByExtName<TargetSet>(Path.extname(path));
	if(!parser)
		return null;
	const content = await Fs.readFile(path).then(r => r.toString());
	const targetSet = parser(content);

	if(!CheckTargetSetFormat(targetSet)) {
		Log(`Target set at ${path} is malformed.`, 'warn');
		return null;
	}

	return targetSet;
}

import { jsonc as Jsonc } from 'jsonc';
import * as Yaml from 'yaml';
function GetObjectParserByExtName<T = any>(extName: string): ((content: string) => T) | null {
	switch(extName) {
		default:
			return null;
		case '.json':
		case '.jsonc':
			return Jsonc.parse;
		case '.yml':
			return Yaml.parse;
	}
}

function CheckTargetSetFormat(targetSet: TargetSet): boolean {
	if(typeof targetSet !== 'object')
		return false;
	if(typeof targetSet.name !== 'string')
		return false;
	if(!(targetSet.targets instanceof Array))
		return false;
	return true;
}

async function CleanTargetSet(targetSet: TargetSet) {
	Log(`\n${'='.repeat(16)} ${targetSet.name} ${'='.repeat(16)}`);

	let successCount = 0, count = 0;
	for(const target of targetSet.targets) {
		if(!(target instanceof Object))
			continue;
		if(target.enabled === false)
			continue;

		++count;
		const success = await CleanTarget(target);
		if(success)
			++successCount;
	}

	if(!successCount)
		Log(`(${count} checked, ${successCount} cleaned.)`);
}

import { cleaners } from './cleaners.mjs';
async function CleanTarget(descriptor: TargetDescriptor<any>) {
	if(!(descriptor.type in cleaners)) {
		Log(`Cannot handle target of type "${descriptor.type}".`, 'error');
		return false;
	}

	ShowStatusBar();
	const name = (descriptor as any).displayName || (descriptor as any).name;
	SetStatusBarText(`${descriptor.type}: ${name}`);

	let success = false;
	try {
		success = await cleaners[descriptor.type](descriptor);
	}
	catch(e) {
		Log(`Error when cleaning ${descriptor.type}: ${name}`);
		LogFailingError(e);
		success = false;
	}

	HideStatusBar();
	return success;
}