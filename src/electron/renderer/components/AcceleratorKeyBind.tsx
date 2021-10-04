import * as k from '@/common/keyboard';
import { KeyBind, KeyBindProps, Transformer } from './KeyBind';

const keys: [string, string][] = [
  [k.VK_CONTROL_LEFT, 'CommandOrControl'],
  [k.VK_CONTROL_RIGHT, 'CommandOrControl'],
  [k.VK_ALT_LEFT, 'Alt'],
  [k.VK_ALT_RIGHT, 'AltGr'],
  [k.VK_SHIFT_LEFT, 'Shift'],
  [k.VK_SHIFT_RIGHT, 'Shift'],
  [k.VK_META_LEFT, 'Super'],
  [k.VK_DIGIT_0, '0'],
  [k.VK_DIGIT_1, '1'],
  [k.VK_DIGIT_2, '2'],
  [k.VK_DIGIT_3, '3'],
  [k.VK_DIGIT_4, '4'],
  [k.VK_DIGIT_5, '5'],
  [k.VK_DIGIT_6, '6'],
  [k.VK_DIGIT_7, '7'],
  [k.VK_DIGIT_8, '8'],
  [k.VK_DIGIT_9, '9'],
  [k.VK_KEY_Q, 'Q'],
  [k.VK_KEY_W, 'W'],
  [k.VK_KEY_E, 'E'],
  [k.VK_KEY_R, 'R'],
  [k.VK_KEY_T, 'T'],
  [k.VK_KEY_Y, 'Y'],
  [k.VK_KEY_U, 'U'],
  [k.VK_KEY_I, 'I'],
  [k.VK_KEY_O, 'O'],
  [k.VK_KEY_P, 'P'],
  [k.VK_KEY_A, 'A'],
  [k.VK_KEY_S, 'S'],
  [k.VK_KEY_D, 'D'],
  [k.VK_KEY_F, 'F'],
  [k.VK_KEY_G, 'G'],
  [k.VK_KEY_H, 'H'],
  [k.VK_KEY_J, 'J'],
  [k.VK_KEY_K, 'K'],
  [k.VK_KEY_L, 'L'],
  [k.VK_KEY_Z, 'Z'],
  [k.VK_KEY_X, 'X'],
  [k.VK_KEY_C, 'C'],
  [k.VK_KEY_V, 'V'],
  [k.VK_KEY_B, 'B'],
  [k.VK_KEY_N, 'N'],
  [k.VK_KEY_M, 'M'],
  [k.VK_F1, 'F1'],
  [k.VK_F2, 'F2'],
  [k.VK_F3, 'F3'],
  [k.VK_F4, 'F4'],
  [k.VK_F5, 'F5'],
  [k.VK_F6, 'F6'],
  [k.VK_F7, 'F7'],
  [k.VK_F8, 'F8'],
  [k.VK_F9, 'F9'],
  [k.VK_F10, 'F10'],
  [k.VK_F11, 'F11'],
  [k.VK_F12, 'F12'],
  [k.VK_BACKQUOTE, '`'],
  [k.VK_MINUS, '-'],
  [k.VK_EQUAL, '='],
  [k.VK_BRACKET_LEFT, '['],
  [k.VK_BRACKET_RIGHT, ']'],
  [k.VK_BACKSLASH, '\\'],
  [k.VK_SEMICOLON, ';'],
  // prettier-ignore
  [k.VK_QUOTE, '\''],
  [k.VK_COMMA, ','],
  [k.VK_PERIOD, '.'],
  [k.VK_SLASH, '/'],
  [k.VK_SPACE, 'Space'],
  [k.VK_TAB, 'Tab'],
  [k.VK_CAPS_LOCK, 'Capslock'],
  [k.VK_NUM_LOCK, 'Numlock'],
  [k.VK_SCROLL_LOCK, 'Scrolllock'],
  [k.VK_BACKSPACE, 'Backspace'],
  [k.VK_DELETE, 'Delete'],
  [k.VK_INSERT, 'Insert'],
  [k.VK_ESCAPE, 'Escape'],
  [k.VK_ENTER, 'Enter'],
  [k.VK_ARROW_UP, 'Up'],
  [k.VK_ARROW_DOWN, 'Down'],
  [k.VK_ARROW_LEFT, 'Left'],
  [k.VK_ARROW_RIGHT, 'Right'],
  [k.VK_HOME, 'Home'],
  [k.VK_END, 'End'],
  [k.VK_PAGE_UP, 'PageUp'],
  [k.VK_PAGE_DOWN, 'PageDown'],
  [k.VK_NUMPAD_0, 'num0'],
  [k.VK_NUMPAD_1, 'num1'],
  [k.VK_NUMPAD_2, 'num2'],
  [k.VK_NUMPAD_3, 'num3'],
  [k.VK_NUMPAD_4, 'num4'],
  [k.VK_NUMPAD_5, 'num5'],
  [k.VK_NUMPAD_6, 'num6'],
  [k.VK_NUMPAD_7, 'num7'],
  [k.VK_NUMPAD_8, 'num8'],
  [k.VK_NUMPAD_9, 'num9'],
  [k.VK_NUMPAD_DECIMAL, 'numdec'],
  [k.VK_NUMPAD_ADD, 'numadd'],
  [k.VK_NUMPAD_SUBTRACT, 'numsub'],
  [k.VK_NUMPAD_MULTIPLY, 'nummult'],
  [k.VK_NUMPAD_DIVIDE, 'numdiv'],
  [k.VK_NUMPAD_ENTER, 'Enter'],
];

const REGULAR_KEY_MAP = new Map(keys);
const INVERSE_KEY_MAP = new Map(
  keys.map(([code, electron]) => [electron, code] as const)
);

const acceleratorTransformer: Transformer = {
  toUniversal(input: Electron.Accelerator) {
    return input.split('+').map((k) => INVERSE_KEY_MAP.get(k));
  },
  fromUniversal(output: string[]) {
    return output.map((k) => REGULAR_KEY_MAP.get(k)).join('+');
  },
};

export const AcceleratorKeyBind = (props: Partial<KeyBindProps>) => {
  return (
    <KeyBind {...props} transformer={acceleratorTransformer} depth={Infinity} />
  );
};
