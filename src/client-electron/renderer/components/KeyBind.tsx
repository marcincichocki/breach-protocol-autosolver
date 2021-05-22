import { Accelerator } from 'electron';
import { Fragment, KeyboardEvent, useRef, useState } from 'react';
import styled from 'styled-components';

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
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
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

  // MISSING CODES(these codes are forbidden).
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
  NumpadEnter: 'Enter',
};

class KeyBindEvent {
  public readonly electronCode = CODES_MAP[this.code];

  constructor(public readonly code: string) {}
}

export const useKeyPress = (
  onEnter: (...args: any[]) => void,
  onEscape: (...args: any[]) => void,
  initialValue: KeyBindEvent[]
) => {
  const [pressed, setPressed] = useState<KeyBindEvent[]>(initialValue);
  const [count, setCount] = useState(0);
  const [dirty, setDirty] = useState(false);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (count && pressed.find((e) => e.code === event.code)) return;

    switch (event.code) {
      case 'Enter':
        return onEnter();
      case 'Escape':
        return onEscape();
      default: {
        setDirty(true);
        setCount((c) => c + 1);

        const data = new KeyBindEvent(event.code);
        setPressed((p) => (!count ? [data] : [...p, data]));
      }
    }
  }

  function onKeyUp() {
    setCount((c) => (!c ? 0 : c - 1));
  }

  return { onKeyDown, onKeyUp, pressed, setPressed, dirty, setDirty };
};

const KeyBindWrapper = styled.div`
  width: 510px;
  height: 50px;
  border: 1px solid var(--primary);
  background: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-weight: 500;
  font-size: 18px;

  &:focus-within {
    border-color: var(--accent);
  }
`;

const VisuallyHiddenInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  appearance: none;
`;

const KeyCode = styled.kbd`
  border: 1px solid var(--accent);
  padding: 4px 10px;
  font-family: 'Rajdhani';
`;

function toKeyCodes(accelerator: Accelerator) {
  const codes = Object.keys(CODES_MAP);

  return accelerator
    .split('+')
    .map((key) => new KeyBindEvent(codes.find((c) => CODES_MAP[c] === key)));
}

// TODO: refactor this to field context
export const KeyBind = ({ accelerator }: { accelerator: string }) => {
  const keys = toKeyCodes(accelerator);
  const ref = useRef<HTMLInputElement>();
  const { onKeyDown, onKeyUp, pressed, setPressed, dirty, setDirty } =
    useKeyPress(
      () => {
        // TODO: emit accepted value
        ref.current.blur();
      },
      () => {
        setPressed(keys);
        ref.current.blur();
      },
      keys
    );

  // TODO: return latest value on blur
  function onBlur() {
    // setPressed(keys);
    setDirty(false);
    setVisited(false);
  }

  const [visited, setVisited] = useState(false);

  function onFocus() {
    setVisited(true);
  }

  return (
    <>
      <KeyBindWrapper onClick={() => ref.current.focus()}>
        {!dirty && visited ? (
          <span style={{ textTransform: 'uppercase' }}>Press key to bind</span>
        ) : (
          pressed.map((k, i) => (
            <Fragment key={k.code}>
              {!!i && ' + '}
              <KeyCode>{k.electronCode}</KeyCode>
            </Fragment>
          ))
        )}
        <VisuallyHiddenInput
          type="text"
          ref={ref}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </KeyBindWrapper>
    </>
  );
};