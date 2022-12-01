## Troubleshooting

### Pressing key bind doesn't do anything!

There are 2 main reasons why key binds might not work:

Firstly, due to how global shortcuts work in [electron.js](https://www.electronjs.org/docs/latest/api/global-shortcut), selected keys will be mapped to their values. If you are using non-standard keyboard layout, this means that the selected key bind will not match the value displayed in the settings. To ensure that key binds work as expected, please use QWERTY keyboard layout in the autosolver. Keyboard layout can be changed in the settings of your operating system. In most operating systems it can be changed per application.

For Windows 10 please see: https://answers.microsoft.com/en-us/windows/forum/all/how-to-set-a-keyboard-input-language-for-a/1f5ce55c-26ef-485d-b40c-43e19d35d1de

Secondly, please ensure that the selected key bind doesn't collide with anything else(system key binds, 3rd party programs, etc.).

Additionally, key binds will not work is when the worker is disabled. In that case, there will be an appropriate message on the status bar. Worker can become temporarily disabled when changing some settings (like key binds or engine) and permanently disabled, when some dependency is not present (Linux only). In the latter case, install missing dependencies and restart the app.

### Key bind works, but recognition doesn't work!

This can be quite common behavior, and may depend on variety of factors:

- Selected display is **not** the one Cyberpunk 2077 is running on. This only applies to users with multiple monitors.
- Your "visual" settings(resolution, gamma, reshades, mods, language in some cases and other things) might cause invalid characters to be recognized. Set fixed threshold for invalid fragments to resolve that issue.
- You hovered mouse over any _BP_ fragment, causing invalid characters to be recognized. Move cursor out of the way(to the corner) before pressing key bind. Depending on platform and engine moving mouse away might be automatic.
- _BP_ you are trying to solve has already started.
- You are trying to solve something that isn't a _BP_.

### Recognition works, but Cyberpunk 2077 did not receive any input commands!

This is caused most likely by selecting incorrect engine/input device to the platform you are running Cyberpunk 2077 on.

- If playing through streaming service on _Windows_, use _AutoHotkey_ as the engine, with keyboard as input device.
- If you changed default UI navigation keys(either by settings in game or other mods), set the same keys in _BPA_ settings. By default _BPA_ is using <kbd>Enter</kbd> for selecting code, <kbd>Escape</kbd> for exiting _BP_ and arrow keys <kbd>Up</kbd>, <kbd>Down</kbd>, <kbd>Left</kbd>, <kbd>Right</kbd> for navigation on the grid.
- Prior to version 2.1.0, _AutoHotkey_ **must** be installed in default directory(_C:/Program Files/AutoHotkey/AutoHotkey.exe_).
- When using 1360x768 resolution, there is a bizzare bug in _BP_ where keyboard doesn't work while cursor is at the top of the screen. To fix it, change resolution to **1366**x768.
- Setting _BPA_ and _AutoHotkey_ or _NirCmd_ to "run as administrator" might help. There is known issue were _AutoHotkey_ can't send input to elevated windows, until itself is elevated.

> To spawn elevated processes _BPA_ must be run as administrator.

> _NirCmd_ comes bundled with _BPA_, default path is: `%LocalAppData%\Programs\breach-protocol-autosolver\resources\win32\nircmd\nircmd.exe`.

### Mouse clicks are all over the place!

Use keyboard as input device, mouse input is discouraged, as it's tricky to work around system scaling, multiple monitors, diffrent platforms and how they handle mouse events.

### Simulated sequence is not correct!

This can be caused by:

- using your peripherals(mouse, keyboard, gamepad) while _BPA_ is working;
- starting _BPA_ to quickly. For more information consult [Breach Protocol bugs page](bugs.md);
- setting delay to very low value(this might be more likely on platforms with high latency/low fps like streaming).
