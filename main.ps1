# Run as administrator

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
	[Security.Principal.WindowsBuiltInRole] "Administrator")
) {
	Write-Host "Try running with admin priviledge..."
	Start-Process -FilePath "powershell" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
	exit
}



# Auxiliary functions

function KillProcessByName($name) {
	$procs = Get-Process | Where-Object { $_.ProcessName -eq $name -or $_.Name -eq $name }

	if (-not $procs) {
		Write-Host "No running process found with name '$name'"
		return
	}

	foreach ($proc in $procs) {
		try {
			Write-Host "Killing process: $($proc.Name) (PID: $($proc.Id))"
			Stop-Process -Id $proc.Id -Force
		} catch {
			Write-Warning "Failed to kill process '$($proc.Name)' (PID: $($proc.Id)): $_"
		}
	}
}

function SuppressServiceByName($name) {
	$service = Get-Service | Where-Object { $_.DisplayName -eq $name }
	if (-not $service) {
		Write-Warning "Service '$name' not found."
		return
	}
	try {
		if ($service.Status -eq 'Running') {
			Write-Host "Stopping service: $($service.DisplayName)"
			Stop-Service -Name $service.Name -Force
		}
		Write-Host "Disabling service: $($service.DisplayName)"
		Set-Service -Name $service.Name -StartupType Manual
	} catch {
		Write-Warning "Failed to modify service '$($service.DisplayName)': $_"
	}
}



# Adobe

function DoAdobe {
	# Generic

	KillProcessByName "CoreSync" # Adobe Content Synchronizer
	KillProcessByName "Adobe Crash Processor"
	KillProcessByName "CCXProcess" # Creative Cloud Content Manager
	KillProcessByName "Adobe Desktop Service" # Creative Cloud Core Service
	KillProcessByName "Creative Cloud Helper"
	KillProcessByName "AdobeIPCBroker" # Creative Cloud Interprocess Service
	KillProcessByName "AdobeNotificationClient" # Notification Manager for Adobe Creative Cloud
	# A process named "Node.js JavaScript Runtime"
	# I have no fucking clue why Adobe is running an individual Node program located at C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs .
	# It's kinda hard to filter this little shit out so we're skipping it for now.

	
	# Acrobat

	KillProcessByName "AdobeCollabSync" # Acrobat Collaboration Synchronizer
	KillProcessByName "AdobeCollabSync" # Gotta do twice because there are two.
	KillProcessByName "Acrobat Licensing Service"
	KillProcessByName "AcrobatNotificationClient" # Notification Manager for Adobe Acrobat
	SuppressServiceByName "Adobe Acrobat Update Service"
}



# HP

function DoHp {
	# HP Insights Analytics
	# https://www.reddit.com/r/spectrex360/comments/zcntrh/the_true_solution_to_hp_touchpoint_analytics/
	KillProcessByName "HP Insights Analytics Service"
	SuppressServiceByName "HP Insights Analytics"

	# HP Support Solutions Framework
	KillProcessByName "HP Support Solutions Framework Service"
	SuppressServiceByName "HP Support Solutions Framework Service"

	# HSA series
	# https://www.reddit.com/r/Hewlett_Packard/comments/syn2mt/hp_hsa/
	SuppressServiceByName "HP App Helper HSA Service"
	SuppressServiceByName "HP Diagnostics HSA Service"
	SuppressServiceByName "HP Network HSA Service"
	SuppressServiceByName "HP Omen HSA Service"
	SuppressServiceByName "HP System Info HSA Service"
	# TODO: Software Components in Device Manager
	# HP Application Enabling Service
	# HP Device Health Service
	# Omen Software and Services
}



# Entry

function Main {
	DoAdobe
	DoHp
	Pause
}

Main