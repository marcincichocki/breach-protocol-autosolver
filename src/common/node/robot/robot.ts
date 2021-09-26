import * as k from '@/common/keyboard';
import { sleep } from '@/common/util';
import { execFile } from 'child_process';
import { join } from 'path';
import sanitize from 'sanitize-filename';
import screenshot, { ScreenshotFormat } from 'screenshot-desktop';

export interface RobotSettings {
  delay: number;
  activeDisplayId: string;
  format: ScreenshotFormat;
  screenshotDir: string;
  autoExit: boolean;
  useScaling: boolean;
  ahkBinPath: string;
  keyExit: string;
  keySelect: string;
  keyNavigateUp: string;
  keyNavigateDown: string;
  keyNavigateLeft: string;
  keyNavigateRight: string;
}

export enum BreachProtocolRobotKeys {
  Escape,
  Enter,
  Down,
  Up,
  Left,
  Right,
}

export abstract class BreachProtocolRobot {
  protected readonly keys = {
    [BreachProtocolRobotKeys.Escape]: this.settings.keyExit,
    [BreachProtocolRobotKeys.Enter]: this.settings.keySelect,
    [BreachProtocolRobotKeys.Up]: this.settings.keyNavigateUp,
    [BreachProtocolRobotKeys.Down]: this.settings.keyNavigateDown,
    [BreachProtocolRobotKeys.Left]: this.settings.keyNavigateLeft,
    [BreachProtocolRobotKeys.Right]: this.settings.keyNavigateRight,
  };

  protected abstract readonly binPath: string;

  constructor(
    protected readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  protected abstract getMappedKey(key: BreachProtocolRobotKeys): string;

  /** Click with left mouse button. */
  abstract click(): Promise<any>;

  /** Move cursor to given coordinates. */
  abstract move(x: number, y: number, restart?: boolean): Promise<any>;

  /** Move cursor into top left corner. */
  abstract moveAway(): Promise<any>;

  /** Press given key. */
  abstract pressKey(key: BreachProtocolRobotKeys): Promise<any>;

  /** Execute robot's engine command and wait. */
  protected async bin(command: string) {
    const args = command.split(' ');
    const data = await this.execBin(args);
    await sleep(this.settings.delay);

    return data;
  }

  /** Execute command for robot's engine. */
  protected execBin(args: string[], options = {}) {
    return new Promise((resolve, reject) => {
      execFile(this.binPath, args, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  /** Make screenshot of given screen and save it in screenshot dir. */
  async captureScreen(screen: string = this.settings.activeDisplayId) {
    await this.moveAway();

    const { format } = this.settings;
    const filename = this.getScreenShotPath(format);

    // screenshot-desktop always returns string if filename is provided.
    return screenshot({ format, screen, filename }) as Promise<string>;
  }

  private getScreenShotPath(ext: string) {
    const now = new Date().toString();
    const name = sanitize(now, { replacement: ' ' });

    return join(this.settings.screenshotDir, `${name}.${ext}`);
  }
}

// Virtual keys for digits and keys are same on windows and linux.
export const VK_DIGITS: [string, number][] = [
  [k.VK_DIGIT_0, 0x30],
  [k.VK_DIGIT_1, 0x31],
  [k.VK_DIGIT_2, 0x32],
  [k.VK_DIGIT_3, 0x33],
  [k.VK_DIGIT_4, 0x34],
  [k.VK_DIGIT_5, 0x35],
  [k.VK_DIGIT_6, 0x36],
  [k.VK_DIGIT_7, 0x37],
  [k.VK_DIGIT_8, 0x38],
  [k.VK_DIGIT_9, 0x39],
];

export const VK_KEYS: [string, number][] = [
  [k.VK_KEY_Q, 0x51],
  [k.VK_KEY_W, 0x57],
  [k.VK_KEY_E, 0x45],
  [k.VK_KEY_R, 0x52],
  [k.VK_KEY_T, 0x54],
  [k.VK_KEY_Y, 0x59],
  [k.VK_KEY_U, 0x55],
  [k.VK_KEY_I, 0x49],
  [k.VK_KEY_O, 0x4f],
  [k.VK_KEY_P, 0x50],
  [k.VK_KEY_A, 0x41],
  [k.VK_KEY_S, 0x53],
  [k.VK_KEY_D, 0x44],
  [k.VK_KEY_F, 0x46],
  [k.VK_KEY_G, 0x47],
  [k.VK_KEY_H, 0x48],
  [k.VK_KEY_J, 0x4a],
  [k.VK_KEY_K, 0x4b],
  [k.VK_KEY_L, 0x4c],
  [k.VK_KEY_Z, 0x5a],
  [k.VK_KEY_X, 0x58],
  [k.VK_KEY_C, 0x43],
  [k.VK_KEY_V, 0x56],
  [k.VK_KEY_B, 0x42],
  [k.VK_KEY_N, 0x4e],
  [k.VK_KEY_M, 0x4d],
];
