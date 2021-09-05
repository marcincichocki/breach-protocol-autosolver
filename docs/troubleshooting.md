## Troubleshooting

### Pressing key bind doesn't do anything!

Ensure that selected key bind doesn't collide with anything else(system keybinds, 3rd party programs, etc).

One situation in which key bind will not work is when worker is disabled. In that case there will be appropriate message on the status bar. Worker can become temporarily disabled when changing some settings(like key binds or engine) and permanently disabled, when some dependency is not present. In latter case install missing dependencies and restart the app.

### Key bind works, but recognition doesn't work!

This can be quite common behavior, and may depend on variety of factors:

- Selected display is **not** the one Cyberpunk 2077 is running on. This only applies to users with multiple monitors.
- Your "visual" settings(resolution, gamma, reshades, mods, language in some cases and other things) might cause invalid characters to be recognized. Set fixed threshold for invalid fragments to resolve that issue.
- You hovered mouse over any _BP_ fragment, causing invalid characters to be recognized. Move cursor out of the way(to the corner) before pressing key bind. Depending on platform and engine moving mouse away might be automatic.
- _BP_ you are trying to solve has already started.
- You are trying to solve something that isn't a _BP_.

### Recognition works, but _BP_ is not resolved!

This is caused most likely by selecting incorrect engine/input device to the platform you are running Cyberpunk 2077 on.

- If playing through streaming service on _Windows_, use _AutoHotkey_ as the engine, with keyboard as input device.
- When using 1360x768 resolution, there is a bizzare bug in _BP_ where keyboard doesn't work while cursor is at the top of the screen. To fix it, change resolution to **1366**x768.
- Setting _BPA_ and _AutoHotkey_ or _NirCmd_ to "run as administrator" might help. There is known issue were _AutoHotkey_ can't send input to elevated windows, until itself is elevated.

> To spawn elevated processes _BPA_ must be run as administrator.

> _NirCmd_ comes bundled with _BPA_, default path is: `%LocalAppData%\Programs\breach-protocol-autosolver\resources\win32\nircmd\nircmd.exe`.

### Mouse clicks are all over the place!

Use keyboard as input device, mouse input is discouraged, as it's tricky to work around system scaling, multiple monitors, diffrent platforms and how they handle mouse events.

### Simulated sequence is not correct!

Don't use your peripherals(mouse, keyboard, gamepad) while _BPA_ is working.
