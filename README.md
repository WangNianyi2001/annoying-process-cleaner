# Annoying Process Cleaner

This should sounds common to you if you have some applications made by BIG companies (say, Adobe) installed on your PC:
Even though you've already quitted the app, SOMEthing still remains in the task manager.
They seem pretty suspicious, and you have absolutely no idea of what they really do.

This automated script is for stopping those background stuffs (processes, services, devices).
It does NOT uninstall/break/invalidate those functionalities, it just cools them down, makes what shouldn't be running calm, and tells them not to automatically start themselves again without being explicitly asked.

Although, as this script could give your device a nice break for a while, I'm pretty sure certain things WILL redo all the deeds the next time you use them.
So, my advice is to run this script everytime you fully stopped using those stuffs.
(Don't run this while working with them!)

Intended for Windows only! :)


## Usage

The script is written with NodeJS (originally with PowerScript, see the `v0.1.0` tag if you prefer that style, but it's not under maintenance anymore).

To install the dependencies: `npm i`

To run the script: `npm --run=run`  
(Yeah I know this looks weird, but I mean it's Windows :))


## Contribution

Just use GitHub PR. :)


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