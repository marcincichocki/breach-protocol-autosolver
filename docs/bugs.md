## Breach Protocol bugs

In a spirit of Cyberpunk 2077 even _BP_ is not free of bugs. Here are few of them and how to resolve them:

### 1360x768 bug

This bug makes input device unresponsive when mouse is at the top of the screen while in _BP_. This can cause _BPA_ to **not** resolve _BP_ because by default cursor is moved to top left corner to prevent it from interfering with _fragments_.

As a workaround change resolution to **1366**x768.

> This bug also applies when downscaling your resolution!

### Speedy Gonzales bug

This bug makes input device unresponsive when _BP_ is starting. Even though UI looks ready, it's impossible to select any square in grid. Only after daemons do a little "jump" it looks like _BP_ is ready to receive input.

Depending on settings(and user's reaction time), _BPA_ can be really fast and try to resolve _BP_ **before** it's ready. This will cause invalid sequence to be selected.

As a workaround either:

- stop being Speedy Gonzales and chill a bit.
- go to `settings > performance > resolve delay` and set it to around 1 second. This will make sure that there is enough time for _BP_ to properly initialize.
