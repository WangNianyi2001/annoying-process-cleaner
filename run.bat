:: Switch to cwd
cd /D "%~dp0"

:: Try running with admin priviledge
net session >nul 2>&1
if %errorlevel% neq 0 (
	@REM powershell -Command "Start-Process cmd -ArgumentList '/c \"cd /d \\\\"%~dp0\\\\" && npm run run\"' -Verb RunAs"
	powershell -Command "Start-Process cmd -ArgumentList '/c cd /d %~dp0 & run.bat & pause' -Verb RunAs"
	exit /b
)

:: Run
npm run run

:: Pause for output texts
pause