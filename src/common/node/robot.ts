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

  protected abstract readonly binPath: string;

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

  /** Execute robot's engine command and wait. */
  protected async bin(command: string) {
    const args = command.split(' ');
    const data = await this.execBin(args);
    await this.sleep();

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

  /** Wait for given amount of miliseconds. */
  protected sleep(delay: number = this.settings.delay) {
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

  protected readonly binPath = './resources/win32/nircmd/nircmd.exe';

  click() {
    return this.bin('sendmouse left click');
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

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`sendkeypress ${this.keys[key]}`);
  }

  private moveRelative(x: number, y: number) {
    return this.bin(`sendmouse move ${x} ${y}`);
  }
}

export class AhkRobot extends BreachProtocolRobot {
  protected readonly keys = {
    [BreachProtocolRobotKeys.Escape]: 'Escape',
    [BreachProtocolRobotKeys.Enter]: 'Enter',
    [BreachProtocolRobotKeys.Up]: 'Up',
    [BreachProtocolRobotKeys.Down]: 'Down',
    [BreachProtocolRobotKeys.Left]: 'Left',
    [BreachProtocolRobotKeys.Right]: 'Right',
  };

  protected readonly binPath = 'C:/Program Files/AutoHotkey/AutoHotkey.exe';
  private readonly scriptPath = './resources/win32/ahk/robot.ahk';

  override async bin(command: string) {
    const args = [this.scriptPath, ...command.split(' ')];
    const data = await this.execBin(args);
    await this.sleep();

    return data;
  }

  move(x: number, y: number) {
    return this.bin(`move ${x} ${y}`);
  }

  moveAway() {
    return this.bin('move -9999 -9999');
  }

  click() {
    return this.bin('click');
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`send ${this.keys[key]}`);
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
