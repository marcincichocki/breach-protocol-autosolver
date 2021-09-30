import * as k from '@/common/keyboard';
import {
  BreachProtocolRobot,
  BreachProtocolRobotKeys,
  VK_DIGITS,
  VK_KEYS,
} from './robot';

export class XDoToolRobot extends BreachProtocolRobot {
  protected readonly binPath = 'xdotool';

  /**
   * {@link KeyboardEvent.code} to keysym codes map.
   *
   * https://gitlab.com/cunidev/gestures/-/wikis/xdotool-list-of-key-codes
   * https://cgit.freedesktop.org/xorg/proto/x11proto/plain/keysymdef.h
   */
  private static VK_MAP = new Map([
    [k.VK_CONTROL_LEFT, 0xffe3],
    [k.VK_CONTROL_RIGHT, 0xffe4],
    [k.VK_ALT_LEFT, 0xffe9],
    [k.VK_ALT_RIGHT, 0xffea],
    [k.VK_SHIFT_LEFT, 0xffe1],
    [k.VK_SHIFT_RIGHT, 0xffe2],
    [k.VK_META_LEFT, 0xffe7],
    ...VK_KEYS,
    ...VK_DIGITS,
    [k.VK_F1, 0xffbe],
    [k.VK_F2, 0xffbf],
    [k.VK_F3, 0xffc0],
    [k.VK_F4, 0xffc1],
    [k.VK_F5, 0xffc2],
    [k.VK_F6, 0xffc3],
    [k.VK_F7, 0xffc4],
    [k.VK_F8, 0xffc5],
    [k.VK_F9, 0xffc6],
    [k.VK_F10, 0xffc7],
    [k.VK_F11, 0xffc8],
    [k.VK_F12, 0xffc9],
    [k.VK_BACKQUOTE, 0x0060],
    [k.VK_MINUS, 0x002d],
    [k.VK_EQUAL, 0x003d],
    [k.VK_BRACKET_LEFT, 0x005b],
    [k.VK_BRACKET_RIGHT, 0x005d],
    [k.VK_BACKSLASH, 0x005c],
    [k.VK_SEMICOLON, 0x003b],
    [k.VK_QUOTE, 0x0027],
    [k.VK_COMMA, 0x002c],
    [k.VK_PERIOD, 0x002e],
    [k.VK_SLASH, 0x002f],
    [k.VK_SPACE, 0x0020],
    [k.VK_TAB, 0xff09],
    [k.VK_CAPS_LOCK, 0xffe5],
    [k.VK_NUM_LOCK, 0xff7f],
    [k.VK_SCROLL_LOCK, 0xff14],
    [k.VK_BACKSPACE, 0xff08],
    [k.VK_DELETE, 0xffff],
    [k.VK_INSERT, 0xff63],
    [k.VK_ESCAPE, 0xff1b],
    [k.VK_ENTER, 0xff8d],
    [k.VK_ARROW_UP, 0xff52],
    [k.VK_ARROW_DOWN, 0xff54],
    [k.VK_ARROW_LEFT, 0xff51],
    [k.VK_ARROW_RIGHT, 0xff53],
    [k.VK_HOME, 0xff50],
    [k.VK_END, 0xff57],
    [k.VK_PAGE_UP, 0xff55],
    [k.VK_PAGE_DOWN, 0xff56],
    [k.VK_NUMPAD_0, 0xffb0],
    [k.VK_NUMPAD_1, 0xffb1],
    [k.VK_NUMPAD_2, 0xffb2],
    [k.VK_NUMPAD_3, 0xffb3],
    [k.VK_NUMPAD_4, 0xffb4],
    [k.VK_NUMPAD_5, 0xffb5],
    [k.VK_NUMPAD_6, 0xffb6],
    [k.VK_NUMPAD_7, 0xffb7],
    [k.VK_NUMPAD_8, 0xffb8],
    [k.VK_NUMPAD_9, 0xffb9],
    [k.VK_NUMPAD_DECIMAL, 0xffae],
    [k.VK_NUMPAD_ADD, 0xffab],
    [k.VK_NUMPAD_SUBTRACT, 0xffad],
    [k.VK_NUMPAD_MULTIPLY, 0xffaa],
    [k.VK_NUMPAD_DIVIDE, 0xffaf],
    [k.VK_NUMPAD_ENTER, 0xff8d],
  ]);

  protected getMappedKey(key: BreachProtocolRobotKeys) {
    const code = this.keys[key];

    return XDoToolRobot.VK_MAP.get(code).toString(16);
  }

  activateGameWindow() {
    return this.bin(
      `search --name ${this.gameWindowTitle} windowactivate --sync`
    );
  }

  move(x: number, y: number) {
    return this.bin(`mousemove ${x} ${y}`);
  }

  moveAway() {
    return this.move(0, 0);
  }

  click() {
    return this.bin('click 1');
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`key 0x${this.getMappedKey(key)}`);
  }
}
