## Frequently Asked Questions

### Windows is telling me that this file is dangerous!

That's because installer is not signed. If you are willing to pay for code signing certificate, I can consider adding it.

### If code is not signed, how can I know this program is secure?

It's [open source](https://github.com/marcincichocki/breach-protocol-autosolver).

### How do I change default key bind?

1. go to the settings;
2. find key bind input and click on it;
3. press desired key combination.
4. **Only on versions below 2.1.0**: Confirm your choice with <kbd>Enter</kbd>.

### I changed UI navigation keybindings in the game, will _BPA_ work with it?

You **must** set the same navigation keys in _BPA_ and in _Cyberpunk 2077_. Otherwise _BP_ will not be solved.

1. go to the settings;
2. in _AutoSolver_ section find key bind inputs and click on desired field;
3. press key that you selected in the game.

### I'm playing on gamepad, is it possible to bind _BPA_ to it?

Yes, although not directly. You must use external tool like [AntiMicro](https://github.com/AntiMicro/antimicro) for gamepad, or [X-Mouse Button Control](https://www.highrez.co.uk/downloads/XMouseButtonControl.htm) for mouse. Simply bind gamepad/mouse to output _BPA_'s key bind. **Just make sure that selected gamepad/mouse bind does not interfere with Breach Protocol!**

### What is the difference between "solve" and "solve with priority"

Both will solve _BP_, but the difference is which daemons will be solved.

"solve" will order daemons by their index, meaning that those are at the bottom of the list will be more valuable than those at the top.

"solve with priority" will prioritize on one specific daemon and than fallback to index for anything else.

> Please note that indexes are counted **without** daemon solved by "Head Start" perk!
>
> Example:
>
> ~~BD BD~~ <- index: none, already solved by "Head Start" perk\
> 7A 7A BD <- index: 1, "solve with priority 1" will focus this daemon\
> BD 7A 1C <- index: 2, "solve with priority 2" will focus this daemon

### I have found a bug! How do I report it?

Report it on [NexusMods](https://www.nexusmods.com/cyberpunk2077/mods/3071) page, or in [github repository](https://github.com/marcincichocki/breach-protocol-autosolver).

> Depending of the issue type, you should provide information that will help resolving the issue as fast as possible.
>
> these informations should include:
>
> - Operating System;
> - Cyberpunk 2077 platform(native/_Proton_/_Google Stadia_/_GeForce Now_);
> - _BPA_ version;
> - relevant _BPA_ settings.
>
> **Attaching failed _BP_ snapshot is recommended if applicable**.

### How to make it work on streaming services?

On _Windows_ use _AutoHotkey_ as engine, as _NirCmd_ can't send input to streaming services. On _Linux_ it should work out of the box.

### There are other tools like this. How this differs from the rest?

_BPA_ works on _Windows_, _Linux_, streaming services and on every supported language by Cyberpunk 2077.

### What about macOS version?

_macOS_ version is theoretically possible, but I can't commit to it because I don't have a mac to test it on.

> If you are interested in creating macOS distribution, open new issue in [github repository](https://github.com/marcincichocki/breach-protocol-autosolver).

### I would like to propose a new feature!

Post it on [NexusMods](https://www.nexusmods.com/cyberpunk2077/mods/3071) page, or in [github repository](https://github.com/marcincichocki/breach-protocol-autosolver) with relavant information.
