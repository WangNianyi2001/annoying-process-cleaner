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

export function SetStatusBarText(text: string) {
	ora.text = text;
}

export function Log(message: any, level: 'log' | 'warn' | 'error' = 'log') {
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