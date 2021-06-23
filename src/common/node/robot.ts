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
  protected abstract readonly keys: Record<BreachProtocolRobotKeys, string>;

  constructor(
    protected readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  /** Click with left mouse button. */
  abstract click(): Promise<any>;

  /** Move cursor to given coordinates. */
  abstract move(x: number, y: number, restart?: boolean): Promise<any>;

  /** Move cursor into top left corner. */
  abstract moveAway(): Promise<any>;

  /** Press given key. */
  abstract pressKey(key: BreachProtocolRobotKeys): Promise<any>;

  /** Wait for given amount of miliseconds. */
  sleep(delay: number = this.settings.delay) {
    return new Promise((r) => setTimeout(r, delay));
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

export class WindowsRobot extends BreachProtocolRobot {
  protected readonly keys = {
    [BreachProtocolRobotKeys.Escape]: 'esc',
    [BreachProtocolRobotKeys.Enter]: 'enter',
    [BreachProtocolRobotKeys.Up]: 'up',
    [BreachProtocolRobotKeys.Down]: 'down',
    [BreachProtocolRobotKeys.Left]: 'left',
    [BreachProtocolRobotKeys.Right]: 'right',
  };

  private x = 0;
  private y = 0;

  private readonly bin = './resources/win32/nircmd/nircmd.exe';

  click() {
    return this.nircmd('sendmouse left click');
  }

  async move(x: number, y: number, restart = true) {
    if (restart) {
      await this.moveAway();
    }

    const scaling = this.settings.useScaling ? this.scaling : 1;
    const sX = (x - this.x) / scaling;
    const sY = (y - this.y) / scaling;
    const r = await this.moveRelative(sX, sY);

    this.x = x;
    this.y = y;

    return r;
  }

  moveAway() {
    this.x = 0;
    this.y = 0;

    return this.moveRelative(-9999, -9999);
  }

  private nircmd(command: string, options = {}) {
    const args = command.split(' ');

    return new Promise((resolve, reject) => {
      execFile(this.bin, args, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private moveRelative(x: number, y: number) {
    return this.nircmd(`sendmouse move ${x} ${y}`);
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.nircmd(`sendkeypress ${this.keys[key]}`);
  }
}

// TODO: Add linux and macos robots
function getPlatformRobot(platform = process.platform) {
  switch (platform) {
    case 'win32':
      return WindowsRobot;
    default:
      return WindowsRobot;
  }
}

export const PlatformRobot = getPlatformRobot();
