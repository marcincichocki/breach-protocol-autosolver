import { OffsetDirection } from '@/core';
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

export enum Keys {
  Escape,
  Enter,
  Down,
  Up,
  Left,
  Right,
}

export abstract class BreachProtocolRobot {
  abstract readonly keys: Record<Keys, string>;

  private readonly dirs: Record<OffsetDirection, Keys> = {
    left: Keys.Left,
    right: Keys.Right,
    top: Keys.Up,
    bottom: Keys.Down,
  };

  constructor(
    public readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  getKeyFromDir(dir: OffsetDirection) {
    return this.dirs[dir];
  }

  abstract click(): Promise<any>;

  abstract move(x: number, y: number, restart?: boolean): Promise<any>;

  abstract movePointerAway(): Promise<any>;

  abstract exit(): Promise<any>;

  abstract pressKey(key: Keys): Promise<any>;

  sleep(delay: number = this.settings.delay) {
    return new Promise((r) => setTimeout(r, delay));
  }

  async captureScreen(screen: string = this.settings.activeDisplayId) {
    await this.movePointerAway();

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
  private x = 0;
  private y = 0;

  readonly keys = {
    [Keys.Escape]: 'esc',
    [Keys.Enter]: 'enter',
    [Keys.Down]: 'down',
    [Keys.Up]: 'up',
    [Keys.Left]: 'left',
    [Keys.Right]: 'right',
  };

  private readonly bin = './resources/win32/nircmd/nircmd.exe';

  click() {
    return this.nircmd('sendmouse left click');
  }

  async move(x: number, y: number, restart = true) {
    if (restart) {
      await this.movePointerAway();
    }

    const scaling = this.settings.useScaling ? this.scaling : 1;
    const sX = (x - this.x) / scaling;
    const sY = (y - this.y) / scaling;
    const r = await this.moveRelative(sX, sY);

    this.x = x;
    this.y = y;

    return r;
  }

  movePointerAway() {
    this.x = 0;
    this.y = 0;

    return this.moveRelative(-9999, -9999);
  }

  exit() {
    return this.pressKey(Keys.Escape);
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

  pressKey(key: Keys) {
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
