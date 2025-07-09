import Ora from 'ora';
const ora = Ora({
	suffixText: '...',
	discardStdin: false,
});

export function ShowStatusBar() {
	ora.start();
}

export function HideStatusBar() {
	ora.stop();
}

export function SetStatusBarText(text: any) {
	ora.text = text + '';
}

export function Log(message: any, level: 'log' | 'warn' | 'error' = 'log') {
	if(message === undefined)
		return;
	
	const isSpinning = ora.isSpinning;
	if(isSpinning)
		HideStatusBar();

	switch(level) {
	default:
	case 'log':
		console.log(message);
		break;
	case 'warn':
		console.warn(message);
		break;
	case 'error':
		console.error(message);
		break;
	}

	if(isSpinning)
		ShowStatusBar();
}

import { logNotFoundWarnings, logFailingErrors } from '../utils/env.mjs';

export function LogNonExistingWarning(message: any) {
	if(!logNotFoundWarnings)
		return;
	Log(message, 'warn');
}

export function LogFailingError(message: any) {
	if(!logFailingErrors)
		return;
	message = message?.message || message;
	message = '' + message;
	message = (message as string).trim();
	Log(message, 'error');
}