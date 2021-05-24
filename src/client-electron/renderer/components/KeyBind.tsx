import { useCallback, useEffect, useState } from 'react';

/**
 * Map between {@link KeyboardEvent.code} and electron.js accelerator code
 *
 * https://www.electronjs.org/docs/api/accelerator
 */
export const CODES_MAP: Record<string, string> = {
  // Modifiers
  // Accelerator codes that are NOT handled:
  // - Command(Cmd)
  // - Control(Ctrl)
  // - Option
  // - Meta
  ControlLeft: 'CommandOrControl',
  ControlRight: 'CommandOrControl',
  AltLeft: 'Alt',
  AltRight: 'AltGr',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  MetaLeft: 'Super',

  // Key codes
  // [0-9]
  Digit0: '0',
  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',

  // [A-Z]
  // 1st row
  KeyQ: 'Q',
  KeyW: 'W',
  KeyE: 'E',
  KeyR: 'R',
  KeyT: 'T',
  KeyY: 'Y',
  KeyU: 'U',
  KeyI: 'I',
  KeyO: 'O',
  KeyP: 'P',

  // 2nd row
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',

  // 3rd row
  KeyZ: 'Z',
  KeyX: 'X',
  KeyC: 'C',
  KeyV: 'V',
  KeyB: 'B',
  KeyN: 'N',
  KeyM: 'M',

  // [F1-F12]
  // MISSING CODES: [F13-F24]
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',

  // MISSING CODES: special characters [0-9]
  // Use modifier to bind to them. e.g. to bind to "&" use "ShiftLeft" + "Digit7"
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  // prettier-ignore
  Quote: '\'',
  Comma: ',',
  Period: '.',
  Slash: '/',

  Space: 'Space',
  Tab: 'Tab',
  CapsLock: 'Capslock',
  NumLock: 'Numlock',
  ScrollLock: 'Scrolllock',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Insert: 'Insert',

  // MISSING CODES(this codes are forbidden).
  // - Return(Enter)
  // - Escape(Esc)
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',

  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',

  // MISSING CODES:
  // - VolumeUp
  // - VolumeDown
  // - VolumeMute
  // - MediaNextTrack
  // - MediaPreciousTrack
  // - MediaStop
  // - MediaPlayPause
  // - PrintScreen
  Numpad0: 'num0',
  Numpad1: 'num1',
  Numpad2: 'num2',
  Numpad3: 'num3',
  Numpad4: 'num4',
  Numpad5: 'num5',
  Numpad6: 'num6',
  Numpad7: 'num7',
  Numpad8: 'num8',
  Numpad9: 'num9',
  NumpadDecimal: 'numdec',
  NumpadAdd: 'numadd',
  NumpadSubtract: 'numsub',
  NumpadMultiply: 'nummult',
  NumpadDivide: 'numdiv',
};

export const useKeyPress = (
  func: (...args: any[]) => void,
  target = window
) => {
  const [pressed, setPressed] = useState<Record<string, string>>({});

  const onKeyDown = useCallback(
    (event) => {
      if (pressed[event.code]) return;

      const data = { ...pressed, [event.code]: CODES_MAP[event.code] };
      setPressed(data);
      func(data);
    },
    [func, pressed]
  );

  const onKeyUp = useCallback(
    (event) => {
      const { [event.code]: id, ...rest } = pressed;
      setPressed(rest);
    },
    [pressed]
  );

  useEffect(() => {
    target.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      target.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [target, onKeyDown, onKeyUp]);
};

export const KeyBind = () => {
  useKeyPress(console.log);

  return <input type="text" />;
};
