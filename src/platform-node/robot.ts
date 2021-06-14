import { Point } from '@/common';
import { BreachProtocolResult } from '@/core';
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

export abstract class Robot {
  constructor(
    protected readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  abstract click(): Promise<any>;

  abstract move(x: number, y: number, restart?: boolean): Promise<any>;

  abstract movePointerAway(): Promise<any>;

  abstract exit(): Promise<any>;

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

export abstract class BreachProtocolRobot extends Robot {
  async resolveBreachProtocol(
    { path, exitStrategy }: BreachProtocolResult,
    squareMap: Map<string, Point>
  ) {
    await this.movePointerAway();

    for (const square of path) {
      const { x, y } = squareMap.get(square);

      await this.move(x, y, false);
      await this.click();
      await this.sleep();
    }

    // Breach protocol exits on its own when sequence fill
    // buffer completly.
    if (!exitStrategy.willExit && this.settings.autoExit) {
      // If buffer is not yet filled, but sequence is finished
      // breach protocol will hang on exit screen. Pressing esc
      // exits it.
      await this.exit();

      // Sometimes sequence does not use every daemon, and there might be
      // a rare case in which sequence ended, but there is still enough space
      // in a buffer to fit leftover daemons. However, since it is impossible
      // to find correct squares, autosolver will stop.
      // To hanlde such case we have to press esc twice: once to stop it, and
      // second time to exit it.
      if (exitStrategy.shouldForceClose) {
        await this.exit();
      }
    }
  }
}

export class WindowsRobot extends BreachProtocolRobot {
  private x = 0;
  private y = 0;

  private readonly bin = './vendor/nircmd/nircmd.exe';

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
    return this.nircmd('sendkeypress esc');
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
