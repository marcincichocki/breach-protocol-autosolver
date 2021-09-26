import * as k from '@/common/keyboard';
import {
  BreachProtocolRobot,
  BreachProtocolRobotKeys,
  VK_DIGITS,
  VK_KEYS,
} from './robot';

export abstract class WindowsRobot extends BreachProtocolRobot {
  /** {@link KeyboardEvent.code} to win32 virtual codes map. */
  private static VK_MAP = new Map([
    [k.VK_CONTROL_LEFT, 0xa2],
    [k.VK_CONTROL_RIGHT, 0xa3],
    [k.VK_ALT_LEFT, 0x12],
    [k.VK_ALT_RIGHT, 0x12], // Same as left alt
    [k.VK_SHIFT_LEFT, 0xa0],
    [k.VK_SHIFT_RIGHT, 0xa1],
    [k.VK_META_LEFT, 0x12], // Same as left alt
    ...VK_KEYS,
    ...VK_DIGITS,
    [k.VK_F1, 0x70],
    [k.VK_F2, 0x71],
    [k.VK_F3, 0x72],
    [k.VK_F4, 0x73],
    [k.VK_F5, 0x74],
    [k.VK_F6, 0x75],
    [k.VK_F7, 0x76],
    [k.VK_F8, 0x77],
    [k.VK_F9, 0x78],
    [k.VK_F10, 0x79],
    [k.VK_F11, 0x7a],
    [k.VK_F12, 0x7b],
    [k.VK_BACKQUOTE, 0xc0],
    [k.VK_MINUS, 0xbd],
    [k.VK_EQUAL, 0xbb],
    [k.VK_BRACKET_LEFT, 0xdb],
    [k.VK_BRACKET_RIGHT, 0xdd],
    [k.VK_BACKSLASH, 0xdc],
    [k.VK_SEMICOLON, 0xba],
    [k.VK_QUOTE, 0xde],
    [k.VK_COMMA, 0xbc],
    [k.VK_PERIOD, 0xbe],
    [k.VK_SLASH, 0xbf],
    [k.VK_SPACE, 0x20],
    [k.VK_TAB, 0x09],
    [k.VK_CAPS_LOCK, 0x14],
    [k.VK_NUM_LOCK, 0x90],
    [k.VK_SCROLL_LOCK, 0x91],
    [k.VK_BACKSPACE, 0x08],
    [k.VK_DELETE, 0x2e],
    [k.VK_INSERT, 0x2d],
    [k.VK_ESCAPE, 0x1b],
    [k.VK_ENTER, 0x0d],
    [k.VK_ARROW_UP, 0x26],
    [k.VK_ARROW_DOWN, 0x28],
    [k.VK_ARROW_LEFT, 0x25],
    [k.VK_ARROW_RIGHT, 0x27],
    [k.VK_HOME, 0x24],
    [k.VK_END, 0x23],
    [k.VK_PAGE_UP, 0x21],
    [k.VK_PAGE_DOWN, 0x22],
    [k.VK_NUMPAD_0, 0x60],
    [k.VK_NUMPAD_1, 0x61],
    [k.VK_NUMPAD_2, 0x62],
    [k.VK_NUMPAD_3, 0x63],
    [k.VK_NUMPAD_4, 0x64],
    [k.VK_NUMPAD_5, 0x65],
    [k.VK_NUMPAD_6, 0x66],
    [k.VK_NUMPAD_7, 0x67],
    [k.VK_NUMPAD_8, 0x68],
    [k.VK_NUMPAD_9, 0x69],
    [k.VK_NUMPAD_DECIMAL, 0x6c],
    [k.VK_NUMPAD_ADD, 0x6b],
    [k.VK_NUMPAD_SUBTRACT, 0x6d],
    [k.VK_NUMPAD_MULTIPLY, 0x6a],
    [k.VK_NUMPAD_DIVIDE, 0x6f],
    [k.VK_NUMPAD_ENTER, 0x0d],
  ]);

  protected getMappedKey(key: BreachProtocolRobotKeys) {
    const code = this.keys[key];

    return WindowsRobot.VK_MAP.get(code).toString(16);
  }
}
