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
  keyEscape: string;
  keyEnter: string;
  keyUp: string;
  keyDown: string;
  keyLeft: string;
  keyRight: string;
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
    [BreachProtocolRobotKeys.Escape]: this.settings.keyEscape,
    [BreachProtocolRobotKeys.Enter]: this.settings.keyEnter,
    [BreachProtocolRobotKeys.Up]: this.settings.keyUp,
    [BreachProtocolRobotKeys.Down]: this.settings.keyDown,
    [BreachProtocolRobotKeys.Left]: this.settings.keyLeft,
    [BreachProtocolRobotKeys.Right]: this.settings.keyRight,
  };

  protected abstract readonly binPath: string;

  constructor(
    protected readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  abstract getMappedKey(key: BreachProtocolRobotKeys): string;

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
