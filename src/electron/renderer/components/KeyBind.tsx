import {
  Fragment,
  KeyboardEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { OnBeforeValueChange, useField } from './Form';

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

  Escape: 'Escape',
  Enter: 'Enter',

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

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
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
  border: 1px solid var(--primary-dark);
  background: var(--background);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  color: var(--accent);
  font-weight: 500;
  font-size: 24px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover:not(:focus-within) {
    background: var(--primary-darker);
    border-color: var(--accent);
  }

  &:focus-within {
    border-color: var(--accent);
    background: #367c7f;
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
  top: 0;
  left: 0;
`;

export const KeyCode = styled.kbd`
  border: 1px solid var(--accent);
  padding: 0 8px;
  font-family: 'Rajdhani';
  min-width: 32px;
  box-sizing: border-box;
`;

interface KeyBindProps<I = any, O = any> {
  transformer: Transformer<I, O>;
  depth: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onBeforeValueChange?: OnBeforeValueChange<Electron.Accelerator>;
}

const KeyBind = ({
  transformer,
  depth,
  onFocus,
  onBlur,
  onBeforeValueChange,
}: KeyBindProps) => {
  const ref = useRef<HTMLInputElement>();
  const { value, setValue } = useField();
  const initial = transformer.toUniversal(value);
  const [selected, setSelected] = useState<string[]>(initial);
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    if (!active.length || active.length === depth) {
      ref.current.blur();
    }
  }, [active]);

  const onInputFocus = useCallback(() => {
    if (onFocus) onFocus();

    setSelected([]);
  }, []);

  const onInputBlur = useCallback(() => {
    if (onBlur) onBlur();

    setActive([]);

    // If there is no key selected, return to previous value and don't emit anything.
    if (!selected.length) {
      return setSelected(initial);
    }

    const newValue = transformer.fromUniversal(selected);

    if (newValue !== value) {
      const next = (restart?: boolean) =>
        restart ? setSelected(initial) : setValue(newValue);

      if (onBeforeValueChange) {
        onBeforeValueChange(newValue, next);
      } else {
        next();
      }
    }
  }, [selected]);

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const { code } = event;

      if (active.some((k) => k === code)) return;

      setActive((active) => [...active, code]);

      if (selected.some((k) => k === code)) return;

      setSelected((selected) => [...selected, code]);
    },
    [active, selected]
  );

  const onInputKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      setActive((active) => active.filter((k) => k !== event.code));
    },
    [active]
  );

  return (
    <KeyBindWrapper onClick={() => ref.current.focus()}>
      {!selected.length ? (
        <span style={{ textTransform: 'uppercase' }}>Press key to bind</span>
      ) : (
        selected.map((key, i) => (
          <Fragment key={i}>
            {!!i && ' + '}
            <KeyCode>{key}</KeyCode>
          </Fragment>
        ))
      )}
      <VisuallyHiddenInput
        ref={ref}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onKeyDown={onInputKeyDown}
        onKeyUp={onInputKeyUp}
      />
    </KeyBindWrapper>
  );
};

interface Transformer<I, O> {
  toUniversal(input: I): O;
  fromUniversal(output: O): I;
}

function keyCodeToAccelerator(keyCode: string): Electron.Accelerator {
  return CODES_MAP[keyCode];
}

function acceleratorToKeyCode(accelerator: Electron.Accelerator): string {
  for (const [code, electronCode] of Object.entries(CODES_MAP)) {
    if (electronCode === accelerator) {
      return code;
    }
  }

  throw new Error('invalid accelerator');
}

const acceleratorTransformer: Transformer<Electron.Accelerator, string[]> = {
  toUniversal(input: Electron.Accelerator) {
    return input.split('+').map((k) => acceleratorToKeyCode(k));
  },
  fromUniversal(output: string[]) {
    return output.map((k) => keyCodeToAccelerator(k)).join('+');
  },
};

export const AcceleratorKeyBind = (props: Partial<KeyBindProps>) => {
  return (
    <KeyBind {...props} transformer={acceleratorTransformer} depth={Infinity} />
  );
};

const noopTransformer: Transformer<string[], string[]> = {
  toUniversal(input: string[]) {
    return input;
  },
  fromUniversal(input: string[]) {
    return input;
  },
};

export const MapKeyBind = (props: Partial<KeyBindProps>) => {
  return <KeyBind {...props} transformer={noopTransformer} depth={1} />;
};
