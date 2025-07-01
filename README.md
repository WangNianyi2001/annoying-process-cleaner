# Annoying Process Cleaner

This should sounds common to you if you have some applications made by BIG companies (say, Adobe) installed on your PC:
Even though you've already quitted the app, SOMEthing still remains in the task manager.
They seem pretty suspicious, and you have absolutely no idea of what they really do.

This PowerShell script is for stopping those background stuffs (processes, services, devices).
It does NOT uninstall/break/invalidate those functionalities, it just cools them down, makes what shouldn't be running calm, and tells them not to automatically start themselves again without being explicitly asked.

Although, as this script could give your device a nice break for a while, I'm pretty sure certain things WILL redo all the deeds the next time you use them.
So, my advice is to run this script everytime you fully stopped using those stuffs.
(Don't run this while working with them!)

Intended for Windows only! :)


## Disclaimer

I wrote this script because I'm really annoyed by those background stuffs.

And hey, Adobe law guys (as well as any other companies contributing to the list), don't punch me.
I don't think it's illegal to:
- observe my own task manager,
- find your processes annoying,
- write a automated script to stop them,
- and share it to people who experience the same.

Hackers and bad guys, please don't inject malicious code into my script.
It's for the greater good, thanks!


## Usage

Download `main.ps1` and run it on you PC.

If you don't know how to run a PowerShell script, [see here](https://stackoverflow.com/questions/2035193/how-to-run-a-powershell-script).

If Windows bitches about running a script file and don't cooperate, execute the following line:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
This enables only the current user to run local or signed remote PowerShell script files.


## Contribution

Just use GitHub PR. :)

Currently the targets are hard-coded in the script.
I kinda want to enhance the matching strategy and then make the list able to be read externally, but I'm too lazy to do it as it's already working :))
So thanks in advance, future guy!